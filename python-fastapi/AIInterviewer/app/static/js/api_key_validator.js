/**
 * API Key Validator for OpenAI integration
 * Checks if a valid OpenAI API key is configured
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to validate API key status
    async function checkApiKeyStatus() {
        try {
            const response = await fetch('/api/openai/validate-key', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (!data.valid) {
                showApiKeyWarning(data.message);
            }
        } catch (error) {
            console.error('Error checking API key status:', error);
            showApiKeyWarning('Unable to validate OpenAI API key. Some features may not work.');
        }
    }
    
    // Function to show API key warning
    function showApiKeyWarning(message) {
        // Check if we're on an AI interview related page
        const isAiPage = window.location.pathname.includes('/interview/ai-') || 
                        window.location.pathname.includes('/interview/create-dynamic') ||
                        window.location.pathname.includes('/interview/dynamic-');
        
        if (!isAiPage) {
            return; // Only show warning on AI-related pages
        }
        
        // Create warning element
        const warningDiv = document.createElement('div');
        warningDiv.className = 'alert alert-warning alert-dismissible fade show mt-3';
        warningDiv.setAttribute('role', 'alert');
        
        warningDiv.innerHTML = `
            <h5><i class="fas fa-exclamation-triangle me-2"></i>OpenAI API Key Issue</h5>
            <p>${message}</p>
            <p>Please configure your OpenAI API key in the <code>.env</code> file to use AI-powered features.</p>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insert warning at the top of the container
        const container = document.querySelector('.container') || document.querySelector('.container-fluid');
        if (container) {
            container.insertBefore(warningDiv, container.firstChild);
        }
    }
    
    // Check API key status if we're on a page that needs it
    if (window.location.pathname.includes('/interview/')) {
        checkApiKeyStatus();
    }
});
