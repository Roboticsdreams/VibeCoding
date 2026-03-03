"""
Checkout service for Udemy-style order/entitlement system.
Handles order creation, payment processing, and entitlement grants.
"""
try:
    import razorpay
    RAZORPAY_AVAILABLE = True
except ImportError:
    RAZORPAY_AVAILABLE = False
    razorpay = None

import hmac
import hashlib
import logging
from decimal import Decimal
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import (
    Order, OrderItem, PaymentIntent, PaymentAttempt,
    CourseEntitlement, BlogEntitlement, Coupon
)
from courses.models import Course
from blog.models import BlogPost

logger = logging.getLogger('payments')


class CheckoutService:
    """Handles complete checkout flow with order/entitlement system."""
    
    def __init__(self):
        if not RAZORPAY_AVAILABLE:
            logger.error("Razorpay module not available. Install with: pip install razorpay")
            self.razorpay_client = None
            return
        
        # Check if credentials are configured
        if not settings.RAZORPAY_KEY_ID or settings.RAZORPAY_KEY_ID == 'your_razorpay_key_id':
            logger.warning("Razorpay credentials not configured. Using test mode.")
            self.razorpay_client = None
        else:
            try:
                self.razorpay_client = razorpay.Client(
                    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
                )
            except Exception as e:
                logger.error(f"Failed to initialize Razorpay client: {str(e)}")
                self.razorpay_client = None
    
    def calculate_order_total(self, items, coupon_code=None):
        """
        Calculate order totals with discounts.
        items = [{'type': 'COURSE', 'id': 1}, {'type': 'BLOG', 'id': 2}]
        """
        subtotal_cents = 0
        item_details = []
        
        for item in items:
            if item['type'] == 'COURSE':
                obj = Course.objects.get(id=item['id'])
                price = obj.price
            else:  # BLOG
                obj = BlogPost.objects.get(id=item['id'])
                price = obj.price
            
            # Convert Decimal to cents (handle Decimal properly)
            price_cents = int(float(price) * 100)
            subtotal_cents += price_cents
            
            item_details.append({
                'type': item['type'],
                'object': obj,
                'list_price_cents': price_cents,
                'sale_price_cents': price_cents,  # Before coupon
            })
        
        # Apply coupon
        discount_cents = 0
        coupon = None
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code, is_active=True)
                if coupon.is_valid():
                    if coupon.discount_type == 'PERCENT':
                        discount_cents = int(int(subtotal_cents) * int(coupon.discount_value) / 100)
                    else:  # FIXED
                        discount_cents = int(min(int(coupon.discount_value), int(subtotal_cents)))
            except Coupon.DoesNotExist:
                pass
        
        # Simple tax calculation (18% GST) - ensure all values are integers
        taxable_amount = int(subtotal_cents) - int(discount_cents)
        tax_cents = int(taxable_amount * 0.18)
        
        total_cents = int(subtotal_cents) - int(discount_cents) + int(tax_cents)
        
        return {
            'subtotal_cents': int(subtotal_cents),
            'discount_cents': int(discount_cents),
            'tax_cents': int(tax_cents),
            'total_cents': int(total_cents),
            'item_details': item_details,
            'coupon': coupon,
        }
    
    @transaction.atomic
    def create_order(self, user, items, coupon_code=None):
        """
        Create order with snapshot pricing and Razorpay payment intent.
        Returns (order, razorpay_order_data)
        """
        # Calculate totals
        pricing = self.calculate_order_total(items, coupon_code)
        
        # Create Order - explicitly convert all cents values to int
        order = Order.objects.create(
            user=user,
            currency='INR',
            subtotal_cents=int(pricing['subtotal_cents']),
            discount_cents=int(pricing['discount_cents']),
            tax_cents=int(pricing['tax_cents']),
            total_cents=int(pricing['total_cents']),
            status='CREATED',
            coupon=pricing['coupon'],
        )
        
        # Create OrderItems (snapshot prices) - explicitly convert all to int
        for item_detail in pricing['item_details']:
            obj = item_detail['object']
            if item_detail['type'] == 'COURSE':
                OrderItem.objects.create(
                    order=order,
                    item_type='COURSE',
                    course=obj,
                    list_price_cents=int(item_detail['list_price_cents']),
                    sale_price_cents=int(item_detail['sale_price_cents']),
                    final_price_cents=int(item_detail['sale_price_cents']),
                )
            else:  # BLOG
                OrderItem.objects.create(
                    order=order,
                    item_type='BLOG',
                    blog_post=obj,
                    list_price_cents=int(item_detail['list_price_cents']),
                    sale_price_cents=int(item_detail['sale_price_cents']),
                    final_price_cents=int(item_detail['sale_price_cents']),
                )
        
        # Create Razorpay order or use test mode
        razorpay_order_data = {
            'amount': int(pricing['total_cents']),
            'currency': 'INR',
            'receipt': f'order_{order.id}',
            'notes': {
                'order_id': order.id,
                'user_id': user.id,
                'user_email': user.email,
            }
        }
        
        # Check if Razorpay is configured
        if self.razorpay_client is None:
            # Test/Demo mode - create mock Razorpay order
            logger.warning(f"Razorpay not configured. Creating test order for Order {order.id}")
            
            razorpay_order = {
                'id': f'order_TEST_{order.id}',
                'entity': 'order',
                'amount': pricing['total_cents'],
                'currency': 'INR',
                'status': 'created',
            }
            
            # Create PaymentIntent in test mode
            payment_intent = PaymentIntent.objects.create(
                order=order,
                provider='razorpay',
                provider_intent_id=razorpay_order['id'],
                amount_cents=pricing['total_cents'],
                currency='INR',
                status='REQUIRES_PAYMENT',
            )
            
            order.status = 'PAYMENT_PENDING'
            order.save()
            
            logger.info(f"TEST Order {order.id} created for user {user.username}, total: ₹{pricing['total_cents']/100}")
            
            return order, razorpay_order
        
        try:
            # Log the data being sent to Razorpay for debugging
            logger.info(f"Creating Razorpay order with data: {razorpay_order_data}")
            
            razorpay_order = self.razorpay_client.order.create(data=razorpay_order_data)
            
            logger.info(f"Razorpay order created successfully: {razorpay_order['id']}")
            
            # Create PaymentIntent
            payment_intent = PaymentIntent.objects.create(
                order=order,
                provider='razorpay',
                provider_intent_id=razorpay_order['id'],
                amount_cents=int(pricing['total_cents']),
                currency='INR',
                status='REQUIRES_PAYMENT',
            )
            
            # Update order status
            order.status = 'PAYMENT_PENDING'
            order.save()
            
            logger.info(f"Order {order.id} created for user {user.username}, total: ₹{pricing['total_cents']/100}")
            
            return order, razorpay_order
            
        except Exception as e:
            logger.error(f"Failed to create Razorpay order for Order {order.id}: {str(e)}", exc_info=True)
            order.status = 'CANCELLED'
            order.save()
            raise
    
    @transaction.atomic
    def process_payment_success(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """
        Process successful payment and grant entitlements.
        Called after payment verification.
        """
        # Check if this is a test order
        is_test_order = razorpay_order_id.startswith('order_TEST_')
        
        # Verify signature (skip for test orders)
        if not is_test_order:
            if not self.verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
                logger.error(f"Payment signature verification failed: {razorpay_order_id}")
                return False
        else:
            logger.info(f"Test mode payment - skipping signature verification: {razorpay_order_id}")
        
        # Get payment intent
        try:
            payment_intent = PaymentIntent.objects.select_related('order').get(
                provider_intent_id=razorpay_order_id
            )
        except PaymentIntent.DoesNotExist:
            logger.error(f"PaymentIntent not found for Razorpay order: {razorpay_order_id}")
            return False
        
        # Prevent duplicate processing
        if payment_intent.status == 'SUCCEEDED':
            logger.warning(f"Payment already processed: {razorpay_order_id}")
            return True
        
        # Create payment attempt
        PaymentAttempt.objects.create(
            payment_intent=payment_intent,
            provider_payment_id=razorpay_payment_id,
            status='CAPTURED',
        )
        
        # Update payment intent and order
        payment_intent.status = 'SUCCEEDED'
        payment_intent.save()
        
        order = payment_intent.order
        order.status = 'PAID'
        order.paid_at = timezone.now()
        order.save()
        
        # Grant entitlements for each item
        for order_item in order.items.all():
            if order_item.item_type == 'COURSE':
                CourseEntitlement.objects.get_or_create(
                    user=order.user,
                    course=order_item.course,
                    defaults={'order_item': order_item}
                )
                logger.info(f"Course entitlement granted: {order.user.username} → {order_item.course.title}")
            else:  # BLOG
                BlogEntitlement.objects.get_or_create(
                    user=order.user,
                    blog_post=order_item.blog_post,
                    defaults={'order_item': order_item}
                )
                logger.info(f"Blog entitlement granted: {order.user.username} → {order_item.blog_post.title}")
        
        logger.info(f"Order {order.id} completed successfully")
        return True
    
    def verify_payment_signature(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """Verify Razorpay payment signature."""
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            self.razorpay_client.utility.verify_payment_signature(params_dict)
            return True
        except razorpay.errors.SignatureVerificationError:
            return False
    
    def verify_webhook_signature(self, webhook_body, webhook_signature):
        """Verify webhook signature for idempotency."""
        expected_signature = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode('utf-8'),
            webhook_body.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_signature, webhook_signature)
    
    def check_user_entitlement(self, user, item_type, item_id):
        """Check if user has access to a course or blog."""
        if item_type == 'COURSE':
            return CourseEntitlement.objects.filter(
                user=user,
                course_id=item_id,
                revoked_at__isnull=True
            ).exists()
        else:  # BLOG
            return BlogEntitlement.objects.filter(
                user=user,
                blog_post_id=item_id,
                revoked_at__isnull=True
            ).exists()
