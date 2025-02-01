class CookieConsent {
    constructor() {
        this.cookieConsent = null;
        this.cookieSettings = {
            essential: true,
            analytics: false,
            marketing: false,
            consent_given: false
        };
        
        // Warten, bis das DOM vollständig geladen ist
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeElements();
            this.setupEventListeners();
            this.loadSavedSettings();
        });
    }

    initializeElements() {
        this.cookieConsent = document.getElementById('cookieConsent');
        this.openCookieSettingsBtn = document.getElementById('openCookieSettings');
        this.cookieSettingsDiv = document.getElementById('cookieSettings');
        this.showSettingsBtn = document.getElementById('showSettings');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        this.analyticsCookiesCheckbox = document.getElementById('analyticsCookies');
        this.marketingCookiesCheckbox = document.getElementById('marketingCookies');
    }

    loadSavedSettings() {
        const savedSettings = this.getCookie('cookie_settings');
        
        // Wenn KEINE Einstellungen gespeichert, Banner anzeigen
        if (!savedSettings) {
            this.showBanner();
        } else {
            const parsedSettings = JSON.parse(savedSettings);
            if (!parsedSettings.consent_given) {
                this.showBanner();
            } else {
                this.cookieSettings = parsedSettings;
                this.applySettings();
                this.hideBanner();
            }
        }
    }
    
    showBanner() {
        if (this.cookieConsent) {
            this.cookieConsent.classList.add('show');
            this.cookieConsent.style.display = 'block';
        }
    
        // Einstellungen standardmäßig geschlossen
        if (this.cookieSettingsDiv) {
            this.cookieSettingsDiv.style.display = 'none';
        }
    
        // Button-Text auf "Einstellungen"
        if (this.showSettingsBtn) {
            this.showSettingsBtn.textContent = 'Einstellungen';
        }
    
        // Speichern-Button verstecken
        if (this.saveSettingsBtn) {
            this.saveSettingsBtn.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Footer Cookie-Einstellungen Link
        if (this.openCookieSettingsBtn) {
            this.openCookieSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCookieSettings();
            });
        }
    
        // Buttons
        const acceptBtn = document.getElementById('acceptCookies');
    
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptAllCookies());
        }
    
        // Zusätzliche Event Listener
        if (this.showSettingsBtn) {
            this.showSettingsBtn.addEventListener('click', () => this.toggleCookieSettings());
        }
    
        if (this.saveSettingsBtn) {
            this.saveSettingsBtn.addEventListener('click', () => this.saveCookieSettings());
        }
    }
    
    // Entferne die Methode rejectNonEssentialCookies() komplett

    openCookieSettings() {
        if (this.cookieConsent) {
            this.cookieConsent.classList.add('show');
            this.cookieConsent.style.display = 'block';
        }

        if (this.cookieSettingsDiv) {
            this.cookieSettingsDiv.style.display = 'block';
        }

        if (this.showSettingsBtn) {
            this.showSettingsBtn.textContent = 'Einstellungen schließen';
        }

        // Speichern-Button nur zeigen, wenn Einstellungen geöffnet sind
        if (this.saveSettingsBtn) {
            this.saveSettingsBtn.style.display = 'block';
        }
    }

    toggleCookieSettings() {
        if (this.cookieSettingsDiv) {
            const isVisible = this.cookieSettingsDiv.style.display !== 'none';
            
            // Nur den Einstellungsbereich öffnen/schließen
            this.cookieSettingsDiv.style.display = isVisible ? 'none' : 'block';
            
            if (this.showSettingsBtn) {
                this.showSettingsBtn.textContent = isVisible ? 'Einstellungen' : 'Einstellungen schließen';
            }
    
            // Speichern-Button nur zeigen, wenn Einstellungen sichtbar sind
            if (this.saveSettingsBtn) {
                this.saveSettingsBtn.style.display = isVisible ? 'none' : 'block';
            }
        }
    }

    acceptAllCookies() {
        this.cookieSettings = {
            essential: true,
            analytics: true,
            marketing: true,
            consent_given: true
        };
        this.saveSettings();
    }

    rejectNonEssentialCookies() {
        this.cookieSettings = {
            essential: true,
            analytics: false,
            marketing: false,
            consent_given: true
        };
        this.saveSettings();
    }

    saveCookieSettings() {
        this.cookieSettings = {
            essential: true,
            analytics: this.analyticsCookiesCheckbox.checked,
            marketing: this.marketingCookiesCheckbox.checked,
            consent_given: true
        };
        this.saveSettings();
    }

    saveSettings() {
        // Speichere Einstellungen mit Ablaufdatum von 365 Tagen
        this.setCookie('cookie_settings', JSON.stringify(this.cookieSettings), 365);
        this.applySettings();
        this.hideBanner();
    }

    applySettings() {
        // Analytics Cookies
        if (this.analyticsCookiesCheckbox) {
            this.analyticsCookiesCheckbox.checked = this.cookieSettings.analytics;
        }

        // Marketing Cookies
        if (this.marketingCookiesCheckbox) {
            this.marketingCookiesCheckbox.checked = this.cookieSettings.marketing;
        }

        // Google Analytics Consent
        if (this.cookieSettings.analytics) {
            this.enableGoogleAnalytics();
        } else {
            this.disableGoogleAnalytics();
        }

        // Marketing Consent
        if (this.cookieSettings.marketing) {
            this.enableMarketing();
        } else {
            this.disableMarketing();
        }
    }

    hideBanner() {
        if (this.cookieConsent) {
            this.cookieConsent.classList.remove('show');
            this.cookieConsent.style.display = 'none';
        }
    }

    // Weitere Methoden wie Google Analytics Consent
    enableGoogleAnalytics() {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }

    disableGoogleAnalytics() {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
    }

    enableMarketing() {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': 'granted'
            });
        }
    }

    disableMarketing() {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': 'denied'
            });
        }
    }

    // Cookie-Hilfsmethoden
    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + (value || "") + expires + "; path=/; Secure; SameSite=Strict";
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
}

// Initialisierung
new CookieConsent();