from django.urls import path
from . import views

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('courses/', views.course_list, name='course_list'),
    path('course/<slug:slug>/', views.CourseDetailView.as_view(), name='course_detail'),
    path('category/<slug:slug>/', views.CategoryCourseListView.as_view(), name='category_courses'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('learn/', views.learn_view, name='learn'),
]
