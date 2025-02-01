import { apiConfig } from './config.js';

/**
 * API-Klasse für die Kommunikation mit ChatGPT
 * @class ChatAPI
 * @description Verwaltet API-Kommunikation und Konfiguration
 */
export class ChatAPI {
    /**
     * Konstruktor initialisiert API-Konfiguration
     * @param {Object} config - Konfigurationsobjekt
     */
    constructor(config = {}) {
        // Standardkonfiguration mit übergebener Konfiguration mergen
        this.config = {
            apiKey: config.apiKey || apiConfig.apiKey,
            systemPrompt: config.systemPrompt || 'Standardmäßiger Hilfekontext',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            model: config.model || 'gpt-3.5-turbo',
            maxRetries: config.maxRetries || 3,
            timeout: config.timeout || 10000
        };

        // Sicherheitsmaßnahmen für API-Schlüssel
        this.apiKey = this.secureKeyStorage(this.config.apiKey);
    }

    /**
     * Speichert API-Schlüssel sicher
     * @param {string} apiKey - Unverschlüsselter API-Schlüssel
     * @returns {string} Verschlüsselter API-Schlüssel
     */
    secureKeyStorage(apiKey) {
        // Base64-Verschlüsselung
        return window.btoa(apiKey);
    }

    /**
     * Entschlüsselt den API-Schlüssel
     * @returns {string} Entschlüsselter API-Schlüssel
     */
    decodeApiKey() {
        return window.atob(this.apiKey);
    }

    /**
     * Sendet Nachricht an OpenAI API
     * @param {string} message - Benutzer-Nachricht
     * @returns {Promise<Object>} API-Antwort
     */
    async sendMessage(message) {
        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.decodeApiKey()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: [
                        { role: 'system', content: this.config.systemPrompt },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 150
                }),
                timeout: this.config.timeout
            });

            if (!response.ok) {
                throw new Error('API-Anfrage fehlgeschlagen');
            }

            return await response.json();

        } catch (error) {
            this.handleApiError(error);
            throw error;
        }
    }

    async handleUserMessage(message) {
        try {
            this.isProcessing = true;
            this.ui.setInputLock(true);
    
            // Benutzernachricht hinzufügen
            this.addMessage({
                sender: 'user',
                text: message,
                timestamp: new Date()
            });
    
            // Typing-Indikator anzeigen
            this.ui.setTypingIndicator(true);
    
            // API-Verbindung testen (indirekt durch sendMessage)
            const response = await this.api.sendMessage(
                message,
                this.conversation.messages
            );
    
            // Antwort hinzufügen
            this.addMessage({
                sender: 'bot',
                text: response.text,
                timestamp: new Date()
            });
    
            // Konversation speichern
            await this.saveConversation();
    
        } catch (error) {
            console.error('Message handling error:', error);
            
            this.conversation.status = 'needsAttention';
            await this.saveConversation();
    
            this.addMessage({
                sender: 'bot',
                text: responseTemplates.error,
                timestamp: new Date()
            });
    
        } finally {
            this.isProcessing = false;
            this.ui.setInputLock(false);
            this.ui.setTypingIndicator(false);
        }
    }

    /**
     * Behandelt API-Fehler
     * @param {Error} error - Aufgetretener Fehler
     */
    handleApiError(error) {
        console.error('API-Kommunikationsfehler:', {
            message: error.message,
            timestamp: new Date().toISOString()
        });

        // Optional: Fehler-Tracking oder Benachrichtigung
        this.logErrorToMonitoringService(error);
    }

    /**
     * Protokolliert Fehler an Monitoring-Service
     * @param {Error} error - Fehler-Objekt
     */
    logErrorToMonitoringService(error) {
        // Implementieren Sie Ihr Fehler-Tracking
        // z.B. Sentry, LogRocket, etc.
    }

    /**
     * Generiert Fallback-Antwort
     * @returns {string} Fallback-Nachricht
     */
    getFallbackResponse() {
        const fallbackResponses = [
            "Entschuldigung, momentan sind unsere Dienste überlastet.",
            "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später noch einmal.",
            "Unser Support-Team wurde benachrichtigt."
        ];

        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
}

// Beispielhafte Verwendung
export function initializeChatAPI() {
    try {
        const api = new ChatAPI({
            apiKey: process.env.OPENAI_API_KEY,
            systemPrompt: 'Du bist ein freundlicher Kundenservice-Assistent.'
        });

        return api;
    } catch (error) {
        console.error('API-Initialisierung fehlgeschlagen:', error);
        return null;
    }
}