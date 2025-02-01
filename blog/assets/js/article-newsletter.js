document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('newsletterEmail');
    const submitButton = form.querySelector('button[type="submit"]');
    const privacyCheckbox = document.getElementById('newsletterPrivacy');

    // Logging-Funktion
    function logNewsletterSignup(email) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            email: email,
            source: 'Artikel-Seite'
        };

        try {
            const existingLogs = JSON.parse(localStorage.getItem('newsletterSignups') || '[]');
            existingLogs.push(logEntry);
            localStorage.setItem('newsletterSignups', JSON.stringify(existingLogs));
            console.log('Newsletter-Anmeldung geloggt:', logEntry);
        } catch (error) {
            console.error('Logging-Fehler:', error);
        }
    }

    // E-Mail-Validierung
    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    // Toast-Benachrichtigung
    function showToast(title, message, type = 'success') {
        const toastContainer = document.getElementById('toast-container') || createToastContainer();
        
        const toastClasses = {
            success: 'text-bg-success',
            warning: 'text-bg-warning',
            error: 'text-bg-danger'
        };

        const toastHTML = `
            <div class="toast align-items-center ${toastClasses[type]} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <strong>${title}</strong> ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        toastContainer.innerHTML = toastHTML;
        const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
        toast.show();
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3 z-3';
        document.body.appendChild(container);
        return container;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();

        // Validierungen
        if (!email) {
            showToast('Fehler', 'Bitte geben Sie eine E-Mail-Adresse ein.', 'warning');
            return;
        }

        if (!validateEmail(email)) {
            showToast('Fehler', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'warning');
            return;
        }

        if (!privacyCheckbox.checked) {
            showToast('Hinweis', 'Bitte akzeptieren Sie die Datenschutzbestimmungen.', 'warning');
            return;
        }

        // Button deaktivieren
        submitButton.disabled = true;

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
                    subject: 'Newsletter-Anmeldung Artikel-Seite',
                    message: `Newsletter-Anmeldung von: ${email}`,
                    from_name: 'Artikel-Newsletter Subscriber'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Lokales Logging
                logNewsletterSignup(email);

                showToast('Erfolgreich!', 'Sie haben sich für unseren Newsletter angemeldet.');
                form.reset();
            } else {
                throw new Error('Newsletter-Anmeldung fehlgeschlagen');
            }
        } catch (error) {
            console.error('Newsletter-Anmeldung Fehler:', error);
            showToast('Fehler', 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.', 'error');
        } finally {
            // Button wieder aktivieren
            submitButton.disabled = false;
        }
    });

    // Debugging-Funktionen global verfügbar machen
    window.displayNewsletterLogs = function() {
        try {
            const logs = JSON.parse(localStorage.getItem('newsletterSignups') || '[]');
            console.group('📧 Newsletter Anmeldungen');
            console.table(logs);
            console.groupEnd();
        } catch (error) {
            console.error('Fehler beim Laden der Logs:', error);
        }
    };

    window.exportNewsletterLogs = function() {
        const logs = JSON.parse(localStorage.getItem('newsletterSignups') || '[]');
        const csvContent = "data:text/csv;charset=utf-8," 
            + logs.map(e => `${e.timestamp},${e.email},${e.source}`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "newsletter_signups.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    console.log('Artikel-Newsletter-Skript erfolgreich geladen.');
});
