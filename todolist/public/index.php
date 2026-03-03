<?php
// Load Composer's autoloader
require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

// Start session
session_name($_ENV['SESSION_NAME']);
session_set_cookie_params([
    'lifetime' => $_ENV['SESSION_LIFETIME'],
    'path' => '/',
    'domain' => '',
    'secure' => $_ENV['SESSION_SECURE'],
    'httponly' => $_ENV['SESSION_HTTP_ONLY'],
    'samesite' => $_ENV['SESSION_SAME_SITE']
]);
session_start();

// Initialize router
$router = new \Bramus\Router\Router();

// Load routes
require_once __DIR__ . '/../routes/web.php';

// Run the router
$router->run();
