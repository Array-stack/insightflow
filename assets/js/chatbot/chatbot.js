import { ChatAPI } from './api.js';
import { ChatDatabase } from './database.js';
import { ChatUI } from './ui.js';
import { apiConfig, companyConfig, systemPrompt, responseTemplates } from './config.js';

/**
 * Hauptklasse des Chatbots
 */
export class ChatBot {
    constructor() {
        console.log('Initializing ChatBot with config:', { apiConfig, companyConfig });
        
        // Prüfe API-Konfiguration
        if (!apiConfig.apiKey) {
            console.error('Kein API-Key gefunden. Bitte config.template.js als config.local.js kopieren und API-Key einfügen.');
            return;
        }

        // Initialisiere Komponenten
        this.api = new ChatAPI({
            apiKey: apiConfig.apiKey,
            systemPrompt: systemPrompt,
            model: apiConfig.model,
            temperature: apiConfig.temperature,
            maxRetries: apiConfig.maxRetries
        });
        
        this.db = new ChatDatabase();
        this.ui = new ChatUI(companyConfig);
        
        // Konversationsstatus
        this.conversation = {
            id: Date.now(),
            userInfo: {},
            messages: [],
            status: 'new'
        };

        this.isProcessing = false;
        this.apiTested = false; // Neuer Flag für API-Test
        console.log('ChatBot components initialized');
    }

    /**
     * Initialisiert den Chatbot
     */
    async init() {
        try {
            console.log('Starting ChatBot initialization');
            
            // UI initialisieren
            const chatContainer = this.ui.init();
            console.log('UI initialized');
            
            // Event Listener einrichten
            this.setupEventListeners(chatContainer);
            console.log('Event listeners set up');
            
            // Begrüßungsnachricht IMMER senden
            this.addMessage({
                sender: 'bot',
                text: responseTemplates.greeting,
                timestamp: new Date()
            });
            
            console.log('ChatBot initialization completed successfully');

        } catch (error) {
            console.error('Initialization error:', error);
            this.ui.showError('Fehler beim Initialisieren des Chats.');
        }
    }

    /**
     * Richtet Event Listener ein
     */
    setupEventListeners(container) {
        // Nachricht senden
        container.addEventListener('message-send', async (e) => {
            // API-Test NUR beim ERSTEN Senden
            if (!this.apiTested) {
                try {
                    const apiStatus = await this.api.testConnection();
                    console.log('Erster API-Verbindungstest:', apiStatus);
                    
                    if (!apiStatus.success) {
                        console.error('API-Verbindung fehlgeschlagen:', apiStatus.error);
                        this.ui.showError('KI-Antworten derzeit nicht verfügbar. Bitte versuchen Sie es später.');
                        return; // Verhindere Nachrichtenverarbeitung bei Fehler
                    }
                    
                    // Markiere API als getestet
                    this.apiTested = true;
                } catch (error) {
                    console.error('API-Verbindungstest fehlgeschlagen:', error);
                    this.ui.showError('KI-Antworten derzeit nicht verfügbar. Bitte versuchen Sie es später.');
                    return; // Verhindere Nachrichtenverarbeitung bei Fehler
                }
            }

            // Nur wenn API-Test erfolgreich oder bereits getestet
            if (this.isProcessing) return;
            
            const message = e.detail.message;
            await this.handleUserMessage(message);
        });

        // Chat minimieren/maximieren
        container.addEventListener('chat-toggle', (e) => {
            // Entferne API-Test beim Maximieren
            if (!e.detail.isMinimized && this.conversation.messages.length === 0) {
                this.addMessage({
                    sender: 'bot',
                    text: responseTemplates.greeting,
                    timestamp: new Date()
                });
            }
        });
    }

    /**
     * Verarbeitet eine Benutzernachricht
     */
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

            // API-Antwort holen
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
     * Fügt eine Nachricht zur Konversation hinzu
     */
    addMessage(message) {
        this.conversation.messages.push(message);
        this.ui.addMessage(message);
    }

    /**
     * Speichert die aktuelle Konversation
     */
    async saveConversation() {
        try {
            await this.db.saveConversation(this.conversation);
        } catch (error) {
            console.error('Error saving conversation:', error);
            // Hier könnte eine Backup-Strategie implementiert werden
        }
    }

    /**
     * Analysiert die Konversation
     */
    analyzeConversation() {
        return this.api.analyzeContext(this.conversation.messages);
    }

    /**
     * Beendet die aktuelle Konversation
     */
    async endConversation() {
        if (this.conversation.messages.length > 0) {
            this.addMessage({
                sender: 'bot',
                text: responseTemplates.goodbye,
                timestamp: new Date()
            });

            this.conversation.status = 'completed';
            await this.saveConversation();
        }
    }

    /**
     * Öffnet den Chat
     */
    openChat() {
        if (this.ui) {
            this.ui.openChat();
        }
    }
}
