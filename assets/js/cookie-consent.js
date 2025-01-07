class CookieConsent {
    constructor() {
        this.cookieConsent = document.getElementById('cookieConsent');
        this.cookieSettings = {
            essential: true,
            analytics: false,
            marketing: false
        };
        
        // Sofort initialisieren, ohne auf DOMContentLoaded zu warten
        this.init();
    }

    init() {
        // Banner immer beim Start anzeigen
        this.showBanner();
        const savedSettings = this.getCookie('cookie_settings');
        if (savedSettings) {
            this.cookieSettings = JSON.parse(savedSettings);
            this.applySettings();
        }

        this.setupEventListeners();
        
        // Cookie Settings Link im Footer
        const openCookieSettingsBtn = document.getElementById('openCookieSettings');
        if (openCookieSettingsBtn) {
            openCookieSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showBanner();
                // Öffne direkt die Einstellungen
                document.getElementById('cookieSettings').style.display = 'block';
                document.getElementById('showSettings').textContent = 'Einstellungen schließen';
                document.getElementById('saveSettings').style.display = 'block';
            });
        }
    }

    setupEventListeners() {
        // Einstellungen anzeigen/verstecken
        const showSettingsBtn = document.getElementById('showSettings');
        const settingsDiv = document.getElementById('cookieSettings');
        const saveSettingsBtn = document.getElementById('saveSettings');
        
        showSettingsBtn.addEventListener('click', () => {
            const isVisible = settingsDiv.style.display !== 'none';
            settingsDiv.style.display = isVisible ? 'none' : 'block';
            showSettingsBtn.textContent = isVisible ? 'Einstellungen' : 'Einstellungen schließen';
            saveSettingsBtn.style.display = isVisible ? 'none' : 'block';
        });

        // Einstellungen speichern
        saveSettingsBtn.addEventListener('click', () => {
            this.cookieSettings = {
                essential: true,
                analytics: document.getElementById('analyticsCookies').checked,
                marketing: document.getElementById('marketingCookies').checked
            };
            this.saveSettings();
        });

        // Alle Cookies akzeptieren
        const acceptBtn = document.getElementById('acceptCookies');
        acceptBtn.addEventListener('click', () => {
            this.cookieSettings = {
                essential: true,
                analytics: true,
                marketing: true
            };
            this.saveSettings();
        });

        // Alle Cookies ablehnen (außer essenzielle)
        const rejectBtn = document.getElementById('rejectCookies');
        rejectBtn.addEventListener('click', () => {
            this.cookieSettings = {
                essential: true,
                analytics: false,
                marketing: false
            };
            this.saveSettings();
        });

        // Checkbox Event Listener
        ['analyticsCookies', 'marketingCookies'].forEach(id => {
            const checkbox = document.getElementById(id);
            checkbox.addEventListener('change', () => {
                const key = id.replace('Cookies', '').toLowerCase();
                this.cookieSettings[key] = checkbox.checked;
            });
        });
    }

    showBanner() {
        this.cookieConsent.classList.add('show');
    }

    hideBanner() {
        this.cookieConsent.classList.remove('show');
    }

    saveSettings() {
        this.setCookie('cookie_settings', JSON.stringify(this.cookieSettings), 365);
        this.applySettings();
        this.hideBanner();
    }

    applySettings() {
        // Analytics Cookies
        if (this.cookieSettings.analytics) {
            this.enableGoogleAnalytics();
        } else {
            this.disableGoogleAnalytics();
        }

        // Marketing Cookies
        if (this.cookieSettings.marketing) {
            this.enableMarketing();
        } else {
            this.disableMarketing();
        }

        // Update checkboxes
        document.getElementById('analyticsCookies').checked = this.cookieSettings.analytics;
        document.getElementById('marketingCookies').checked = this.cookieSettings.marketing;
    }

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

// Sofortige Initialisierung
new CookieConsent();
