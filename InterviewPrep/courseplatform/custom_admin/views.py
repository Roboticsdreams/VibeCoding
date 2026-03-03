from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.db.models import Count, Sum, Q
from courses.models import Course, Lesson
from blog.models import BlogPost
from payments.models import Payment
from django.contrib.auth.models import User

from .forms import BlogPostForm, CourseForm


def is_staff_user(user):
    """Check if user is staff/admin"""
    return user.is_staff or user.is_superuser


def admin_login_view(request):
    """Custom admin login view"""
    if request.user.is_authenticated and is_staff_user(request.user):
        return redirect('custom_admin:dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            if is_staff_user(user):
                login(request, user)
                return redirect('custom_admin:dashboard')
            else:
                messages.error(request, 'You do not have admin privileges.')
        else:
            messages.error(request, 'Invalid username or password.')
    
    return render(request, 'custom_admin/login.html')


@login_required
@user_passes_test(is_staff_user, login_url='/admin-portal/login/')
def admin_dashboard_view(request):
    """Custom admin dashboard view"""
    
    # Get statistics
    total_users = User.objects.count()
    total_courses = Course.objects.count()
    total_lessons = Lesson.objects.count()
    total_blog_posts = BlogPost.objects.count()
    
    # Payment statistics
    total_payments = Payment.objects.filter(status='PAID').count()
    total_revenue = Payment.objects.filter(status='PAID').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Recent payments
    recent_payments = Payment.objects.select_related('user', 'course').order_by('-created_at')[:10]
    
    # Recent users
    recent_users = User.objects.order_by('-date_joined')[:10]
    
    # Course statistics
    courses_with_sales = Course.objects.annotate(
        sales_count=Count('payments', filter=Q(payments__status='PAID'))
    ).order_by('-sales_count')[:5]
    
    context = {
        'total_users': total_users,
        'total_courses': total_courses,
        'total_lessons': total_lessons,
        'total_blog_posts': total_blog_posts,
        'total_payments': total_payments,
        'total_revenue': total_revenue,
        'recent_payments': recent_payments,
        'recent_users': recent_users,
        'top_courses': courses_with_sales,
    }
    
    return render(request, 'custom_admin/dashboard.html', context)


@login_required
@user_passes_test(is_staff_user, login_url='/admin-portal/login/')
def admin_logout_view(request):
    """Custom admin logout view"""
    if request.method == 'POST':
        logout(request)
        messages.success(request, 'You have been logged out successfully.')
        return redirect('custom_admin:login')
    return redirect('custom_admin:dashboard')


@login_required
@user_passes_test(is_staff_user, login_url='/admin-portal/login/')
def admin_blog_list_view(request):
    """List all blog posts with search and filter."""
    query = request.GET.get('q', '')
    status_filter = request.GET.get('status', '')
    
    blogs = BlogPost.objects.select_related('author').all()
    
    if query:
        blogs = blogs.filter(
            Q(title__icontains=query) | 
            Q(content__icontains=query) |
            Q(author__username__icontains=query)
        )
    
    if status_filter:
        blogs = blogs.filter(status=status_filter)
    
    blogs = blogs.order_by('-created_at')
    
    context = {
        'blogs': blogs,
        'query': query,
        'status_filter': status_filter,
    }
    return render(request, 'custom_admin/blog_list.html', context)


@login_required
@user_passes_test(is_staff_user, login_url='/admin-portal/login/')
def admin_blog_create_view(request):
    """Allow staff to create blog posts via custom admin form."""
    if request.method == 'POST':
        form = BlogPostForm(request.POST, request.FILES)
        if form.is_valid():
            blog_post = form.save(commit=False)
            blog_post.author = request.user
            blog_post.save()
            messages.success(request, 'Blog post created successfully!')
            return redirect('custom_admin:blog_list')
    else:
        form = BlogPostForm()

    context = {
        'form': form,
    }
    return render(request, 'custom_admin/blog_create.html', context)


@login_required
@user_passes_test(is_staff_user, login_url='/admin-portal/login/')
def admin_blog_edit_view(request, blog_id):
    """Edit existing blog post."""
    blog = BlogPost.objects.get(id=blog_id)
    
    if request.method == 'POST':
        form = BlogPostForm(request.POST, request.FILES, instance=blog)
        if form.is_valid():
            form.save()
            messages.success(request, 'Blog post updated successfully!')
            return redirect('custom_admin:blog_list')
    else:
        form = BlogPostForm(instance=blog)
    
    context = {
        'form': form,
        'blog': blog,
        'is_edit': True,
    }
    return render(request, 'custom_admin/blog_create.html', context)


@login_required
@user_passes_test(is_staff_user, login_url='/admin-portal/login/')
def admin_blog_delete_view(request, blog_id):
    """Delete blog post."""
    if request.method == 'POST':
        blog = BlogPost.objects.get(id=blog_id)
        blog.delete()
        messages.success(request, 'Blog post deleted successfully!')
    return redirect('custom_admin:blog_list')


@login_required
@user_passes_test(is_staff_user, login_url='/admin-portal/login/')
def admin_course_list_view(request):
    """List all courses with search and filter."""
    query = request.GET.get('q', '')
    
    courses = Course.objects.all()
    
    if query:
        courses = courses.filter(
            Q(title__icontains=query) | 
            Q(description__icontains=query)
        )
    
    courses = courses.order_by('-created_at')
    
    context = {
        'courses': courses,
        'query': query,
    }
    return render(request, 'custom_admin/course_list.html', context)


@login_required
@user_passes_test(is_staff_user, login_url='/admin-portal/login/')
def admin_course_create_view(request):
    """Create new course."""
    if request.method == 'POST':
        form = CourseForm(request.POST, request.FILES)
        if form.is_valid():
            course = form.save()
            messages.success(request, 'Course created successfully!')
            return redirect('custom_admin:course_list')
    else:
        form = CourseForm()
    
    context = {
        'form': form,
    }
    return render(request, 'custom_admin/course_create.html', context)


@login_required
@user_passes_test(is_staff_user, login_url='/admin-portal/login/')
def admin_course_edit_view(request, course_id):
    """Edit existing course."""
    course = Course.objects.get(id=course_id)
    
    if request.method == 'POST':
        form = CourseForm(request.POST, request.FILES, instance=course)
        if form.is_valid():
            form.save()
            messages.success(request, 'Course updated successfully!')
            return redirect('custom_admin:course_list')
    else:
        form = CourseForm(instance=course)
    
    context = {
        'form': form,
        'course': course,
        'is_edit': True,
    }
    return render(request, 'custom_admin/course_create.html', context)


@login_required
@user_passes_test(is_staff_user, login_url='/admin-portal/login/')
def admin_course_delete_view(request, course_id):
    """Delete course."""
    if request.method == 'POST':
        course = Course.objects.get(id=course_id)
        course.delete()
        messages.success(request, 'Course deleted successfully!')
    return redirect('custom_admin:course_list')
