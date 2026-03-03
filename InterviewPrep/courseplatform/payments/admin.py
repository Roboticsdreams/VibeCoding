from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'amount', 'status', 'razorpay_order_id', 'created_at']
    list_filter = ['status', 'created_at', 'currency']
    search_fields = ['user__username', 'user__email', 'razorpay_order_id', 'razorpay_payment_id']
    readonly_fields = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User & Course', {
            'fields': ('user', 'course')
        }),
        ('Payment Details', {
            'fields': ('amount', 'currency', 'status')
        }),
        ('Razorpay Information', {
            'fields': ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
