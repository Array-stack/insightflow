class ChatBot {
    constructor() {
        this.messages = [];
        this.userInfo = {};
        this.standardResponses = {
            greeting: "Willkommen bei InsightFlow! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen helfen?",
            contact: "Gerne helfe ich Ihnen weiter. Könnten Sie mir bitte Ihren Namen und Ihre E-Mail-Adresse mitteilen?",
            thanks: "Vielen Dank für Ihre Informationen! Wie kann ich Ihnen konkret weiterhelfen?",
            goodbye: "Danke für Ihr Interesse! Wir werden uns bald bei Ihnen melden."
        };
    }

    async init() {
        this.chatContainer = document.createElement('div');
        this.chatContainer.className = 'chat-container';
        document.body.appendChild(this.chatContainer);

        this.createChatInterface();
        this.addEventListeners();
        
        // Chat startet minimiert
        this.chatContainer.querySelector('.chat-widget').classList.add('minimized');
    }

    createChatInterface() {
        this.chatContainer.innerHTML = `
            <div class="chat-widget">
                <div class="chat-header">
                    <h3>InsightFlow Support</h3>
                    <button class="minimize-btn">_</button>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" placeholder="Ihre Nachricht...">
                    <button class="send-btn">Senden</button>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        const input = this.chatContainer.querySelector('input');
        const sendBtn = this.chatContainer.querySelector('.send-btn');
        const minimizeBtn = this.chatContainer.querySelector('.minimize-btn');

        // Event Listener für den Support-Bereich "Chat starten" Button
        const supportChatBtn = document.querySelector('#contact .support-chat-btn');
        if (supportChatBtn) {
            supportChatBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openChat();
            });
        }

        sendBtn.addEventListener('click', () => this.handleUserInput(input));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput(input);
        });
        minimizeBtn.addEventListener('click', () => this.toggleChat());
    }

    async handleUserInput(input) {
        const message = input.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        input.value = '';

        // Verarbeite Benutzereingabe
        if (!this.userInfo.name) {
            await this.handleNameInput(message);
        } else if (!this.userInfo.email) {
            await this.handleEmailInput(message);
        } else {
            await this.handleGeneralInput(message);
        }
    }

    async handleNameInput(message) {
        this.userInfo.name = message;
        this.addMessage('bot', "Danke! Und wie lautet Ihre E-Mail-Adresse?");
    }

    async handleEmailInput(message) {
        if (this.validateEmail(message)) {
            this.userInfo.email = message;
            this.saveUserInfo();
            this.addMessage('bot', this.standardResponses.thanks);
        } else {
            this.addMessage('bot', "Bitte geben Sie eine gültige E-Mail-Adresse ein.");
        }
    }

    async handleGeneralInput(message) {
        // Hier würde die ChatGPT API Integration kommen
        const response = await this.getAIResponse(message);
        this.addMessage('bot', response);
    }

    async getAIResponse(message) {
        // Hier würde der API Call zu ChatGPT erfolgen
        // Beispielantwort für Demo-Zwecke
        return "Danke für Ihre Anfrage. Ein Mitarbeiter wird sich in Kürze bei Ihnen melden.";
    }

    addMessage(sender, text) {
        const messagesDiv = this.chatContainer.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        this.messages.push({ sender, text, timestamp: new Date() });
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    saveUserInfo() {
        // Hier würden die Daten an den Server gesendet
        console.log('Gespeicherte Benutzerinformationen:', this.userInfo);
        
        // Beispiel für localStorage Speicherung
        const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
        contacts.push({
            ...this.userInfo,
            timestamp: new Date(),
            messages: this.messages
        });
        localStorage.setItem('chatContacts', JSON.stringify(contacts));
    }

    openChat() {
        const widget = this.chatContainer.querySelector('.chat-widget');
        if (widget.classList.contains('minimized')) {
            widget.classList.remove('minimized');
            if (this.messages.length === 0) {
                this.addMessage('bot', this.standardResponses.greeting);
            }
        }
    }

    toggleChat() {
        const widget = this.chatContainer.querySelector('.chat-widget');
        widget.classList.toggle('minimized');
    }
}
