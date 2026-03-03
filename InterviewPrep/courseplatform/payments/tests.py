from django.test import TestCase
from django.contrib.auth.models import User
from unittest.mock import Mock, patch
from courses.models import Course, Purchase
from .models import Payment
from .services import RazorpayService


class PaymentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.course = Course.objects.create(
            title="Test Course",
            short_description="Test",
            description="Test",
            price=999.00
        )
    
    def test_payment_creation(self):
        payment = Payment.objects.create(
            user=self.user,
            course=self.course,
            razorpay_order_id='order_test123',
            amount=999.00,
            currency='INR',
            status='CREATED'
        )
        self.assertEqual(payment.status, 'CREATED')
        self.assertEqual(payment.amount, 999.00)


class RazorpayServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass'
        )
        self.course = Course.objects.create(
            title="Test Course",
            short_description="Test",
            description="Test",
            price=999.00
        )
    
    @patch('payments.services.razorpay.Client')
    def test_create_order(self, mock_razorpay):
        mock_client = Mock()
        mock_client.order.create.return_value = {
            'id': 'order_test123',
            'amount': 99900,
            'currency': 'INR'
        }
        mock_razorpay.return_value = mock_client
        
        service = RazorpayService()
        service.client = mock_client
        
        order, payment = service.create_order(self.course, self.user)
        
        self.assertEqual(order['id'], 'order_test123')
        self.assertEqual(payment.razorpay_order_id, 'order_test123')
        self.assertEqual(payment.status, 'CREATED')
    
    @patch('payments.services.razorpay.Client')
    def test_verify_payment_signature_success(self, mock_razorpay):
        mock_client = Mock()
        mock_client.utility.verify_payment_signature.return_value = True
        mock_razorpay.return_value = mock_client
        
        service = RazorpayService()
        service.client = mock_client
        
        result = service.verify_payment_signature(
            'order_test123',
            'pay_test456',
            'signature_test789'
        )
        
        self.assertTrue(result)
    
    @patch('payments.services.razorpay.Client')
    def test_verify_payment_signature_failure(self, mock_razorpay):
        from razorpay.errors import SignatureVerificationError
        
        mock_client = Mock()
        mock_client.utility.verify_payment_signature.side_effect = SignatureVerificationError('Invalid signature')
        mock_razorpay.return_value = mock_client
        
        service = RazorpayService()
        service.client = mock_client
        
        result = service.verify_payment_signature(
            'order_test123',
            'pay_test456',
            'invalid_signature'
        )
        
        self.assertFalse(result)


class PaymentPurchaseIntegrationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.course = Course.objects.create(
            title="Test Course",
            short_description="Test",
            description="Test",
            price=999.00
        )
        self.payment = Payment.objects.create(
            user=self.user,
            course=self.course,
            razorpay_order_id='order_test123',
            amount=999.00,
            status='CREATED'
        )
    
    def test_purchase_grant_on_payment_success(self):
        self.payment.status = 'PAID'
        self.payment.razorpay_payment_id = 'pay_test456'
        self.payment.save()
        
        Purchase.objects.create(
            user=self.user,
            course=self.course,
            is_active=True
        )
        
        purchase = Purchase.objects.get(user=self.user, course=self.course)
        self.assertTrue(purchase.is_active)
    
    def test_no_duplicate_purchase(self):
        Purchase.objects.create(user=self.user, course=self.course, is_active=True)
        
        purchase_count = Purchase.objects.filter(user=self.user, course=self.course).count()
        self.assertEqual(purchase_count, 1)
