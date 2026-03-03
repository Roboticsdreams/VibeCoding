<?php

use App\Controllers\AuthController;
use App\Controllers\TaskController;
use App\Middlewares\AuthMiddleware;

// Authentication Routes
$router->post('/api/login', [AuthController::class, 'login']);
$router->post('/api/register', [AuthController::class, 'register']);
$router->get('/api/logout', [AuthController::class, 'logout']);
$router->get('/api/user', [AuthController::class, 'user']);

// Protected Routes (require authentication)
$router->before('GET|POST|PUT|DELETE', '/api/tasks*', function() {
    $auth = new AuthMiddleware();
    $auth->handle();
});

// Task Routes
$router->get('/api/tasks', [TaskController::class, 'index']);
$router->get('/api/tasks/{id}', [TaskController::class, 'show']);
$router->post('/api/tasks', [TaskController::class, 'store']);
$router->put('/api/tasks/{id}', [TaskController::class, 'update']);
$router->delete('/api/tasks/{id}', [TaskController::class, 'destroy']);
$router->post('/api/tasks/{id}/complete', [TaskController::class, 'complete']);
$router->get('/api/tasks/history', [TaskController::class, 'history']);

// Catch-all route for SPA (Single Page Application)
$router->set404(function() {
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
});
