console.log('Contact form script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing contact form');
    
    const form = document.getElementById('quickContactForm');
    
    if (!form) {
        console.error('Quick contact form not found!');
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        if (form.checkValidity()) {
            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';

            const formData = new FormData(form);
            
            // Send to Web3Forms
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: '5183720c-076d-4b2d-b546-e83644b1d8a7',
                    name: formData.get('quickName'),
                    email: formData.get('quickEmail'),
                    message: formData.get('quickMessage'),
                    subject: 'Neue Kontaktanfrage',
                    from_name: formData.get('quickName')
                })
            })
            .then(response => response.json())
            .then(data => {
                // Show success message
                form.reset();
                showToast('Erfolg!', 'Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze bei Ihnen.');
                form.classList.remove('was-validated');
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Fehler', 'Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
            })
            .finally(() => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            });
        }

        form.classList.add('was-validated');
    });
});

// Toast notification function
function showToast(title, message) {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;

    const toast = new bootstrap.Toast(toastEl, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = message;
    
    // Entferne vorherige Toast, falls vorhanden
    const existingToast = bootstrap.Toast.getInstance(toastEl);
    if (existingToast) {
        existingToast.dispose();
    }
    
    toast.show();
}
