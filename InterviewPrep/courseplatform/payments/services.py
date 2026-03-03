try:
    import razorpay
    RAZORPAY_AVAILABLE = True
except ImportError as e:
    RAZORPAY_AVAILABLE = False
    RAZORPAY_IMPORT_ERROR = str(e)

import hmac
import hashlib
import logging
from django.conf import settings
from .models import Payment

logger = logging.getLogger('payments')


class RazorpayService:
    def __init__(self):
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    
    def create_order(self, course, user):
        amount_in_paise = course.get_price_in_paise()
        
        order_data = {
            'amount': amount_in_paise,
            'currency': 'INR',
            'receipt': f'course_{course.id}_user_{user.id}',
            'notes': {
                'course_id': course.id,
                'course_title': course.title,
                'user_id': user.id,
                'user_email': user.email
            }
        }
        
        try:
            razorpay_order = self.client.order.create(data=order_data)
            
            payment = Payment.objects.create(
                user=user,
                course=course,
                razorpay_order_id=razorpay_order['id'],
                amount=course.price,
                currency='INR',
                status='CREATED'
            )
            
            logger.info(f"Order created: {razorpay_order['id']} for user {user.username} - Course: {course.title}")
            
            return razorpay_order, payment
        
        except Exception as e:
            logger.error(f"Order creation failed for user {user.username} - Course: {course.title}. Error: {str(e)}")
            raise
    
    def verify_payment_signature(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            
            self.client.utility.verify_payment_signature(params_dict)
            
            logger.info(f"Payment signature verified for order: {razorpay_order_id}")
            return True
        
        except razorpay.errors.SignatureVerificationError:
            logger.error(f"Signature verification failed for order: {razorpay_order_id}")
            return False
    
    def verify_webhook_signature(self, webhook_body, webhook_signature):
        expected_signature = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode('utf-8'),
            webhook_body.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, webhook_signature)
