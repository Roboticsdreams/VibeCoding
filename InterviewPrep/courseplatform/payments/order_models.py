"""
Order and Entitlement models for Udemy-style purchasing.
Supports courses and blogs with proper price snapshots and access control.
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from courses.models import Course
from blog.models import BlogPost


class Order(models.Model):
    """Represents a checkout session (can contain multiple items)."""
    
    STATUS_CHOICES = [
        ('CREATED', 'Created'),
        ('PAYMENT_PENDING', 'Payment Pending'),
        ('PAID', 'Paid'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
        ('PARTIALLY_REFUNDED', 'Partially Refunded'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    
    currency = models.CharField(max_length=3, default='INR')
    subtotal_cents = models.IntegerField(help_text='Subtotal in smallest currency unit (paise)')
    discount_cents = models.IntegerField(default=0)
    tax_cents = models.IntegerField(default=0)
    total_cents = models.IntegerField(help_text='Final amount to charge')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CREATED')
    coupon = models.ForeignKey('Coupon', on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.id} - {self.user.username} - {self.status}"
    
    @property
    def total_amount(self):
        """Return total in rupees (for display)."""
        return self.total_cents / 100


class OrderItem(models.Model):
    """Individual course or blog in an order with snapshot pricing."""
    
    ITEM_TYPE_CHOICES = [
        ('COURSE', 'Course'),
        ('BLOG', 'Blog Post'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    
    # Polymorphic: can be course or blog
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE_CHOICES)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, null=True, blank=True)
    
    # SNAPSHOT fields (never change after creation)
    list_price_cents = models.IntegerField(help_text='Original list price')
    sale_price_cents = models.IntegerField(help_text='Price after discounts')
    final_price_cents = models.IntegerField(help_text='Final price after tax allocation')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [['order', 'item_type', 'course'], ['order', 'item_type', 'blog_post']]
    
    def __str__(self):
        item_name = self.course.title if self.course else self.blog_post.title
        return f"{self.item_type}: {item_name}"
    
    @property
    def item(self):
        """Return the actual course or blog object."""
        return self.course if self.item_type == 'COURSE' else self.blog_post


class PaymentIntent(models.Model):
    """Logical payment for an order (may have multiple attempts)."""
    
    STATUS_CHOICES = [
        ('REQUIRES_PAYMENT', 'Requires Payment'),
        ('PROCESSING', 'Processing'),
        ('SUCCEEDED', 'Succeeded'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    PROVIDER_CHOICES = [
        ('razorpay', 'Razorpay'),
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payment_intents')
    
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default='razorpay')
    provider_intent_id = models.CharField(max_length=255, blank=True, help_text='Gateway order_id')
    
    amount_cents = models.IntegerField()
    currency = models.CharField(max_length=3, default='INR')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REQUIRES_PAYMENT')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment #{self.id} - Order #{self.order_id} - {self.status}"


class PaymentAttempt(models.Model):
    """Individual payment tries (card, UPI, netbanking, retries)."""
    
    STATUS_CHOICES = [
        ('INITIATED', 'Initiated'),
        ('AUTHORIZED', 'Authorized'),
        ('CAPTURED', 'Captured'),
        ('FAILED', 'Failed'),
    ]
    
    payment_intent = models.ForeignKey(PaymentIntent, on_delete=models.CASCADE, related_name='attempts')
    
    provider_payment_id = models.CharField(max_length=255, blank=True)
    method = models.CharField(max_length=50, blank=True, help_text='card, upi, wallet, etc.')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='INITIATED')
    
    failure_code = models.CharField(max_length=100, blank=True)
    failure_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Attempt {self.id} - {self.method} - {self.status}"


class CourseEntitlement(models.Model):
    """Course access granted after successful payment."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_entitlements')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='entitlements')
    order_item = models.ForeignKey(OrderItem, on_delete=models.SET_NULL, null=True, blank=True)
    
    granted_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True, help_text='Set on refund')
    
    class Meta:
        unique_together = ['user', 'course']
    
    def __str__(self):
        return f"{self.user.username} → {self.course.title}"
    
    @property
    def is_active(self):
        return self.revoked_at is None


class BlogEntitlement(models.Model):
    """Blog access granted after successful payment (for paid blogs)."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_entitlements')
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='entitlements')
    order_item = models.ForeignKey(OrderItem, on_delete=models.SET_NULL, null=True, blank=True)
    
    granted_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'blog_post']
    
    def __str__(self):
        return f"{self.user.username} → {self.blog_post.title}"
    
    @property
    def is_active(self):
        return self.revoked_at is None


class Coupon(models.Model):
    """Discount coupons for promotions."""
    
    DISCOUNT_TYPE_CHOICES = [
        ('PERCENT', 'Percentage'),
        ('FIXED', 'Fixed Amount'),
    ]
    
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.IntegerField(help_text='Percentage (0-100) or fixed amount in cents')
    
    currency = models.CharField(max_length=3, default='INR', blank=True)
    max_redemptions = models.IntegerField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.code
    
    def is_valid(self):
        """Check if coupon is still valid."""
        if not self.is_active:
            return False
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        if self.max_redemptions:
            redemptions = self.redemptions.count()
            if redemptions >= self.max_redemptions:
                return False
        return True


class CouponRedemption(models.Model):
    """Track coupon usage."""
    
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='redemptions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True)
    
    redeemed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.coupon.code} - {self.user.username}"


class Refund(models.Model):
    """Refund tracking (full or partial)."""
    
    STATUS_CHOICES = [
        ('REQUESTED', 'Requested'),
        ('PROCESSING', 'Processing'),
        ('SUCCEEDED', 'Succeeded'),
        ('FAILED', 'Failed'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='refunds')
    payment_intent = models.ForeignKey(PaymentIntent, on_delete=models.SET_NULL, null=True, blank=True)
    
    amount_cents = models.IntegerField()
    currency = models.CharField(max_length=3, default='INR')
    
    provider_refund_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REQUESTED')
    reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Refund #{self.id} - Order #{self.order_id} - {self.status}"


class PaymentWebhookEvent(models.Model):
    """Webhook events for idempotency and audit trail."""
    
    provider = models.CharField(max_length=20)
    provider_event_id = models.CharField(max_length=255)
    event_type = models.CharField(max_length=100)
    payload = models.JSONField()
    
    received_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['provider', 'provider_event_id']
    
    def __str__(self):
        return f"{self.provider} - {self.event_type} - {self.provider_event_id}"
