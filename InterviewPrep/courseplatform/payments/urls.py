from django.urls import path
from . import views
from . import checkout_views

app_name = 'payments'

urlpatterns = [
    # Legacy payment URLs
    path('checkout/<int:course_id>/', views.checkout_view, name='checkout'),
    path('verify/', views.verify_payment_view, name='verify'),
    path('success/', views.payment_success_view, name='success'),
    path('failed/', views.payment_failed_view, name='failed'),
    path('webhook/', views.webhook_view, name='webhook'),
    
    # New checkout system URLs
    path('checkout/course/<int:course_id>/', checkout_views.checkout_course, name='checkout_course'),
    path('checkout/blog/<int:blog_id>/', checkout_views.checkout_blog, name='checkout_blog'),
    path('verify-payment/', checkout_views.verify_payment, name='verify_payment'),
    path('webhook/razorpay/', checkout_views.razorpay_webhook, name='razorpay_webhook'),
    path('payment-success/', checkout_views.payment_success, name='payment_success'),
    path('payment-failed/', checkout_views.payment_failed, name='payment_failed'),
]
