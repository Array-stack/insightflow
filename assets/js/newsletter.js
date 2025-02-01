document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('newsletterForm');
    const emailInput = form.querySelector('#newsletterEmail');
    const submitButton = form.querySelector('button[type="submit"]');
    const submitText = submitButton.querySelector('.submit-text');
    const spinner = submitButton.querySelector('.spinner-border');
    const privacyCheckbox = form.querySelector('#newsletterPrivacy');

    // E-Mail-Validierung mit Regex
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        event.stopPropagation();

        const email = emailInput.value.trim();

        // Zusätzliche Validierungen
        if (!validateEmail(email)) {
            emailInput.setCustomValidity('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
            form.classList.add('was-validated');
            return;
        }

        if (!privacyCheckbox.checked) {
            privacyCheckbox.setCustomValidity('Bitte akzeptieren Sie die Datenschutzerklärung.');
            form.classList.add('was-validated');
            return;
        }

        // Button deaktivieren und Ladeanimation zeigen
        submitButton.disabled = true;
        submitText.style.display = 'none';
        spinner.classList.remove('d-none');

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: '5183720c-076d-4b2d-b546-e83644b1d8a7',
                    email: email,
                    subject: 'Neue Newsletter-Anmeldung',
                    message: `Newsletter-Anmeldung von: ${email}`,
                    from_name: 'Newsletter Subscriber'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Erfolgreiche Anmeldung
                showToast('Erfolgreich!', 'Sie haben sich für unseren Newsletter angemeldet.');
                form.reset();
                form.classList.remove('was-validated');
            } else {
                throw new Error('Newsletter-Anmeldung fehlgeschlagen');
            }
        } catch (error) {
            console.error('Newsletter submission error:', error);
            showToast('Fehler', 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
        } finally {
            // Button-Status zurücksetzen
            submitButton.disabled = false;
            submitText.style.display = 'inline';
            spinner.classList.add('d-none');
        }
    });

    // Zusätzliche Validierung während der Eingabe
    emailInput.addEventListener('input', function() {
        if (validateEmail(this.value.trim())) {
            this.setCustomValidity('');
        }
    });
});

// Toast-Benachrichtigungsfunktion
function showToast(title, message) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

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

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

console.log('Newsletter-Skript erfolgreich geladen.');
