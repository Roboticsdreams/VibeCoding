from django.contrib import admin
from .models import Course, Lesson, Purchase


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ['title', 'order', 'is_preview']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [LessonInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'thumbnail', 'short_description', 'description')
        }),
        ('Pricing & Status', {
            'fields': ('price', 'is_active')
        }),
    )


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'is_preview', 'created_at']
    list_filter = ['course', 'is_preview']
    search_fields = ['title', 'content']
    list_editable = ['order', 'is_preview']


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'created_at', 'is_active']
    list_filter = ['is_active', 'created_at', 'course']
    search_fields = ['user__username', 'user__email', 'course__title']
    date_hierarchy = 'created_at'
