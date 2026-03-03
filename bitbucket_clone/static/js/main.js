// Main JavaScript functionality for Bitbucket Clone
document.addEventListener('DOMContentLoaded', function() {
    // Initialize application
    initializeApp();
});

function initializeApp() {
    setupSearchFunctionality();
    setupUserMenu();
    setupNavigationHighlight();
    setupBuildFilters();
    setupResponsiveNavigation();
    setupNavDropdowns();
}

// Avatar fallback handler
function handleAvatarError(imgElement) {
    if (!imgElement || imgElement.dataset.fallbackApplied === 'true') {
        return;
    }

    const name = (imgElement.getAttribute('data-name') || imgElement.alt || 'U').trim();
    const initial = name.charAt(0).toUpperCase() || 'U';
    const size = imgElement.getBoundingClientRect().width || imgElement.width || 40;
    const shape = imgElement.dataset.shape === 'square' ? 'square' : 'circle';
    const color = getAvatarColor(name);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.classList.add('avatar-fallback-svg');
    if (shape === 'square') {
        svg.classList.add('avatar-fallback-square');
    }

    const background = document.createElementNS(svgNS, shape === 'square' ? 'rect' : 'circle');
    if (shape === 'square') {
        background.setAttribute('x', '0');
        background.setAttribute('y', '0');
        background.setAttribute('width', '100');
        background.setAttribute('height', '100');
        background.setAttribute('rx', '12');
    } else {
        background.setAttribute('cx', '50');
        background.setAttribute('cy', '50');
        background.setAttribute('r', '50');
    }
    background.setAttribute('fill', color);

    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', '50');
    text.setAttribute('y', '50');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('fill', '#ffffff');
    text.setAttribute('font-size', '52');
    text.setAttribute('font-weight', '600');
    text.textContent = initial;

    svg.appendChild(background);
    svg.appendChild(text);

    imgElement.dataset.fallbackApplied = 'true';
    imgElement.replaceWith(svg);
}

function getAvatarColor(name) {
    const palette = ['#0052cc', '#36B37E', '#6554C0', '#FF5630', '#FFAB00', '#00B8D9'];
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palette.length;
    return palette[index];
}

function setupNavDropdowns() {
    const dropdowns = document.querySelectorAll('[data-dropdown]');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('[data-toggle]');
        if (!toggle) return;
        toggle.addEventListener('click', () => {
            const isOpen = dropdown.classList.contains('open');
            dropdowns.forEach(d => d.classList.remove('open'));
            if (!isOpen) {
                dropdown.classList.add('open');
            }
        });
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('[data-dropdown]')) {
            dropdowns.forEach(dropdown => dropdown.classList.remove('open'));
        }
    });
}

// Search functionality
function setupSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }
}

function handleSearch(e) {
    const query = e.target.value;
    if (query.length > 2) {
        // Debounce search
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    }
}

function performSearch(query) {
    console.log('Searching for:', query);
    // In a real application, this would make an API call
    // For demo purposes, we'll just log the search
}

// User menu functionality
function setupUserMenu() {
    const userAvatar = document.querySelector('.user-avatar');
    const userMenuToggle = document.querySelector('.user-menu');
    if (userAvatar) {
        userAvatar.addEventListener('click', toggleUserMenu);
    }
    if (userMenuToggle) {
        userMenuToggle.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closeUserMenu();
            }
        });
    }
}

function toggleUserMenu() {
    const dropdown = document.querySelector('.user-dropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('show');
}

// Navigation highlighting
function setupNavigationHighlight() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && (currentPath === href || currentPath.includes(href))) {
            item.classList.add('active');
        }
    });
}

// Build filters functionality
function setupBuildFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.textContent.trim();
            filterBuilds(filter);
        });
    });
}

function filterBuilds(filter) {
    console.log('Filtering builds by:', filter);
    // In a real application, this would filter the build list
    // For demo purposes, we'll just log the filter
}

// Responsive navigation
function setupResponsiveNavigation() {
    // Add mobile menu toggle if needed
    if (window.innerWidth <= 768) {
        createMobileMenuToggle();
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            createMobileMenuToggle();
        } else {
            removeMobileMenuToggle();
        }
    });
}

function createMobileMenuToggle() {
    if (document.querySelector('.mobile-menu-toggle')) return;
    
    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.innerHTML = '<i class="fas fa-bars"></i>';
    toggle.addEventListener('click', toggleMobileMenu);
    
    const headerLeft = document.querySelector('.header-left');
    if (headerLeft) {
        headerLeft.appendChild(toggle);
    }
}

function removeMobileMenuToggle() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (toggle) {
        toggle.remove();
    }
}

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.user-menu')) {
        closeUserMenu();
    }
});

function closeUserMenu() {
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add loading states for buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
        if (this.classList.contains('btn-merge')) {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Merging...';
            this.disabled = true;
            
            // Simulate loading
            setTimeout(() => {
                this.innerHTML = 'Merge';
                this.disabled = false;
                showNotification('Action completed!', 'success');
            }, 2000);
        }
    });
});
