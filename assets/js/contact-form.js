console.log('Contact form script loaded');

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quickContactForm');
    
    if (!form) {
        console.error('Quick contact form not found!');
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        const submitButton = form.querySelector('button[type="submit"]');
        const buttonText = submitButton.querySelector('.button-text');
        const spinner = submitButton.querySelector('.spinner-border');

        if (form.checkValidity()) {
            // Disable button and show loading state
            submitButton.disabled = true;
            buttonText.style.display = 'none';
            spinner.classList.remove('d-none');

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
                if (data.success) {
                    // Show success message
                    form.reset();
                    showToast('Erfolg!', 'Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze bei Ihnen.');
                    form.classList.remove('was-validated');
                } else {
                    throw new Error('Failed to submit form');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Fehler', 'Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
            })
            .finally(() => {
                // Reset button state
                submitButton.disabled = false;
                buttonText.style.display = 'inline';
                spinner.classList.add('d-none');
            });
        }

        form.classList.add('was-validated');
    });
});

// Toast notification function
function showToast(title, message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastHtml = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    // Initialize and show toast
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}
