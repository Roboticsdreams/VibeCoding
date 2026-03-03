# Course Platform - Interview Preparation SaaS

A production-ready Django-based SaaS platform for selling interview preparation courses with integrated Razorpay payment gateway.

## Features

- **Course Management**: Create and manage courses with lessons, videos, and attachments
- **Access Control**: Granular permission system - preview lessons vs. purchased content
- **Payment Integration**: Secure Razorpay payment gateway with signature verification
- **Blog System**: Login-required blog for registered users
- **User Management**: Registration, login, password reset, user profiles
- **Admin Dashboard**: Full-featured Django admin for content management
- **Responsive UI**: Bootstrap 5-based responsive design

## Tech Stack

- **Framework**: Django 5.0.1
- **Python**: 3.11 or 3.12 (⚠️ **Not compatible with Python 3.13** due to razorpay dependency)
- **Database**: SQLite (production-ready for small to medium scale)
- **Payment Gateway**: Razorpay
- **Frontend**: Django Templates + Bootstrap 5
- **Authentication**: Django built-in auth system
- **File Uploads**: Pillow for image handling

## Project Structure

```
courseplatform/
├── config/              # Project configuration
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── accounts/            # User authentication & profiles
├── blog/                # Blog posts (login required)
├── courses/             # Course & lesson management
├── payments/            # Razorpay integration
├── templates/           # HTML templates
├── static/              # Static files (CSS, JS, images)
├── media/               # User uploads
├── manage.py
├── requirements.txt
├── setup.sh             # Setup script
├── runserver.sh         # Run server script
└── .env                 # Environment variables
```

## Quick Start

### 0. Python Version Requirement

⚠️ **Important**: This project requires **Python 3.11 or 3.12**. It is **NOT compatible with Python 3.13** due to razorpay package dependencies.

```bash
# Check your Python version
python3 --version

# If you have Python 3.13, see PYTHON_VERSION_FIX.md for instructions
```

### 1. Setup

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Create virtual environment
- Install dependencies
- Copy `.env.example` to `.env`
- Run migrations
- Prompt for superuser creation

### 2. Configure Environment

Edit `.env` file with your credentials:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Get Razorpay Credentials:**
1. Sign up at https://razorpay.com
2. Go to Settings → API Keys
3. Generate Test/Live keys
4. Copy Key ID and Key Secret

### 3. Run Server

```bash
chmod +x runserver.sh
./runserver.sh
```

Visit: http://localhost:8000

## Usage Guide

### Admin Access

1. Access admin at: http://localhost:8000/admin/
2. Login with superuser credentials
3. Create courses, lessons, and blog posts

### Creating Content

**Create a Course:**
1. Go to Admin → Courses → Add Course
2. Fill in title, description, price
3. Add lessons inline or separately
4. Mark lessons as "preview" for free access
5. Activate the course

**Create Blog Posts:**
1. Go to Admin → Blog Posts → Add Blog Post
2. Write content (Markdown supported via linebreaks)
3. Set status to "Published"

### Payment Flow

1. User browses courses (public access)
2. User clicks "Buy Now" → redirected to login if needed
3. Checkout page loads with Razorpay
4. User completes payment via Razorpay modal
5. Payment verified server-side using signature
6. Purchase record created → user gets access
7. Redirect to success page

### Access Control

- **Course Detail Pages**: Public (anyone can view)
- **Preview Lessons**: Login required, free for all logged-in users
- **Paid Lessons**: Require course purchase
- **Blog**: Login required, free for all logged-in users

## Testing

Run tests:

```bash
source venv/bin/activate
python manage.py test
```

Test coverage includes:
- Model tests (Course, Lesson, Purchase, Payment)
- Access control tests
- Payment signature verification (mocked)
- Purchase grant logic

## Razorpay Integration

### Payment Verification Flow

1. **Order Creation** (`payments/services.py`)
   - Server creates Razorpay order
   - Stores order in Payment model with status='CREATED'

2. **Checkout** (`templates/payments/checkout.html`)
   - Razorpay checkout.js loaded
   - Payment modal displayed
   - User completes payment

3. **Verification** (`payments/views.py::verify_payment_view`)
   - Razorpay returns: order_id, payment_id, signature
   - Server verifies signature using Razorpay utility
   - If valid: Update payment status, create Purchase record
   - If invalid: Mark payment as failed

4. **Webhook** (Optional - `payments/views.py::webhook_view`)
   - Razorpay sends webhook on payment events
   - Server verifies webhook signature
   - Reconciles payment status

### Enable Webhooks

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://yourdomain.com/payments/webhook/`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret to `.env`

## Production Deployment Checklist

### Security

- [ ] Set `DEBUG=False` in `.env`
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Review `settings.py` security settings (already configured)
- [ ] Set secure cookie flags (already enabled when DEBUG=False)
- [ ] Configure CSRF trusted origins if needed

### Database

- [ ] SQLite is production-ready for small-medium scale
- [ ] For high traffic, consider PostgreSQL migration
- [ ] Set up regular backups of `db.sqlite3`

### Static Files

```bash
python manage.py collectstatic
```

- [ ] Serve static files via CDN or web server (Nginx/Apache)
- [ ] Configure `STATIC_ROOT` and `MEDIA_ROOT`

### Media Files

- [ ] Configure media file storage (S3, CloudStorage, etc.)
- [ ] Set appropriate file size limits
- [ ] Enable virus scanning for uploads (optional)

### Email

- [ ] Configure email backend for password reset
- [ ] Update `EMAIL_BACKEND` in settings.py
- [ ] Configure SMTP settings

### Monitoring

- [ ] Set up error logging (Sentry, etc.)
- [ ] Monitor payment logs at `payments.log`
- [ ] Set up uptime monitoring
- [ ] Configure database backups

### Performance

- [ ] Enable database connection pooling
- [ ] Configure caching (Redis/Memcached)
- [ ] Use a production WSGI server (Gunicorn/uWSGI)
- [ ] Set up load balancing for high traffic

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| SECRET_KEY | Django secret key | Yes |
| DEBUG | Debug mode (True/False) | Yes |
| ALLOWED_HOSTS | Comma-separated hostnames | Yes |
| RAZORPAY_KEY_ID | Razorpay API Key ID | Yes |
| RAZORPAY_KEY_SECRET | Razorpay API Secret | Yes |
| RAZORPAY_WEBHOOK_SECRET | Webhook signature secret | Optional |

## API Documentation

### Razorpay Service Methods

**`create_order(course, user)`**
- Creates Razorpay order
- Returns: (razorpay_order, payment_record)
- Logs order creation events

**`verify_payment_signature(order_id, payment_id, signature)`**
- Verifies Razorpay payment signature
- Returns: Boolean (True if valid)
- Logs verification results

**`verify_webhook_signature(body, signature)`**
- Verifies webhook authenticity
- Returns: Boolean
- Uses HMAC SHA256

## Troubleshooting

### Payment Verification Fails

- Check Razorpay credentials in `.env`
- Ensure order exists in database
- Check payment logs: `tail -f payments.log`
- Verify signature calculation

### Static Files Not Loading

```bash
python manage.py collectstatic --clear
```

### Database Locked Error

- SQLite doesn't handle concurrent writes well
- Close other connections to database
- Consider PostgreSQL for production

### Template Not Found

- Check `TEMPLATES` setting in `settings.py`
- Ensure templates exist in correct directory
- Clear template cache

## Support & Contributing

For issues and questions:
- Check Django documentation: https://docs.djangoproject.com
- Razorpay docs: https://razorpay.com/docs/
- Bootstrap docs: https://getbootstrap.com/docs/

## License

This project is provided as-is for educational and commercial use.

## Credits

- Django Framework
- Razorpay Payment Gateway
- Bootstrap 5
- Bootstrap Icons
