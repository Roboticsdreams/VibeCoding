# Modern To-Do List Application

A modern, responsive to-do list application built with PHP, SQLite, and Bootstrap 5.

## Features

- 📝 Create, update, and delete tasks
- 📅 Set due dates for tasks
- ✅ Mark tasks as complete/incomplete
- 🔄 Track task status (Pending, In Progress, Completed, Overdue)
- 📊 Task history and statistics
- 🔒 User authentication
- 📱 Responsive design

## Prerequisites

- PHP 8.0 or higher
- SQLite3 extension for PHP
- Web server (Apache/Nginx) or PHP's built-in development server
- Composer (for autoloading)

## Installation

1. Clone the repository:
   ```
   git clone [repository-url]
   cd todolist
   ```

2. Install dependencies:
   ```
   composer install
   ```

3. Set up the database:
   ```
   php database/setup.php
   ```

4. Start the development server:
   ```
   php -S localhost:8000 -t public
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Project Structure

```
todolist/
├── config/              # Configuration files
├── database/            # Database migrations and setup
├── public/              # Publicly accessible files
│   ├── assets/          # CSS, JS, and images
│   └── index.php        # Entry point
├── src/                 # Application source code
│   ├── Controllers/     # Request handlers
│   ├── Models/          # Database models
│   ├── Services/        # Business logic
│   └── Utils/           # Helper classes
├── templates/           # View templates
├── vendor/              # Composer dependencies
├── .env                 # Environment variables
├── .htaccess           # Apache configuration
├── composer.json        # PHP dependencies
└── README.md           # This file
```

## Database Schema

The application uses SQLite with the following tables:

- `users` - User accounts
- `tasks` - Task items
- `task_history` - Audit log for task changes

## License

MIT
