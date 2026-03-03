from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('login/', views.login_view, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('overview/', views.overview, name='overview'),
    path('diff/', views.diff, name='diff'),
    path('commits/', views.commits, name='commits'),
    path('projects/', views.projects, name='projects'),
    path('repositories/', views.repositories, name='repositories'),
    path('profile/', views.profile, name='profile'),
    path('settings/', views.settings, name='settings'),
    path('builds/', views.builds, name='builds'),
]
