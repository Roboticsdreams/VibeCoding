from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from .models import BlogPost


class BlogPostModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='author', password='testpass')
        self.post = BlogPost.objects.create(
            title="Test Blog Post",
            author=self.user,
            excerpt="Test excerpt",
            content="Full blog content",
            status='published'
        )
    
    def test_blog_post_creation(self):
        self.assertEqual(self.post.title, "Test Blog Post")
        self.assertEqual(self.post.status, 'published')
    
    def test_slug_generation(self):
        self.assertEqual(self.post.slug, "test-blog-post")


class BlogAccessTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.author = User.objects.create_user(username='author', password='testpass')
        self.post = BlogPost.objects.create(
            title="Test Post",
            author=self.author,
            excerpt="Excerpt",
            content="Content",
            status='published'
        )
    
    def test_blog_list_requires_login(self):
        response = self.client.get(reverse('blog:list'))
        self.assertEqual(response.status_code, 302)
    
    def test_blog_list_with_login(self):
        self.client.login(username='testuser', password='testpass')
        response = self.client.get(reverse('blog:list'))
        self.assertEqual(response.status_code, 200)
    
    def test_blog_detail_requires_login(self):
        response = self.client.get(reverse('blog:detail', args=[self.post.slug]))
        self.assertEqual(response.status_code, 302)
