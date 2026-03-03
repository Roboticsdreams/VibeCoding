from django.core.management.base import BaseCommand
from courses.models import Category, Course


class Command(BaseCommand):
    help = 'Populate database with sample categories and courses'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating categories...')
        
        categories_data = [
            {'name': 'Web Development', 'icon_class': '💻', 'course_count': 12},
            {'name': 'Data Science', 'icon_class': '📊', 'course_count': 8},
            {'name': 'Business', 'icon_class': '💼', 'course_count': 10},
            {'name': 'Design', 'icon_class': '🎨', 'course_count': 9},
            {'name': 'Marketing', 'icon_class': '📱', 'course_count': 7},
            {'name': 'Photography', 'icon_class': '📷', 'course_count': 6},
            {'name': 'Music', 'icon_class': '🎵', 'course_count': 5},
            {'name': 'Health & Fitness', 'icon_class': '💪', 'course_count': 8},
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'icon_class': cat_data['icon_class'],
                    'course_count': cat_data['course_count']
                }
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {category.name}'))
        
        self.stdout.write('Creating courses...')
        
        courses_data = [
            {
                'title': 'Complete Web Development Bootcamp',
                'category': 'Web Development',
                'description': 'Learn web development from scratch with HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects and become a full-stack developer.',
                'lessons_count': 42,
                'students_count': 12500,
                'duration': '12 weeks',
                'level': 'beginner',
                'price': 89.99,
                'rating': 4.8,
                'image_url': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
                'featured': True,
                'instructor_name': 'John Smith',
            },
            {
                'title': 'Python for Data Science and Machine Learning',
                'category': 'Data Science',
                'description': 'Master Python programming and learn how to use it for data science and machine learning. Work with real datasets and build predictive models.',
                'lessons_count': 38,
                'students_count': 9800,
                'duration': '10 weeks',
                'level': 'intermediate',
                'price': 99.99,
                'rating': 4.9,
                'image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
                'featured': True,
                'instructor_name': 'Sarah Johnson',
            },
            {
                'title': 'Digital Marketing Masterclass',
                'category': 'Marketing',
                'description': 'Learn digital marketing strategies including SEO, social media marketing, email marketing, and paid advertising. Grow your business online.',
                'lessons_count': 35,
                'students_count': 8500,
                'duration': '8 weeks',
                'level': 'beginner',
                'price': 79.99,
                'rating': 4.7,
                'image_url': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
                'featured': True,
                'instructor_name': 'Michael Chen',
            },
            {
                'title': 'UI/UX Design Complete Course',
                'category': 'Design',
                'description': 'Master user interface and user experience design. Learn design principles, wireframing, prototyping, and create beautiful, functional designs.',
                'lessons_count': 45,
                'students_count': 7200,
                'duration': '10 weeks',
                'level': 'beginner',
                'price': 94.99,
                'rating': 4.8,
                'image_url': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
                'featured': True,
                'instructor_name': 'Emily Rodriguez',
            },
            {
                'title': 'Business Strategy and Innovation',
                'category': 'Business',
                'description': 'Learn business strategy fundamentals and innovation techniques. Develop strategic thinking skills and learn how to drive business growth.',
                'lessons_count': 30,
                'students_count': 6500,
                'duration': '6 weeks',
                'level': 'intermediate',
                'price': 84.99,
                'rating': 4.6,
                'image_url': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
                'featured': True,
                'instructor_name': 'David Wilson',
            },
            {
                'title': 'Professional Photography Masterclass',
                'category': 'Photography',
                'description': 'Learn professional photography from beginner to advanced. Master camera settings, composition, lighting, and post-processing techniques.',
                'lessons_count': 40,
                'students_count': 5800,
                'duration': '8 weeks',
                'level': 'beginner',
                'price': 89.99,
                'rating': 4.9,
                'image_url': 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop',
                'featured': True,
                'instructor_name': 'Lisa Anderson',
            },
            {
                'title': 'React - The Complete Guide',
                'category': 'Web Development',
                'description': 'Master React.js from basics to advanced. Learn hooks, context API, Redux, and build modern web applications with React.',
                'lessons_count': 48,
                'students_count': 11200,
                'duration': '14 weeks',
                'level': 'intermediate',
                'price': 94.99,
                'rating': 4.8,
                'image_url': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
                'featured': True,
                'instructor_name': 'James Miller',
            },
            {
                'title': 'Music Production in Logic Pro X',
                'category': 'Music',
                'description': 'Learn music production from scratch. Master Logic Pro X, sound design, mixing, and mastering to create professional tracks.',
                'lessons_count': 36,
                'students_count': 4500,
                'duration': '9 weeks',
                'level': 'beginner',
                'price': 79.99,
                'rating': 4.7,
                'image_url': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop',
                'featured': True,
                'instructor_name': 'Chris Taylor',
            },
            {
                'title': 'Advanced SQL and Database Design',
                'category': 'Data Science',
                'description': 'Master SQL queries, database design, optimization, and work with complex data structures. Essential for data analysts and developers.',
                'lessons_count': 32,
                'students_count': 7800,
                'duration': '7 weeks',
                'level': 'advanced',
                'price': 89.99,
                'rating': 4.8,
                'image_url': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=600&fit=crop',
                'featured': False,
                'instructor_name': 'Robert Brown',
            },
            {
                'title': 'Complete Fitness Training Program',
                'category': 'Health & Fitness',
                'description': 'Transform your body with this comprehensive fitness program. Learn proper exercise techniques, nutrition basics, and build sustainable habits.',
                'lessons_count': 28,
                'students_count': 6200,
                'duration': '8 weeks',
                'level': 'beginner',
                'price': 69.99,
                'rating': 4.7,
                'image_url': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop',
                'featured': False,
                'instructor_name': 'Jennifer Davis',
            },
        ]
        
        for course_data in courses_data:
            category_name = course_data.pop('category')
            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                defaults={
                    **course_data,
                    'category': categories[category_name]
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created course: {course.title}'))
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database!'))
