from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, DetailView
from django.db.models import Count, Avg
from .models import Course, Category


class HomeView(ListView):
    model = Course
    template_name = 'courses/home.html'
    context_object_name = 'courses'

    def get_queryset(self):
        return Course.objects.filter(featured=True)[:8]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()[:8]
        context['total_students'] = 45000
        context['total_courses'] = Course.objects.count()
        context['total_instructors'] = 250
        context['success_rate'] = 98
        return context


class CourseDetailView(DetailView):
    model = Course
    template_name = 'courses/course_detail.html'
    context_object_name = 'course'


class CategoryCourseListView(ListView):
    model = Course
    template_name = 'courses/category_courses.html'
    context_object_name = 'courses'
    paginate_by = 12

    def get_queryset(self):
        self.category = get_object_or_404(Category, slug=self.kwargs['slug'])
        return Course.objects.filter(category=self.category)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['category'] = self.category
        return context


def course_list(request):
    courses = Course.objects.all()
    categories = Category.objects.all()
    
    category_slug = request.GET.get('category')
    if category_slug:
        courses = courses.filter(category__slug=category_slug)
    
    context = {
        'courses': courses,
        'categories': categories,
    }
    return render(request, 'courses/course_list.html', context)


def login_view(request):
    return render(request, 'courses/login.html')


def register_view(request):
    return render(request, 'courses/register.html')


def learn_view(request):
    return render(request, 'courses/learn.html')
