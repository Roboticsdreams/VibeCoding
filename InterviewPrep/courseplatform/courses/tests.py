from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from .models import Course, Lesson, Purchase


class CourseModelTest(TestCase):
    def setUp(self):
        self.course = Course.objects.create(
            title="Test Course",
            short_description="Test description",
            description="Full description",
            price=999.00,
            is_active=True
        )
    
    def test_course_creation(self):
        self.assertEqual(self.course.title, "Test Course")
        self.assertEqual(self.course.price, 999.00)
        self.assertTrue(self.course.is_active)
    
    def test_slug_generation(self):
        self.assertEqual(self.course.slug, "test-course")
    
    def test_price_in_paise(self):
        self.assertEqual(self.course.get_price_in_paise(), 99900)


class LessonModelTest(TestCase):
    def setUp(self):
        self.course = Course.objects.create(
            title="Test Course",
            short_description="Test",
            description="Test",
            price=999.00
        )
        self.lesson = Lesson.objects.create(
            course=self.course,
            title="Lesson 1",
            order=1,
            content="Lesson content",
            is_preview=True
        )
    
    def test_lesson_creation(self):
        self.assertEqual(self.lesson.title, "Lesson 1")
        self.assertEqual(self.lesson.course, self.course)
        self.assertTrue(self.lesson.is_preview)


class PurchaseModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.course = Course.objects.create(
            title="Test Course",
            short_description="Test",
            description="Test",
            price=999.00
        )
    
    def test_purchase_creation(self):
        purchase = Purchase.objects.create(
            user=self.user,
            course=self.course,
            is_active=True
        )
        self.assertEqual(purchase.user, self.user)
        self.assertEqual(purchase.course, self.course)
        self.assertTrue(purchase.is_active)
    
    def test_unique_purchase(self):
        Purchase.objects.create(user=self.user, course=self.course)
        with self.assertRaises(Exception):
            Purchase.objects.create(user=self.user, course=self.course)


class CourseAccessControlTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.course = Course.objects.create(
            title="Test Course",
            short_description="Test",
            description="Test",
            price=999.00,
            is_active=True
        )
        self.preview_lesson = Lesson.objects.create(
            course=self.course,
            title="Preview Lesson",
            order=1,
            content="Preview content",
            is_preview=True
        )
        self.paid_lesson = Lesson.objects.create(
            course=self.course,
            title="Paid Lesson",
            order=2,
            content="Paid content",
            is_preview=False
        )
    
    def test_course_detail_public_access(self):
        response = self.client.get(reverse('courses:detail', args=[self.course.slug]))
        self.assertEqual(response.status_code, 200)
    
    def test_preview_lesson_access_without_login(self):
        self.client.logout()
        response = self.client.get(
            reverse('courses:lesson_detail', args=[self.course.slug, self.preview_lesson.pk])
        )
        self.assertEqual(response.status_code, 302)
    
    def test_preview_lesson_access_with_login(self):
        self.client.login(username='testuser', password='testpass')
        response = self.client.get(
            reverse('courses:lesson_detail', args=[self.course.slug, self.preview_lesson.pk])
        )
        self.assertEqual(response.status_code, 200)
    
    def test_paid_lesson_access_without_purchase(self):
        self.client.login(username='testuser', password='testpass')
        response = self.client.get(
            reverse('courses:lesson_detail', args=[self.course.slug, self.paid_lesson.pk])
        )
        self.assertEqual(response.status_code, 404)
    
    def test_paid_lesson_access_with_purchase(self):
        Purchase.objects.create(user=self.user, course=self.course, is_active=True)
        self.client.login(username='testuser', password='testpass')
        response = self.client.get(
            reverse('courses:lesson_detail', args=[self.course.slug, self.paid_lesson.pk])
        )
        self.assertEqual(response.status_code, 200)
