from django.db import models
from django.contrib.auth.models import User
from courses.models import Course

# Import new order/entitlement models
from .order_models import (
    Order,
    OrderItem,
    PaymentIntent,
    PaymentAttempt,
    CourseEntitlement,
    BlogEntitlement,
    Coupon,
    CouponRedemption,
    Refund,
    PaymentWebhookEvent,
)


class Payment(models.Model):
    """Legacy payment model - kept for backward compatibility."""
    STATUS_CHOICES = [
        ('CREATED', 'Created'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    
    razorpay_order_id = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=200, blank=True, null=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='CREATED')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.razorpay_order_id} - {self.status}"
