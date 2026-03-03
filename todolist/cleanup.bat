@echo off
echo Cleaning up old files...

echo Removing old PHP files...
del /q add_task.php complete_task.php database.php delete_task.php fetch_tasks.php home.php index.php login.php logout.php progress_task.php register.php task_history.php todolist.php update_task.php

echo Removing old SQL file...
del /q todo_list.sql

echo Cleanup complete!
pause
