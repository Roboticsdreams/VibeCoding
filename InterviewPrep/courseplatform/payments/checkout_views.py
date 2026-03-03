"""
Checkout views for order/payment processing.
"""
import json
import logging
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings

from courses.models import Course
from blog.models import BlogPost
from .checkout_service import CheckoutService

logger = logging.getLogger('payments')
from .models import PaymentWebhookEvent, Order


@login_required
def checkout_course(request, course_id):
    """Single course purchase checkout."""
    course = get_object_or_404(Course, id=course_id, is_active=True)
    checkout_service = CheckoutService()
    
    # Check if user already has access
    if checkout_service.check_user_entitlement(request.user, 'COURSE', course_id):
        messages.info(request, 'You already have access to this course!')
        return redirect('courses:detail', slug=course.slug)
    
    if request.method == 'POST':
        try:
            # Create order
            items = [{'type': 'COURSE', 'id': course_id}]
            coupon_code = request.POST.get('coupon_code', None)
            
            order, razorpay_order = checkout_service.create_order(
                user=request.user,
                items=items,
                coupon_code=coupon_code
            )
            
            # Check if we're in test mode
            is_test_mode = razorpay_order['id'].startswith('order_TEST_')
            
            # Return checkout data
            context = {
                'course': course,
                'order': order,
                'razorpay_order_id': razorpay_order['id'],
                'razorpay_key_id': settings.RAZORPAY_KEY_ID or 'test_key',
                'amount': order.total_cents,
                'currency': order.currency,
                'user_name': request.user.get_full_name() or request.user.username,
                'user_email': request.user.email,
                'test_mode': is_test_mode,
            }
            
            return render(request, 'payments/checkout.html', context)
            
        except Exception as e:
            messages.error(request, f'Error creating order: {str(e)}')
            return redirect('courses:detail', slug=course.slug)
    
    # GET request - show checkout preview
    pricing = checkout_service.calculate_order_total([{'type': 'COURSE', 'id': course_id}])
    
    context = {
        'course': course,
        'subtotal': pricing['subtotal_cents'] / 100,
        'discount': pricing['discount_cents'] / 100,
        'tax': pricing['tax_cents'] / 100,
        'total': pricing['total_cents'] / 100,
    }
    
    return render(request, 'payments/checkout_preview.html', context)


@login_required
def checkout_blog(request, blog_id):
    """Single blog purchase checkout."""
    blog_post = get_object_or_404(BlogPost, id=blog_id, status='published', is_paid=True)
    checkout_service = CheckoutService()
    
    # Check if user already has access
    if checkout_service.check_user_entitlement(request.user, 'BLOG', blog_id):
        messages.info(request, 'You already have access to this blog!')
        return redirect('blog:detail', slug=blog_post.slug)
    
    if request.method == 'POST':
        try:
            # Create order
            items = [{'type': 'BLOG', 'id': blog_id}]
            coupon_code = request.POST.get('coupon_code', None)
            
            order, razorpay_order = checkout_service.create_order(
                user=request.user,
                items=items,
                coupon_code=coupon_code
            )
            
            # Check if we're in test mode
            is_test_mode = razorpay_order['id'].startswith('order_TEST_')
            
            context = {
                'blog_post': blog_post,
                'order': order,
                'razorpay_order_id': razorpay_order['id'],
                'razorpay_key_id': settings.RAZORPAY_KEY_ID or 'test_key',
                'amount': order.total_cents,
                'currency': order.currency,
                'user_name': request.user.get_full_name() or request.user.username,
                'user_email': request.user.email,
                'test_mode': is_test_mode,
            }
            
            return render(request, 'payments/checkout.html', context)
            
        except Exception as e:
            messages.error(request, f'Error creating order: {str(e)}')
            return redirect('blog:detail', slug=blog_post.slug)
    
    # GET request - show checkout preview
    pricing = checkout_service.calculate_order_total([{'type': 'BLOG', 'id': blog_id}])
    
    context = {
        'blog_post': blog_post,
        'subtotal': pricing['subtotal_cents'] / 100,
        'discount': pricing['discount_cents'] / 100,
        'tax': pricing['tax_cents'] / 100,
        'total': pricing['total_cents'] / 100,
    }
    
    return render(request, 'payments/checkout_preview.html', context)


@login_required
@require_POST
def verify_payment(request):
    """Verify payment after Razorpay success callback."""
    try:
        razorpay_order_id = request.POST.get('razorpay_order_id')
        razorpay_payment_id = request.POST.get('razorpay_payment_id')
        razorpay_signature = request.POST.get('razorpay_signature')
        
        logger.info(f"Payment verification attempt - Order: {razorpay_order_id}, Payment: {razorpay_payment_id}")
        
        if not razorpay_order_id or not razorpay_payment_id:
            messages.error(request, 'Missing payment information.')
            return redirect('accounts:dashboard')
        
        checkout_service = CheckoutService()
        success = checkout_service.process_payment_success(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        )
        
        if success:
            logger.info(f"Payment verified successfully: {razorpay_order_id}")
            messages.success(request, 'Payment successful! You now have access to your purchase.')
            return redirect('payments:payment_success')
        else:
            logger.error(f"Payment verification failed: {razorpay_order_id}")
            messages.error(request, 'Payment verification failed. Please contact support.')
            return redirect('payments:payment_failed')
            
    except Exception as e:
        logger.error(f'Payment verification exception: {str(e)}', exc_info=True)
        messages.error(request, f'Payment verification error: {str(e)}')
        return redirect('payments:payment_failed')


@csrf_exempt
@require_POST
def razorpay_webhook(request):
    """
    Razorpay webhook handler with idempotency.
    Handles payment.captured, payment.failed events.
    """
    try:
        # Get webhook data
        webhook_body = request.body.decode('utf-8')
        webhook_signature = request.headers.get('X-Razorpay-Signature', '')
        
        # Verify webhook signature
        checkout_service = CheckoutService()
        if not checkout_service.verify_webhook_signature(webhook_body, webhook_signature):
            return HttpResponse('Invalid signature', status=400)
        
        # Parse webhook data
        webhook_data = json.loads(webhook_body)
        event_type = webhook_data.get('event')
        provider_event_id = webhook_data.get('payload', {}).get('payment', {}).get('entity', {}).get('id')
        
        # Idempotency check
        event, created = PaymentWebhookEvent.objects.get_or_create(
            provider='razorpay',
            provider_event_id=provider_event_id,
            defaults={
                'event_type': event_type,
                'payload': webhook_data,
            }
        )
        
        if not created:
            # Already processed
            return HttpResponse('Event already processed', status=200)
        
        # Process event
        if event_type == 'payment.captured':
            payment_entity = webhook_data['payload']['payment']['entity']
            razorpay_order_id = payment_entity.get('order_id')
            razorpay_payment_id = payment_entity.get('id')
            
            # Process payment (no signature needed for webhook)
            try:
                payment_intent = checkout_service.razorpay_client.order.fetch(razorpay_order_id)
                # Mark as processed in our system
                checkout_service.process_payment_success(
                    razorpay_order_id,
                    razorpay_payment_id,
                    ''  # Signature not needed for webhooks
                )
                event.processed = True
                event.save()
            except Exception as e:
                return HttpResponse(f'Processing error: {str(e)}', status=500)
        
        elif event_type == 'payment.failed':
            # Log payment failure
            payment_entity = webhook_data['payload']['payment']['entity']
            # Could update PaymentAttempt to FAILED status here
            event.processed = True
            event.save()
        
        return HttpResponse('OK', status=200)
        
    except Exception as e:
        return HttpResponse(f'Webhook error: {str(e)}', status=500)


@login_required
def payment_success(request):
    """Success page after payment."""
    return render(request, 'payments/success.html')


@login_required
def payment_failed(request):
    """Failed payment page."""
    return render(request, 'payments/failed.html')
