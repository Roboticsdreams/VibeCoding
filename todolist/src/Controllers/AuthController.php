<?php

namespace App\Controllers;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthController extends Controller
{
    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        $validation = $this->validate($data, [
            'username' => 'required',
            'password' => 'required'
        ]);
        
        if ($validation) {
            return $validation;
        }
        
        // Find user by username
        $user = (new User())->findByUsername($data['username']);
        
        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            return $this->json(['error' => 'Invalid username or password'], 401);
        }
        
        // Generate JWT token
        $token = $this->generateJwt($user['id'], $user['username']);
        
        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        
        return $this->json([
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email']
            ],
            'token' => $token
        ]);
    }
    
    public function register()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        $validation = $this->validate($data, [
            'username' => 'required|min:3|max:50',
            'email' => 'required|email',
            'password' => 'required|min:6'
        ]);
        
        if ($validation) {
            return $validation;
        }
        
        $userModel = new User();
        
        // Check if username or email already exists
        if ($userModel->findByUsername($data['username'])) {
            return $this->json(['error' => 'Username already taken'], 400);
        }
        
        if ($userModel->findByEmail($data['email'])) {
            return $this->json(['error' => 'Email already registered'], 400);
        }
        
        // Create new user
        $userId = $userModel->create([
            'username' => $data['username'],
            'email' => $data['email'],
            'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT)
        ]);
        
        if (!$userId) {
            return $this->json(['error' => 'Failed to create user'], 500);
        }
        
        // Get the newly created user
        $user = $userModel->find($userId);
        
        // Generate JWT token
        $token = $this->generateJwt($user['id'], $user['username']);
        
        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        
        return $this->json([
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email']
            ],
            'token' => $token
        ], 201);
    }
    
    public function logout()
    {
        // Clear session data
        session_unset();
        session_destroy();
        
        // Clear session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        return $this->json(['message' => 'Successfully logged out']);
    }
    
    public function user()
    {
        if (!isset($_SESSION['user_id'])) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }
        
        $user = (new User())->find($_SESSION['user_id']);
        
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }
        
        // Remove sensitive data
        unset($user['password_hash']);
        
        return $this->json(['user' => $user]);
    }
    
    private function generateJwt($userId, $username)
    {
        $issuedAt = time();
        $expire = $issuedAt + $_ENV['JWT_EXPIRES_IN'];
        
        $payload = [
            'iat' => $issuedAt,
            'exp' => $expire,
            'iss' => $_ENV['APP_NAME'],
            'data' => [
                'user_id' => $userId,
                'username' => $username
            ]
        ];
        
        return JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
    }
}
