from django.urls import path
from . import views

app_name = 'custom_admin'

urlpatterns = [
    path('login/', views.admin_login_view, name='login'),
    path('dashboard/', views.admin_dashboard_view, name='dashboard'),
    path('logout/', views.admin_logout_view, name='logout'),
    
    # Blog management
    path('blogs/', views.admin_blog_list_view, name='blog_list'),
    path('blog/create/', views.admin_blog_create_view, name='blog_create'),
    path('blog/<int:blog_id>/edit/', views.admin_blog_edit_view, name='blog_edit'),
    path('blog/<int:blog_id>/delete/', views.admin_blog_delete_view, name='blog_delete'),
    
    # Course management
    path('courses/', views.admin_course_list_view, name='course_list'),
    path('course/create/', views.admin_course_create_view, name='course_create'),
    path('course/<int:course_id>/edit/', views.admin_course_edit_view, name='course_edit'),
    path('course/<int:course_id>/delete/', views.admin_course_delete_view, name='course_delete'),
]
