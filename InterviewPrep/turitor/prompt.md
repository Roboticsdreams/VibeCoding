# ✅ Advanced Prompt – Pixel-Perfect Layout Clone Using Django + TailwindCSS

## Objective

Recreate a **pixel-perfect structural and visual clone** of the homepage layout found at:

[https://demo-themewinter.com/turitor/home-4/](https://demo-themewinter.com/turitor/home-4/)

⚠️ Important:

* Replicate layout, spacing, typography scale, alignment, section structure, responsiveness, and UI behavior.
* Do auto-copy copyrighted text, images, icons, or assets.
* Use visually equivalent placeholder content.
* Use royalty-free images that match similar composition and layout.

---

## Technical Stack Requirements

* Python 3.12
* Django 5.0
* TailwindCSS 3.x (installed via Node + CLI build process)
* Django template inheritance
* SQLite (default)
* Clean reusable component-based template architecture
* Responsive mobile-first design
* Production-ready structure

---

## Project Setup

Project name: `turitor`
App name: `courses`

Use proper Django structure and separation of concerns.

---

## Tailwind Setup Requirements

* Install Tailwind via npm
* Configure:

  * `tailwind.config.js`
  * PostCSS
  * Purge settings for Django templates
* Create:

  ```
  static/src/input.css
  static/dist/output.css
  ```
* Use:

  ```
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

Include build command in README:

```
npx tailwindcss -i ./static/src/input.css -o ./static/dist/output.css --watch
```

---

## Layout Sections to Recreate (Pixel-Accurate Structure)

### 1️⃣ Sticky Navigation Bar

* Transparent over hero
* Logo (text-based placeholder)
* Horizontal menu
* Dropdown support
* Right-aligned CTA button
* Mobile hamburger menu with smooth slide-down animation

---

### 2️⃣ Hero Section

Two-column layout:

* Left:

  * Large bold headline (3–4 line)
  * Subtext paragraph
  * Primary CTA
  * Secondary CTA
* Right:

  * Large illustrative image

Match:

* Vertical spacing
* Font weight scale
* Button size and radius
* Hero padding proportions
* Responsive stacking

---

### 3️⃣ Statistics Section

4 equal columns:

* Large bold number
* Label underneath
* Even spacing
* Responsive stacking

---

### 4️⃣ Categories Grid

* 4 columns desktop
* Card-style UI
* Subtle shadow
* Hover lift effect
* Category title
* Course count
* Icon placeholder

Exact spacing replication:

* Card padding
* Grid gap
* Section margin

---

### 5️⃣ Featured Courses Section

Grid layout (4 columns desktop)

Each course card must include:

* Image (fixed aspect ratio)
* Category label
* Rating with stars
* Title
* Metadata row (lessons, students)
* Price (highlighted)
* Button

Hover effect:

* Image zoom
* Shadow increase
* Button color transition

---

### 6️⃣ Testimonials Section

* Centered heading
* Carousel (JS-based or Alpine.js)
* Rounded avatar images
* Quote text
* Name + title

---

### 7️⃣ Blog / Articles Section

3-column grid:

* Image
* Date
* Title
* Short excerpt

---

### 8️⃣ Footer

4 columns:

* About
* Quick links
* Categories
* Newsletter form

Dark background
Proper spacing scale

---

## Django Template Architecture

```
templates/
└── courses/
    ├── base.html
    ├── home.html
    ├── category_list.html
    ├── course_list.html
    ├── login.html
    ├── register.html
    └── includes/
        ├── navbar.html
        ├── footer.html
        ├── course_card.html
        └── category_card.html
```

Use:

* `{% block content %}`
* `{% include %}`
* `{% load static %}`

---

## Models Required

### Category

* name
* slug
* icon_class
* created_at

### Course

* title
* slug
* category
* description
* lessons_count
* students_count
* duration
* level
* price
* rating
* image_url
* featured
* created_at

Include `get_absolute_url()`.

---

## Views Required

* HomeView (ListView or function-based)
* CourseDetailView
* CategoryCourseListView

Pass:

* Featured courses
* Categories
* Statistics (aggregated values)

---

## Styling Precision Requirements

* Match spacing scale exactly using Tailwind spacing utilities
* Match font sizing scale
* Use container width similar to reference (~1200px max)
* Maintain consistent section padding (py-16 / py-20 style)
* Replicate border radius proportions
* Use shadow levels consistent with modern UI

---

## Animation Requirements

* Smooth hover transitions
* Button color transitions
* Image zoom on hover
* Mobile menu slide animation

Use Tailwind transition utilities or Alpine.js if needed.

---

## Data Setup

Provide:

* Admin registration
* Sample data instructions
* Or a management command to create:

  * 6 categories
  * 8 featured courses

---

## Deliverables Required

* Full Django file structure
* models.py
* views.py
* urls.py
* base.html
* home.html
* Tailwind setup instructions
* Example static structure
* Step-by-step run instructions

---

## Final Goal

Produce a **pixel-accurate structural recreation** of the referenced homepage using:

* Django templates
* TailwindCSS
* Clean architecture
* Fully responsive layout
* Dynamic backend-driven content
