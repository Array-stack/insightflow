// Newsletter Logging
function logNewsletterSignup(email) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        email: email,
        source: 'Artikel-Seite'
    };

    // Lokale Speicherung
    try {
        const existingLogs = JSON.parse(localStorage.getItem('newsletterSignups') || '[]');
        existingLogs.push(logEntry);
        localStorage.setItem('newsletterSignups', JSON.stringify(existingLogs));
        console.log('Newsletter-Anmeldung geloggt:', logEntry);
    } catch (error) {
        console.error('Logging-Fehler:', error);
    }
}

// Funktion zum Anzeigen der Logs
function displayNewsletterLogs() {
    try {
        const logs = JSON.parse(localStorage.getItem('newsletterSignups') || '[]');
        console.group('📧 Newsletter Anmeldungen');
        console.table(logs);
        console.groupEnd();
    } catch (error) {
        console.error('Fehler beim Laden der Logs:', error);
    }
}

// Optional: Log-Export-Funktion
function exportNewsletterLogs() {
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
}

// Globale Verfügbarkeit der Funktionen
window.logNewsletterSignup = logNewsletterSignup;
window.displayNewsletterLogs = displayNewsletterLogs;
window.exportNewsletterLogs = exportNewsletterLogs;

console.log('Newsletter Logging initialisiert.');
