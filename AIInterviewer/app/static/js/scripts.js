// Main JavaScript for TechInterviewer

document.addEventListener('DOMContentLoaded', function() {
    // Fixed header handling
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        // Add the fixed-top class if not present
        if (!navbar.classList.contains('fixed-top')) {
            navbar.classList.add('fixed-top');
        }
        
        // Adjust body padding to account for navbar height
        document.body.style.paddingTop = navbar.offsetHeight + 'px';
    }
    
    // Debug mode toggle (press Ctrl+Shift+D)
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            document.body.classList.toggle('dev-mode');
            console.log('Debug mode:', document.body.classList.contains('dev-mode'));
        }
    });
    
    // Show all debug info in development environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        document.querySelectorAll('.debug-info').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    // Interview answer form handling
    const answerForm = document.querySelector('form[action*="/answer-question/"]');
    if (answerForm) {
        answerForm.addEventListener('submit', function(e) {
            // Add a hidden field with the current timestamp
            const timestampField = document.createElement('input');
            timestampField.type = 'hidden';
            timestampField.name = 'timestamp';
            timestampField.value = new Date().toISOString();
            this.appendChild(timestampField);
            
            // Log form submission for debugging
            console.log('Submitting answer form:', this.action);
        });
    }
});
