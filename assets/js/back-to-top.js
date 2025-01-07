// Back to top button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create back to top button
    const button = document.createElement('a');
    button.href = '#';
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Zurück nach oben');
    
    // Create SVG icon
    button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
    `;
    
    // Add button to body
    document.body.appendChild(button);
    
    // Show button when scrolling down
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });

    // Smooth scroll to top
    button.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
