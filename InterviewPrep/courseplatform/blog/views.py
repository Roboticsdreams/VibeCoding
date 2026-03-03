from django.views.generic import ListView, DetailView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.contrib import messages
from .models import BlogPost
from payments.models import BlogEntitlement


class BlogListView(LoginRequiredMixin, ListView):
    model = BlogPost
    template_name = 'blog/list.html'
    context_object_name = 'posts'
    paginate_by = 10
    
    def get_queryset(self):
        return BlogPost.objects.filter(status='published')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Add purchase status for each blog if user is authenticated
        if self.request.user.is_authenticated:
            purchased_blog_ids = BlogEntitlement.objects.filter(
                user=self.request.user,
                revoked_at__isnull=True
            ).values_list('blog_post_id', flat=True)
            
            context['purchased_blog_ids'] = list(purchased_blog_ids)
        else:
            context['purchased_blog_ids'] = []
        
        return context


class BlogDetailView(LoginRequiredMixin, DetailView):
    model = BlogPost
    template_name = 'blog/detail.html'
    context_object_name = 'post'
    
    def get_queryset(self):
        return BlogPost.objects.filter(status='published')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        blog_post = self.object
        
        # Check if blog is paid and if user has access
        if blog_post.is_paid:
            has_entitlement = BlogEntitlement.objects.filter(
                user=self.request.user,
                blog_post=blog_post,
                revoked_at__isnull=True
            ).exists()
            context['has_access'] = has_entitlement
        else:
            # Free blog, everyone has access
            context['has_access'] = True
        
        context['is_paid'] = blog_post.is_paid
        
        return context
