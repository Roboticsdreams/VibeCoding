from django.contrib import admin
from .models import Category, Course


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'course_count', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'price', 'rating', 'featured', 'created_at']
    list_filter = ['category', 'level', 'featured']
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ['title', 'description']
    list_editable = ['featured']
