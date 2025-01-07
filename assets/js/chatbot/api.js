/**
 * API-Klasse für die Kommunikation mit ChatGPT
 */
export class ChatAPI {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.systemPrompt = config.systemPrompt;
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-4';
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 Sekunde
    }

    /**
     * Sendet eine Nachricht an die ChatGPT API
     */
    async sendMessage(message, context = []) {
        let retries = 0;
        
        while (retries < this.maxRetries) {
            try {
                const response = await this.makeRequest(message, context);
                return response;
            } catch (error) {
                retries++;
                
                if (retries === this.maxRetries) {
                    console.error('API Error after max retries:', error);
                    throw new Error('API nicht erreichbar nach mehreren Versuchen');
                }

                // Exponentielles Backoff
                await new Promise(resolve => 
                    setTimeout(resolve, this.retryDelay * Math.pow(2, retries - 1))
                );
            }
        }
    }

    /**
     * Führt den eigentlichen API-Request durch
     */
    async makeRequest(message, context) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { 
                        role: "system", 
                        content: this.systemPrompt 
                    },
                    ...context.map(msg => ({
                        role: msg.sender === 'user' ? 'user' : 'assistant',
                        content: msg.text
                    })),
                    { 
                        role: "user", 
                        content: message 
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API-Fehler');
        }

        const data = await response.json();
        return {
            text: data.choices[0].message.content,
            usage: data.usage,
            model: data.model
        };
    }

    /**
     * Prüft die API-Verbindung
     */
    async testConnection() {
        try {
            const response = await this.sendMessage('Test connection');
            return {
                success: true,
                model: response.model
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analysiert den Kontext einer Konversation
     */
    analyzeContext(context) {
        // Extrahiert wichtige Informationen aus dem Kontext
        const keywords = new Set();
        const topics = new Set();
        
        context.forEach(msg => {
            // Hier könnte eine komplexere Analyse stattfinden
            const words = msg.text.toLowerCase().split(' ');
            words.forEach(word => {
                if (word.length > 4) keywords.add(word);
            });
        });

        return {
            keywords: Array.from(keywords),
            topics: Array.from(topics),
            messageCount: context.length
        };
    }
}
