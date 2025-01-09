document.addEventListener('DOMContentLoaded', function() {
    // Sicherstellen, dass die Elemente existieren
    const form = document.getElementById('newsletterForm');
    if (!form) {
        console.error('Newsletter form not found');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) {
        console.error('Submit button not found');
        return;
    }

    const submitText = submitButton.querySelector('.submit-text');
    const spinner = submitButton.querySelector('.spinner-border');

    if (!submitText || !spinner) {
        console.error('Submit text or spinner elements not found');
        return;
    }

    // Form validation and submission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        event.stopPropagation();

        form.classList.add('was-validated');

        if (form.checkValidity()) {
            // Show loading state
            submitButton.disabled = true;
            submitText.textContent = 'Wird angemeldet...';
            spinner.classList.remove('d-none');

            try {
                // Collect form data
                const formData = new FormData(form);
                const email = formData.get('email');
                const privacy = formData.get('newsletterPrivacy');

                // API call simulation
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        access_key: 'WEB3FORMS_API_KEY', // Ihr Web3Forms API-Key
                        email: email,
                        subject: 'Neue Newsletter-Anmeldung',
                        from_name: 'Newsletter Subscriber'
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    // Success handling bleibt gleich
                } else {
                    throw new Error('Failed to submit newsletter subscription');
                }

                // Show success message
                showToast('Erfolgreich angemeldet!', 'Sie erhalten in Kürze eine Bestätigungs-E-Mail.');
                
                // Reset form
                form.reset();
                form.classList.remove('was-validated');
            } catch (error) {
                console.error('Newsletter submission error:', error);
                showToast('Fehler', 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitText.textContent = 'Anmelden';
                spinner.classList.add('d-none');
            }
        }
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
