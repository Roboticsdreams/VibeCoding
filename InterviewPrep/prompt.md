You are a senior Django engineer. Build a production-ready SaaS web app for selling interview-preparation courses using Django (latest stable), Django templates (no SPA), SQLite for DB, and Razorpay for payments. Output a complete working project with clear file structure, code, migrations, and setup instructions.

CORE REQUIREMENTS
1) Tech
- Django (latest stable), Python 3.11+
- Django templates + Bootstrap 5 UI (simple, clean)
- SQLite database
- Django auth (signup/login/logout/password reset)
- Environment variables via python-dotenv (or django-environ)
- Static files + media uploads supported in dev; structure ready for prod

2) Roles & Access
- Roles: Admin (superuser/staff) and normal User.
- Admin can create/edit/publish: Blogs, Courses, Lessons/Modules, Pricing, Coupons (optional).
- Users can:
  - Register/login
  - Browse blog list and read blog details ONLY if subscribed to blog access (see #4)
  - Browse courses catalog (course landing pages visible to all)
  - Purchase access to individual courses via Razorpay
  - After purchase, access only the courses they bought (not all courses)
  - View their purchases/subscriptions history + invoices/receipts page
- Permissions enforced at view-level and template-level (no direct URL access without purchase).

3) Content Models
- Blog:
  - title, slug, cover_image, excerpt, content (rich text using Django built-in TextField), author (FK), status (draft/published), created_at, updated_at
  - Only published blogs appear publicly
- Course:
  - title, slug, thumbnail, short_description, description, price (INR), is_active, created_at
- Lesson (or Module):
  - course (FK), title, order, content (TextField), video_url (optional), attachment (optional), is_preview (boolean)
  - If lesson.is_preview=True then visible to everyone; otherwise only to purchased users.

4) Subscription / Purchase Rules
- NO “single subscription unlocks everything”.
- Each Course is purchased individually.
- Blog access:
  Option A (preferred): Blog is FREE for all logged-in users OR fully public (choose one and implement).
  Option B: Blog requires a separate “Blog Membership” product purchase.
Implement one approach cleanly and document it.
(If you pick Option B, create a Product model with type BLOG_MEMBERSHIP and integrate with Razorpay similarly.)

5) Razorpay Integration (Important)
- Use Razorpay Orders API flow:
  - User clicks “Buy Course”
  - Create an Order on server with amount in paise, currency INR, receipt id
  - Render checkout page with Razorpay checkout script (key_id public)
  - On successful payment, Razorpay returns payment_id, order_id, signature
  - Verify signature server-side using Razorpay utility verification
  - Mark purchase as successful and grant access
- Store all payment attempts and statuses:
  - Payment model: user, course (nullable if blog membership), razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status (CREATED/PAID/FAILED), created_at
- Idempotency:
  - Prevent duplicate access grants for same order/payment.
- Webhooks (optional but good):
  - Add endpoint to receive Razorpay webhooks and reconcile payment status (document how to enable).

6) Pages / UX (Django Templates)
- Public:
  - Home page: featured courses, call-to-action, testimonials dummy
  - Courses listing page
  - Course detail landing page with price + buy button + preview lessons
  - Blog listing + blog detail (per rules chosen)
- Auth:
  - Signup/login/logout
  - Profile page: user info + “My Courses”
- Payment:
  - Checkout page per course
  - Payment success page
  - Payment failed page
- Admin:
  - Use Django admin for content management.
  - Also provide a basic staff dashboard page (optional) listing sales totals, recent orders.

7) Access Control Rules
- Course detail page is visible to all.
- Course lessons:
  - Only preview lessons visible without purchase.
  - Non-preview lessons require a successful purchase of that course by that user.
- Blog:
  - Implement based on the blog access option chosen.

8) Implementation Details
- Use class-based views where appropriate (ListView/DetailView/FormView).
- Use Django messages framework for success/error feedback.
- Use slugs, SEO-friendly URLs.
- Add tests:
  - Model tests for purchase grant logic
  - View tests for access control (cannot access lessons without purchase)
  - Payment signature verification unit test (mock)
- Add a “services” layer for Razorpay operations:
  - create_order(course, user)
  - verify_payment_signature(data)
- Add basic logging for payment events.

9) Project Structure (suggested)
- config/ (settings, urls, wsgi/asgi)
- accounts/ (auth, profile)
- blog/
- courses/
- payments/
- templates/
- static/
- media/

10) Settings & Secrets
- Use .env with:
  - SECRET_KEY
  - DEBUG
  - ALLOWED_HOSTS
  - RAZORPAY_KEY_ID
  - RAZORPAY_KEY_SECRET
  - RAZORPAY_WEBHOOK_SECRET (if webhooks)
- Show sample .env.example

11) Deliverables
Provide:
- Full code for all files needed (models, views, urls, templates, admin, forms, services, tests).
- Migrations creation commands.
- Step-by-step instructions:
  - create venv, install deps
  - startproject/startapp commands (or provide final layout)
  - run migrations, create superuser
  - configure Razorpay keys
  - run server
- Provide a short “How it works” explanation and a checklist for production hardening (CSRF, security settings, static hosting, etc).

CONSTRAINTS / CHOICES
- Use SQLite (explicitly do not switch to Postgres).
- Must use Django templates (no DRF-only backend, no React).
- Keep UI minimal but complete.
- Use clean, readable code and comments.
- Avoid paid third-party packages; use Razorpay’s official python client if needed.

Before coding, first output:
A) Data model diagram (textual)
B) URL map
C) Key flows (purchase + access)
Then output code.

Now generate the complete project.