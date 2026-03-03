from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic import CreateView
from django.urls import reverse_lazy
from django.contrib import messages
from .forms import SignUpForm
from courses.models import Purchase
from blog.models import BlogPost
from payments.models import CourseEntitlement, BlogEntitlement


class SignUpView(CreateView):
    form_class = SignUpForm
    template_name = 'accounts/signup.html'
    success_url = reverse_lazy('accounts:login')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Account created successfully! Please login.')
        return response


class CustomLoginView(LoginView):
    template_name = 'accounts/login.html'
    redirect_authenticated_user = True
    
    def form_valid(self, form):
        messages.success(self.request, f'Welcome back, {form.get_user().username}!')
        return super().form_valid(form)


@login_required
def dashboard_view(request):
    # Get courses from new entitlement system (is_active is a property, not a field)
    course_entitlements = CourseEntitlement.objects.filter(
        user=request.user,
        revoked_at__isnull=True
    ).select_related('course')
    
    # Also get legacy purchases for backward compatibility
    legacy_purchases = Purchase.objects.filter(
        user=request.user, 
        is_active=True
    ).select_related('course')
    
    # Combine both (unique courses)
    purchased_course_ids = set(
        list(course_entitlements.values_list('course_id', flat=True)) +
        list(legacy_purchases.values_list('course_id', flat=True))
    )
    
    from courses.models import Course
    purchased_courses_list = Course.objects.filter(id__in=purchased_course_ids)
    
    # Get only free blogs for dashboard
    free_blogs = BlogPost.objects.filter(
        status='published',
        is_paid=False
    ).select_related('author')[:6]
    
    # Get purchased blogs (is_active is a property, not a field)
    blog_entitlements = BlogEntitlement.objects.filter(
        user=request.user,
        revoked_at__isnull=True
    ).select_related('blog_post')
    
    recent_blogs = BlogPost.objects.filter(
        status='published'
    ).select_related('author')[:4]
    
    context = {
        'purchased_courses': purchased_courses_list,
        'purchased_blogs': blog_entitlements,
        'free_blogs': free_blogs,
        'recent_blogs': recent_blogs,
        'total_courses': len(purchased_course_ids),
    }
    
    return render(request, 'accounts/dashboard.html', context)


@login_required
def profile_view(request):
    context = {
        'user': request.user,
    }
    
    return render(request, 'accounts/profile.html', context)


@login_required
def payment_history_view(request):
    """Display user's payment history from new Order system."""
    from payments.models import Order, OrderItem
    
    orders = Order.objects.filter(
        user=request.user
    ).prefetch_related('items__course', 'items__blog_post').order_by('-created_at')
    
    context = {
        'orders': orders,
    }
    
    return render(request, 'accounts/payment_history.html', context)
