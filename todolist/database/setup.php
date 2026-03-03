<?php
// Ensure the database directory exists
$databaseDir = __DIR__ . '/database';
if (!file_exists($databaseDir)) {
    if (!mkdir($databaseDir, 0755, true)) {
        die("Failed to create database directory\n");
    }
}

// Check if SQLite is available
if (!extension_loaded('pdo_sqlite')) {
    die("Error: SQLite PDO extension is not enabled. Please enable it in your php.ini file.\n");
}

// Include database configuration
require_once __DIR__ . '/config/database.php';

// Get all migration files
$migrationFiles = glob(__DIR__ . '/database/migrations/*.php');
sort($migrationFiles);

// Run each migration
foreach ($migrationFiles as $migrationFile) {
    echo "Running migration: " . basename($migrationFile) . "\n";
    
    // Include the migration file
    $migration = require_once $migrationFile;
    
    if (is_object($migration)) {
        if (method_exists($migration, 'up')) {
            $migration->up();
        } else {
            echo "Warning: Migration " . basename($migrationFile) . " does not have an 'up' method\n";
        }
    } else {
        echo "Warning: Migration " . basename($migrationFile) . " did not return an object\n";
    }
}

echo "\nDatabase setup completed successfully!\n";

// Create a test task for the admin user
$db = Database::getInstance();
$pdo = $db->getConnection();

try {
    // Check if we already have the admin user
    $admin = $db->queryOne("SELECT id FROM users WHERE username = 'admin'");
    
    if ($admin) {
        // Check if admin already has tasks
        $taskCount = $db->queryOne("SELECT COUNT(*) as count FROM tasks WHERE user_id = :user_id", [':user_id' => $admin['id']]);
        
        if ($taskCount['count'] == 0) {
            // Add a sample task
            $db->execute("
                INSERT INTO tasks (user_id, title, description, due_date, status, priority)
                VALUES (:user_id, :title, :description, :due_date, :status, :priority)
            ", [
                ':user_id' => $admin['id'],
                ':title' => 'Welcome to Your Todo List',
                ':description' => 'This is a sample task. You can edit or delete it.',
                ':due_date' => date('Y-m-d', strtotime('+1 day')),
                ':status' => 'pending',
                ':priority' => 'medium'
            ]);
            
            echo "Added a sample task for the admin user.\n";
        }
    }
} catch (Exception $e) {
    echo "Warning: Could not create sample task - " . $e->getMessage() . "\n";
}

echo "\nYou can now access the application at http://localhost:8000\n";
echo "Default login credentials:\n";
echo "Username: admin\n";
echo "Password: admin123\n\n";
echo "IMPORTANT: Please change the default password after your first login!\n";
