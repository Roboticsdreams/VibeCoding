from django.views.generic import ListView, DetailView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from django.http import Http404
from .models import Course, Lesson, Purchase
from payments.models import CourseEntitlement


class CourseListView(ListView):
    model = Course
    template_name = 'courses/list.html'
    context_object_name = 'courses'
    paginate_by = 12
    
    def get_queryset(self):
        return Course.objects.filter(is_active=True)


class CourseDetailView(DetailView):
    model = Course
    template_name = 'courses/detail.html'
    context_object_name = 'course'
    
    def get_queryset(self):
        return Course.objects.filter(is_active=True)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        course = self.object
        
        if self.request.user.is_authenticated:
            # Check new entitlement system first
            has_entitlement = CourseEntitlement.objects.filter(
                user=self.request.user,
                course=course,
                revoked_at__isnull=True
            ).exists()
            
            # Fallback to legacy Purchase model
            has_legacy_purchase = Purchase.objects.filter(
                user=self.request.user,
                course=course,
                is_active=True
            ).exists()
            
            context['has_purchased'] = has_entitlement or has_legacy_purchase
        else:
            context['has_purchased'] = False
        
        return context


class LessonDetailView(LoginRequiredMixin, DetailView):
    model = Lesson
    template_name = 'courses/lesson_detail.html'
    context_object_name = 'lesson'
    
    def get_object(self):
        course_slug = self.kwargs.get('course_slug')
        lesson_id = self.kwargs.get('pk')
        
        lesson = get_object_or_404(
            Lesson,
            pk=lesson_id,
            course__slug=course_slug
        )
        
        if lesson.is_preview:
            return lesson
        
        # Check new entitlement system
        has_entitlement = CourseEntitlement.objects.filter(
            user=self.request.user,
            course=lesson.course,
            revoked_at__isnull=True
        ).exists()
        
        # Fallback to legacy Purchase
        has_legacy_purchase = Purchase.objects.filter(
            user=self.request.user,
            course=lesson.course,
            is_active=True
        ).exists()
        
        if not (has_entitlement or has_legacy_purchase):
            raise Http404("You don't have access to this lesson. Please purchase the course first.")
        
        return lesson
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        lesson = self.object
        context['course'] = lesson.course
        context['all_lessons'] = lesson.course.lessons.all()
        return context
