# Bitbucket Clone - Django Web Application

A Django-based web application that replicates the Bitbucket user interface with a modern, responsive design.

## Features

- **Complete Bitbucket-style UI** with header, sidebar navigation, main content area, and footer
- **Responsive Design** that works on desktop and mobile devices
- **Interactive Components** including search functionality, user menus, and navigation
- **Multiple Page Views**: Dashboard, Overview, Diff, Commits, and Builds pages
- **Modern Styling** with CSS that matches Bitbucket's blue theme and layout
- **Sample Data** for pull requests, builds, commits, and user information

## Project Structure

```
bitbucket_clone/
├── bitbucket_clone/          # Django project settings
│   ├── settings.py           # Project configuration
│   ├── urls.py              # Main URL routing
│   └── wsgi.py              # WSGI application
├── main/                    # Main Django app
│   ├── views.py            # View controllers
│   ├── urls.py             # App-specific URL routing
│   └── models.py           # Data models (if needed)
├── templates/              # HTML templates
│   ├── base.html          # Base template with layout
│   ├── dashboard.html     # Dashboard/home page
│   ├── overview.html      # Pull request overview
│   ├── diff.html          # Code diff viewer
│   ├── commits.html       # Commit history
│   └── builds.html        # Build status page
├── static/                # Static files
│   ├── css/
│   │   └── styles.css     # Main stylesheet
│   ├── js/
│   │   └── main.js        # JavaScript functionality
│   └── images/            # Image assets
├── requirements.txt       # Python dependencies
└── manage.py             # Django management script
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Virtual environment (recommended)

### Installation

1. **Create and activate virtual environment:**
   ```bash
   python3 -m venv bitbucket_env
   source bitbucket_env/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

5. **Access the application:**
   Open your browser and navigate to `http://127.0.0.1:8000`

## Pages and Navigation

### Available URLs
- `/` - Dashboard (Your work)
- `/overview/` - Pull Request Overview
- `/diff/` - Code Diff View
- `/commits/` - Commit History
- `/builds/` - Build Status

### Components

**Header:**
- Bitbucket logo and branding
- Main navigation (Your work, Projects, Repositories)
- Search functionality
- User menu with avatar

**Sidebar Navigation:**
- Project information display
- Navigation menu (Overview, Diff, Commits, Builds)
- Active page highlighting

**Main Content:**
- Dynamic content based on the selected page
- Pull request information
- Build status displays
- Commit history with timeline
- Code diff visualization

**Footer:**
- Links to privacy policy, terms, and support
- Copyright information

## Features Implemented

### Frontend
- **Responsive CSS Grid Layout** with proper breakpoints
- **Interactive JavaScript** for search, menus, and navigation
- **Modern UI Components** including badges, buttons, and cards
- **Font Awesome Icons** for consistent iconography
- **Smooth Transitions** and hover effects

### Backend
- **Django Views** with sample data rendering
- **URL Routing** for all pages
- **Template Inheritance** for consistent layout
- **Static File Serving** in development

### Styling
- **Bitbucket Color Scheme** (#0052cc primary blue)
- **Typography** matching Atlassian design system
- **Component Styling** for builds, commits, and diffs
- **Mobile-first Responsive Design**

## Sample Data

The application includes realistic sample data:
- Pull request information (COLPLM-7828 procedure code display)
- Build status with various states (in-progress, passed, failed)
- Commit history with authors and timestamps
- User and project avatars

## Customization

### Adding New Pages
1. Create a new view in `main/views.py`
2. Add URL pattern in `main/urls.py`
3. Create corresponding HTML template
4. Add navigation link in `base.html`

### Modifying Styles
- Edit `static/css/styles.css` for visual changes
- Follow the existing CSS class naming conventions
- Test responsiveness across different screen sizes

### Adding Functionality
- Extend JavaScript in `static/js/main.js`
- Add Django models for data persistence
- Implement user authentication if needed

## Browser Compatibility

Tested and compatible with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Notes

- Uses Django 6.0.2 with modern Python features
- Implements proper separation of concerns
- Follows Django best practices
- Mobile-first responsive design approach
- Semantic HTML structure with accessibility considerations

## Future Enhancements

Potential improvements for production use:
- User authentication and authorization
- Database models for persistent data
- API integration for real repository data
- WebSocket support for real-time updates
- Advanced search functionality
- File upload capabilities
- Git integration

---

**Created:** February 2026  
**Framework:** Django 6.0.2  
**License:** MIT
