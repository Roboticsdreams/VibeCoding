import json
import logging
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from django.conf import settings
from django.db import transaction
from courses.models import Course, Purchase
from .models import Payment
from .services import RazorpayService

logger = logging.getLogger('payments')


@login_required
def checkout_view(request, course_id):
    course = get_object_or_404(Course, id=course_id, is_active=True)
    
    existing_purchase = Purchase.objects.filter(
        user=request.user,
        course=course,
        is_active=True
    ).exists()
    
    if existing_purchase:
        messages.info(request, 'You already own this course!')
        return redirect('courses:detail', slug=course.slug)
    
    razorpay_service = RazorpayService()
    
    try:
        razorpay_order, payment = razorpay_service.create_order(course, request.user)
        
        context = {
            'course': course,
            'razorpay_order_id': razorpay_order['id'],
            'razorpay_key_id': settings.RAZORPAY_KEY_ID,
            'amount': razorpay_order['amount'],
            'currency': razorpay_order['currency'],
            'user_name': request.user.get_full_name() or request.user.username,
            'user_email': request.user.email,
        }
        
        return render(request, 'payments/checkout.html', context)
    
    except Exception as e:
        logger.error(f"Checkout error for user {request.user.username}: {str(e)}")
        messages.error(request, 'Failed to initiate payment. Please try again.')
        return redirect('courses:detail', slug=course.slug)


@login_required
@require_POST
def verify_payment_view(request):
    razorpay_order_id = request.POST.get('razorpay_order_id')
    razorpay_payment_id = request.POST.get('razorpay_payment_id')
    razorpay_signature = request.POST.get('razorpay_signature')
    
    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
        messages.error(request, 'Invalid payment data received.')
        return redirect('payments:failed')
    
    try:
        payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
    except Payment.DoesNotExist:
        messages.error(request, 'Payment record not found.')
        return redirect('payments:failed')
    
    if payment.user != request.user:
        messages.error(request, 'Unauthorized access.')
        return redirect('payments:failed')
    
    if payment.status == 'PAID':
        messages.info(request, 'This payment has already been processed.')
        return redirect('payments:success')
    
    razorpay_service = RazorpayService()
    is_valid = razorpay_service.verify_payment_signature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    )
    
    if is_valid:
        with transaction.atomic():
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'PAID'
            payment.save()
            
            Purchase.objects.get_or_create(
                user=request.user,
                course=payment.course,
                defaults={'is_active': True}
            )
        
        logger.info(f"Payment successful: {razorpay_payment_id} - User: {request.user.username} - Course: {payment.course.title}")
        messages.success(request, f'Payment successful! You now have access to {payment.course.title}.')
        return redirect('payments:success')
    else:
        payment.status = 'FAILED'
        payment.save()
        
        logger.warning(f"Payment verification failed: {razorpay_order_id} - User: {request.user.username}")
        messages.error(request, 'Payment verification failed. Please contact support.')
        return redirect('payments:failed')


@login_required
def payment_success_view(request):
    return render(request, 'payments/success.html')


@login_required
def payment_failed_view(request):
    return render(request, 'payments/failed.html')


@csrf_exempt
@require_POST
def webhook_view(request):
    webhook_signature = request.headers.get('X-Razorpay-Signature', '')
    webhook_body = request.body.decode('utf-8')
    
    razorpay_service = RazorpayService()
    
    if not razorpay_service.verify_webhook_signature(webhook_body, webhook_signature):
        logger.warning('Webhook signature verification failed')
        return HttpResponse(status=400)
    
    try:
        event_data = json.loads(webhook_body)
        event_type = event_data.get('event')
        
        if event_type == 'payment.captured':
            payment_entity = event_data['payload']['payment']['entity']
            order_id = payment_entity.get('order_id')
            payment_id = payment_entity.get('id')
            
            try:
                payment = Payment.objects.get(razorpay_order_id=order_id)
                
                if payment.status != 'PAID':
                    with transaction.atomic():
                        payment.razorpay_payment_id = payment_id
                        payment.status = 'PAID'
                        payment.save()
                        
                        Purchase.objects.get_or_create(
                            user=payment.user,
                            course=payment.course,
                            defaults={'is_active': True}
                        )
                    
                    logger.info(f"Webhook: Payment captured - {payment_id}")
            
            except Payment.DoesNotExist:
                logger.error(f"Webhook: Payment not found for order {order_id}")
        
        elif event_type == 'payment.failed':
            payment_entity = event_data['payload']['payment']['entity']
            order_id = payment_entity.get('order_id')
            
            try:
                payment = Payment.objects.get(razorpay_order_id=order_id)
                payment.status = 'FAILED'
                payment.save()
                
                logger.info(f"Webhook: Payment failed - {order_id}")
            
            except Payment.DoesNotExist:
                logger.error(f"Webhook: Payment not found for order {order_id}")
        
        return HttpResponse(status=200)
    
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        return HttpResponse(status=500)
