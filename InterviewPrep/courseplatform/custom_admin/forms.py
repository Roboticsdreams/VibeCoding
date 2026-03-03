from django import forms
from blog.models import BlogPost
from courses.models import Course


class BlogPostForm(forms.ModelForm):
    """Form used inside the custom admin portal for creating blog posts."""

    class Meta:
        model = BlogPost
        fields = [
            "title",
            "excerpt",
            "content",
            "status",
            "cover_image",
            "is_paid",
            "price",
        ]
        widgets = {
            "title": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter blog title",
                "maxlength": 200,
            }),
            "excerpt": forms.Textarea(attrs={
                "class": "form-control",
                "rows": 3,
                "placeholder": "Short summary to show on listings",
            }),
            "content": forms.Textarea(attrs={
                "class": "form-control",
                "rows": 10,
                "placeholder": "Write the full blog content here",
            }),
            "status": forms.Select(attrs={
                "class": "form-select",
            }),
            "cover_image": forms.ClearableFileInput(attrs={
                "class": "form-control",
            }),
            "is_paid": forms.CheckboxInput(attrs={
                "class": "form-check-input",
            }),
            "price": forms.NumberInput(attrs={
                "class": "form-control",
                "placeholder": "0.00",
                "step": "0.01",
                "min": "0",
            }),
        }


class CourseForm(forms.ModelForm):
    """Form for creating and editing courses in custom admin."""
    
    class Meta:
        model = Course
        fields = [
            "title",
            "short_description",
            "description",
            "price",
            "thumbnail",
            "is_active",
        ]
        widgets = {
            "title": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter course title",
                "maxlength": 200,
            }),
            "short_description": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Brief description for course cards",
                "maxlength": 300,
            }),
            "description": forms.Textarea(attrs={
                "class": "form-control",
                "rows": 8,
                "placeholder": "Full course description",
            }),
            "price": forms.NumberInput(attrs={
                "class": "form-control",
                "placeholder": "0.00",
                "step": "0.01",
                "min": "0",
            }),
            "thumbnail": forms.ClearableFileInput(attrs={
                "class": "form-control",
            }),
            "is_active": forms.CheckboxInput(attrs={
                "class": "form-check-input",
            }),
        }
