from django.shortcuts import render
from courses.models import Course
from blog.models import BlogPost


def home_view(request):
    """Landing page view with featured courses and blogs."""
    featured_courses = Course.objects.filter(is_active=True).order_by('-created_at')[:6]
    recent_blogs = BlogPost.objects.filter(status='published').order_by('-created_at')[:3]
    
    context = {
        'featured_courses': featured_courses,
        'recent_blogs': recent_blogs,
        'total_courses': Course.objects.filter(is_active=True).count(),
    }
    
    return render(request, 'home.html', context)


def turitor_home_view(request):
    """Turitor-styled home page with featured courses and blogs."""
    featured_courses = Course.objects.filter(is_active=True).order_by('-created_at')[:6]
    recent_blogs = BlogPost.objects.filter(status='published').order_by('-created_at')[:3]
    
    context = {
        'featured_courses': featured_courses,
        'recent_blogs': recent_blogs,
        'total_courses': Course.objects.filter(is_active=True).count(),
    }
    
    return render(request, 'home_turitor.html', context)

def newhome_view(request):
    """New home page view."""
    return render(request, 'newhome.html')
