/**
 * UI-Komponenten für den Chatbot
 */
export class ChatUI {
    constructor(config) {
        console.log('Initializing ChatUI with config:', config);
        this.config = config;
        this.container = null;
        this.messageList = null;
        this.input = null;
        this.sendButton = null;
        this.typingIndicator = null;
        this.minimizeButton = null;
        this.isMinimized = true; // Start minimiert
    }

    /**
     * Initialisiert die Chat-UI
     */
    init() {
        console.log('Creating chat widget');
        
        // Erstelle Chat-Widget
        this.createChatWidget();
        
        // Füge Widget zum DOM hinzu
        document.body.appendChild(this.container);
        console.log('Chat widget added to DOM');
        
        // Initialisiere Event Listener
        this.setupEventListeners();
        console.log('Event listeners initialized');
        
        // Zeige Chat-Widget (minimiert)
        setTimeout(() => {
            this.container.style.opacity = '1';
            this.container.style.transform = 'translateY(0)';
            this.container.classList.add('minimized'); // Start minimiert
            console.log('Chat widget visible (minimized)');
        }, 500);
        
        return this.container;
    }

    /**
     * Erstellt das Chat-Widget
     */
    createChatWidget() {
        // Container erstellen
        this.container = document.createElement('div');
        this.container.className = 'chat-widget';
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(20px)';
        this.container.style.transition = 'all 0.3s ease';
        
        // HTML-Struktur
        this.container.innerHTML = `
            <div class="chat-header">
                <div class="chat-title">
                    <i class="fas fa-robot"></i>
                    <span>${this.config.name} Support</span>
                </div>
                <div class="chat-controls">
                    <button class="minimize-btn" title="Minimieren">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </div>
            
            <div class="chat-body">
                <div class="chat-messages"></div>
                <div class="typing-indicator" style="display: none;">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            
            <div class="chat-footer">
                <div class="chat-input-container">
                    <textarea 
                        class="chat-input" 
                        placeholder="Ihre Nachricht..." 
                        rows="1"
                        maxlength="1000"
                    ></textarea>
                    <button class="send-btn" title="Senden">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="chat-info">
                    <small>Powered by ${this.config.name} AI</small>
                </div>
            </div>
        `;
        
        // Speichere wichtige Elemente
        this.messageList = this.container.querySelector('.chat-messages');
        this.input = this.container.querySelector('.chat-input');
        this.sendButton = this.container.querySelector('.send-btn');
        this.typingIndicator = this.container.querySelector('.typing-indicator');
        this.minimizeButton = this.container.querySelector('.minimize-btn');
        
        console.log('Chat widget elements created');
    }

    /**
     * Event-Listener einrichten
     */
    setupEventListeners() {
        // Minimieren/Maximieren
        this.minimizeButton.addEventListener('click', () => {
            this.toggleMinimize();
        });

        // Nachricht senden (Button)
        this.sendButton.addEventListener('click', () => {
            this.triggerSend();
        });

        // Nachricht senden (Enter)
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.triggerSend();
            }
        });

        // Auto-resize für Textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = (this.input.scrollHeight) + 'px';
        });
        
        console.log('Event listeners set up');
    }

    /**
     * Triggert das Senden einer Nachricht
     */
    triggerSend() {
        const message = this.input.value.trim();
        if (message) {
            // Event auslösen
            const event = new CustomEvent('message-send', {
                detail: { message }
            });
            this.container.dispatchEvent(event);
            
            // Input zurücksetzen
            this.input.value = '';
            this.input.style.height = 'auto';
        }
    }

    /**
     * Fügt eine Nachricht zum Chat hinzu
     */
    addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        messageElement.textContent = message.text;
        
        this.messageList.appendChild(messageElement);
        this.messageList.scrollTop = this.messageList.scrollHeight;
    }

    /**
     * Sperrt/Entsperrt den Input
     */
    setInputLock(locked) {
        this.input.disabled = locked;
        this.sendButton.disabled = locked;
    }

    /**
     * Zeigt/Versteckt den Typing-Indikator
     */
    setTypingIndicator(show) {
        this.typingIndicator.style.display = show ? 'flex' : 'none';
        if (show) {
            this.messageList.scrollTop = this.messageList.scrollHeight;
        }
    }

    /**
     * Minimiert/Maximiert den Chat
     */
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.container.classList.toggle('minimized', this.isMinimized);
        
        // Event auslösen
        const event = new CustomEvent('chat-toggle', {
            detail: { isMinimized: this.isMinimized }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * Öffnet den Chat
     */
    openChat() {
        this.isMinimized = false;
        this.container.classList.remove('minimized');
        this.container.style.opacity = '1';
        this.container.style.transform = 'translateY(0)';
        this.input.focus();
    }

    /**
     * Zeigt eine Fehlermeldung
     */
    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'message error-message';
        errorElement.textContent = message;
        
        this.messageList.appendChild(errorElement);
        this.messageList.scrollTop = this.messageList.scrollHeight;
        
        // Fehler nach 5 Sekunden ausblenden
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
}
