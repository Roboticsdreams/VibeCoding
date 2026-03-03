<?php
require_once __DIR__ . '/../../config/database.php';

class Migration_0001_initial_schema {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function up() {
        try {
            $this->db->beginTransaction();

            // Create users table
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ");

            // Create tasks table
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    due_date DATE,
                    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'overdue')),
                    priority VARCHAR(10) DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ");

            // Create task_history table
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS task_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id INTEGER NOT NULL,
                    changed_field VARCHAR(50) NOT NULL,
                    old_value TEXT,
                    new_value TEXT,
                    changed_by INTEGER,
                    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
                )
            ");

            // Create indexes
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)");
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)");
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON task_history(task_id)");

            // Create default admin user (password: admin123)
            $passwordHash = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("
                INSERT OR IGNORE INTO users (username, email, password_hash) 
                VALUES (:username, :email, :password_hash)
            ");
            $stmt->execute([
                ':username' => 'admin',
                ':email' => 'admin@example.com',
                ':password_hash' => $passwordHash
            ]);

            $this->db->commit();
            echo "Database schema created successfully!\n";
        } catch (Exception $e) {
            $this->db->rollBack();
            die("Migration failed: " . $e->getMessage() . "\n");
        }
    }

    public function down() {
        try {
            $this->db->beginTransaction();
            
            $this->db->exec("DROP TABLE IF EXISTS task_history");
            $this->db->exec("DROP TABLE IF EXISTS tasks");
            $this->db->exec("DROP TABLE IF EXISTS users");
            
            $this->db->commit();
            echo "Database schema dropped successfully!\n";
        } catch (Exception $e) {
            $this->db->rollBack();
            die("Migration rollback failed: " . $e->getMessage() . "\n");
        }
    }
}

// Run the migration
$migration = new Migration_0001_initial_schema();

if (isset($argv[1]) && $argv[1] === 'down') {
    $migration->down();
} else {
    $migration->up();
}
