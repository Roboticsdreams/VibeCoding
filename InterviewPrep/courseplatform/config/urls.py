from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import home_view, turitor_home_view, newhome_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('admin-portal/', include('custom_admin.urls')),
    path('', home_view, name='home'),
    path('turitor-home/', turitor_home_view, name='turitor_home'),
    path('newhome/', newhome_view, name='newhome'),
    path('accounts/', include('accounts.urls')),
    path('blog/', include('blog.urls')),
    path('courses/', include('courses.urls')),
    path('payments/', include('payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
