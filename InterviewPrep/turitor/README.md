# Turitor - Online Learning Platform

A pixel-perfect Django + TailwindCSS learning platform inspired by modern educational websites. Built with Python 3.12, Django 5.0, and TailwindCSS 3.x.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with smooth transitions
- **Dynamic Categories**: Browse courses by category with intuitive navigation
- **Featured Courses**: Showcase top-rated and popular courses
- **Course Details**: Comprehensive course pages with ratings, pricing, and enrollment
- **Modern UI**: Beautiful gradients, shadows, and hover effects
- **Admin Panel**: Manage courses and categories through Django admin
- **Sample Data**: Pre-populated with realistic course and category data

## 📋 Prerequisites

- Python 3.12+
- Node.js and npm (for TailwindCSS)
- pip (Python package manager)

## 🛠️ Installation & Setup

### 1. Clone or Navigate to Project Directory

```bash
cd /Users/prathinavel/Downloads/Personal/InterviewPrep/turitor
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Install Node Dependencies

```bash
npm install
```

### 5. Build TailwindCSS

```bash
npm run build:css
```

For development with auto-rebuild on changes:

```bash
npm run watch:css
```

### 6. Run Django Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Admin Account)

```bash
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

### 8. Populate Sample Data

```bash
python manage.py populate_data
```

This will create:
- 8 course categories (Web Development, Data Science, Business, Design, etc.)
- 10 sample courses with realistic data

### 9. Run Development Server

```bash
python manage.py runserver
```

Visit: **http://127.0.0.1:8000/**

## 📁 Project Structure

```
turitor/
├── turitor/                    # Project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── courses/                    # Main app
│   ├── models.py              # Category & Course models
│   ├── views.py               # View logic
│   ├── urls.py                # URL routing
│   ├── admin.py               # Admin configuration
│   └── management/
│       └── commands/
│           └── populate_data.py
├── templates/
│   └── courses/
│       ├── base.html          # Base template
│       ├── home.html          # Homepage with all sections
│       ├── course_list.html   # All courses page
│       ├── course_detail.html # Individual course page
│       ├── category_courses.html
│       └── includes/
│           ├── navbar.html
│           ├── footer.html
│           ├── course_card.html
│           └── category_card.html
├── static/
│   ├── src/
│   │   └── input.css          # TailwindCSS source
│   └── dist/
│       └── output.css         # Compiled CSS
├── manage.py
├── requirements.txt
├── package.json
└── tailwind.config.js
```

## 🎨 Key Sections Implemented

### Homepage (`/`)
1. **Hero Section**: Eye-catching headline with CTA buttons
2. **Statistics**: Display key metrics (students, courses, instructors)
3. **Categories Grid**: 8 course categories with icons
4. **Featured Courses**: Grid of top courses with ratings and pricing
5. **Why Choose Us**: Benefits section with icons
6. **Testimonials**: Student reviews with avatars
7. **CTA Section**: Call-to-action for enrollment

### Additional Pages
- **Course List** (`/courses/`): All courses with category filtering
- **Course Detail** (`/course/<slug>/`): Detailed course information
- **Category Courses** (`/category/<slug>/`): Courses by category

## 🎯 Models

### Category
- `name`: Category name
- `slug`: URL-friendly identifier
- `icon_class`: Emoji or icon class
- `course_count`: Number of courses

### Course
- `title`: Course title
- `slug`: URL-friendly identifier
- `category`: Foreign key to Category
- `description`: Full description
- `lessons_count`: Number of lessons
- `students_count`: Enrolled students
- `duration`: Course duration
- `level`: Beginner/Intermediate/Advanced
- `price`: Course price
- `rating`: Course rating (0-5)
- `image_url`: Course thumbnail
- `featured`: Featured status
- `instructor_name`: Instructor name

## 🔧 TailwindCSS Configuration

The project uses custom TailwindCSS configuration with:
- Custom color palette (primary blues, secondary oranges)
- Container centering and max-width
- Custom component classes (btn, card, section-title)
- Gradient utilities
- Inter font family

### Build Commands

```bash
# One-time build
npm run build:css

# Watch mode (rebuilds on file changes)
npm run watch:css
```

## 👨‍💼 Admin Panel

Access at: **http://127.0.0.1:8000/admin/**

Features:
- Add/Edit/Delete courses
- Manage categories
- Mark courses as featured
- Filter and search functionality

## 🎨 UI Components

### Reusable Components
- **Course Card**: Displays course with image, rating, price, and CTA
- **Category Card**: Icon-based category display with course count
- **Navbar**: Sticky navigation with dropdown and mobile menu
- **Footer**: 4-column footer with newsletter signup

### Styling Features
- Smooth hover transitions
- Card shadow effects
- Image zoom on hover
- Mobile-responsive design
- Alpine.js for interactive elements

## 🚦 Usage

### Adding New Courses

**Via Admin Panel:**
1. Go to http://127.0.0.1:8000/admin/
2. Navigate to Courses → Add Course
3. Fill in course details
4. Save

**Via Django Shell:**
```python
python manage.py shell

from courses.models import Category, Course

# Create a course
course = Course.objects.create(
    title="New Course",
    category=Category.objects.first(),
    description="Course description",
    lessons_count=30,
    students_count=100,
    price=79.99,
    rating=4.5,
    image_url="https://images.unsplash.com/photo-example",
    featured=True
)
```

### Creating Categories

```python
from courses.models import Category

category = Category.objects.create(
    name="AI & Machine Learning",
    icon_class="🤖",
    course_count=15
)
```

## 🌐 URLs

- `/` - Homepage
- `/courses/` - All courses
- `/course/<slug>/` - Course detail
- `/category/<slug>/` - Category courses
- `/admin/` - Admin panel

## 🎯 Key Technologies

- **Backend**: Django 5.0, Python 3.12
- **Frontend**: TailwindCSS 3.x, Alpine.js
- **Database**: SQLite (development)
- **Template Engine**: Django Templates
- **Icons**: SVG inline icons
- **Images**: Unsplash API (placeholder)

## 📝 Notes

- The CSS lint warnings for `@tailwind` and `@apply` are normal - these are TailwindCSS directives processed during build
- All images use Unsplash for demonstration purposes
- The design is pixel-accurate to modern learning platforms
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1200px)

## 🔒 Security Note

⚠️ **Before deploying to production:**
1. Change `SECRET_KEY` in settings.py
2. Set `DEBUG = False`
3. Configure `ALLOWED_HOSTS`
4. Use environment variables for sensitive data
5. Set up proper static file serving
6. Use PostgreSQL or MySQL instead of SQLite

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

Feel free to submit issues or pull requests for improvements.

---

**Built with ❤️ using Django + TailwindCSS**
