// Web3Forms Kontaktformular Handling
document.addEventListener('DOMContentLoaded', function() {
    // Konfiguration
    const WEB3FORMS_API_KEY = '5183720c-076d-4b2d-b546-e83644b1d8a7';
    const forms = document.querySelectorAll('#quickContactForm, #contactForm');
    
    forms.forEach(form => {
        if (!form) {
            console.error('Kontaktformular nicht gefunden!');
            return;
        }

        form.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();

            const submitButton = form.querySelector('button[type="submit"]');
            const buttonText = submitButton.querySelector('.button-text, .submit-text');
            const spinner = submitButton.querySelector('.spinner-border');

            // Formular-Validierung
            if (form.checkValidity()) {
                // Button deaktivieren und Ladeanimation zeigen
                submitButton.disabled = true;
                buttonText.style.display = 'none';
                spinner.classList.remove('d-none');

                const formData = new FormData(form);
                
                // Dynamische Feldnamen-Zuordnung
                const submissionData = {
                    access_key: WEB3FORMS_API_KEY,
                    name: formData.get('quickName') || formData.get('name'),
                    email: formData.get('quickEmail') || formData.get('email'),
                    phone: formData.get('quickPhone') || formData.get('phone'),
                    company: formData.get('quickCompany') || formData.get('company'),
                    message: formData.get('quickMessage') || formData.get('message'),
                    subject: 'Neue Kontaktanfrage von der Website',
                    from_name: formData.get('quickName') || formData.get('name')
                };

                // An Web3Forms senden
                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(submissionData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Erfolgsmeldung
                        form.reset();
                        showToast('Erfolg!', 'Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze bei Ihnen.');
                        form.classList.remove('was-validated');
                    } else {
                        throw new Error('Formularübermittlung fehlgeschlagen');
                    }
                })
                .catch(error => {
                    console.error('Fehler:', error);
                    showToast('Fehler', 'Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
                })
                .finally(() => {
                    // Button-Status zurücksetzen
                    submitButton.disabled = false;
                    buttonText.style.display = 'inline';
                    spinner.classList.add('d-none');
                });
            }

            form.classList.add('was-validated');
        });
    });
});

// Toast-Benachrichtigungsfunktion
function showToast(title, message) {
    // Toast-Container erstellen, falls nicht vorhanden
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    // Toast-Element erstellen
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

    // Toast zum Container hinzufügen
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    // Toast initialisieren und anzeigen
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // Toast nach Ausblenden entfernen
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// Debug-Logging
console.log('Kontaktformular-Skript erfolgreich geladen.');
