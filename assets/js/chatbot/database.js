/**
 * Datenbank-Klasse für die Verwaltung von Chat-Konversationen
 * Verwendet IndexedDB für persistente Speicherung
 */
export class ChatDatabase {
    constructor() {
        this.dbName = 'InsightFlowChat';
        this.dbVersion = 1;
        this.db = null;
        this.ready = this.init();
    }

    /**
     * Initialisiert die IndexedDB Datenbank
     */
    async init() {
        try {
            this.db = await this.openDB();
            console.log('ChatDatabase initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize ChatDatabase:', error);
            return false;
        }
    }

    /**
     * Öffnet oder erstellt die IndexedDB Datenbank
     */
    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Conversations Store
                if (!db.objectStoreNames.contains('conversations')) {
                    const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' });
                    conversationStore.createIndex('timestamp', 'timestamp');
                    conversationStore.createIndex('status', 'status');
                    conversationStore.createIndex('userEmail', 'userInfo.email');
                }

                // Failed Requests Store
                if (!db.objectStoreNames.contains('failedRequests')) {
                    const failedStore = db.createObjectStore('failedRequests', { keyPath: 'id' });
                    failedStore.createIndex('timestamp', 'timestamp');
                    failedStore.createIndex('status', 'status');
                }
            };
        });
    }

    /**
     * Speichert eine neue Konversation oder aktualisiert eine bestehende
     */
    async saveConversation(conversation) {
        await this.ready;

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['conversations'], 'readwrite');
                const store = transaction.objectStore('conversations');

                const request = store.put({
                    id: conversation.id || Date.now(),
                    userInfo: conversation.userInfo,
                    messages: conversation.messages,
                    timestamp: new Date(),
                    status: conversation.status
                });

                request.onsuccess = () => {
                    resolve(request.result);
                    
                    // Wenn die Konversation Aufmerksamkeit benötigt
                    if (conversation.status === 'needsAttention') {
                        this.notifySupport(conversation);
                    }
                };

                request.onerror = () => {
                    reject(new Error('Failed to save conversation'));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Speichert fehlgeschlagene API-Anfragen für spätere Verarbeitung
     */
    async saveFailedRequest(request) {
        await this.ready;

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['failedRequests'], 'readwrite');
                const store = transaction.objectStore('failedRequests');

                const failedRequest = {
                    id: Date.now(),
                    request: request,
                    timestamp: new Date(),
                    status: 'pending',
                    retryCount: 0
                };

                const saveRequest = store.add(failedRequest);

                saveRequest.onsuccess = () => resolve(saveRequest.result);
                saveRequest.onerror = () => reject(new Error('Failed to save request'));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Benachrichtigt das Support-Team bei wichtigen Konversationen
     */
    async notifySupport(conversation) {
        // Hier würde die Integration mit dem Support-System erfolgen
        // z.B. API-Call an Ticketing-System oder E-Mail-Versand
        console.log('Support notification for conversation:', conversation.id);
        
        // Beispiel für E-Mail-Benachrichtigung (muss noch implementiert werden)
        const notification = {
            type: 'support_needed',
            conversationId: conversation.id,
            userInfo: conversation.userInfo,
            lastMessage: conversation.messages[conversation.messages.length - 1],
            timestamp: new Date()
        };

        // Speichere die Benachrichtigung für spätere Verarbeitung
        await this.saveFailedRequest(notification);
    }

    /**
     * Lädt eine spezifische Konversation
     */
    async getConversation(id) {
        await this.ready;

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['conversations'], 'readonly');
                const store = transaction.objectStore('conversations');
                const request = store.get(id);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(new Error('Failed to load conversation'));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Lädt alle Konversationen eines Benutzers
     */
    async getUserConversations(email) {
        await this.ready;

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['conversations'], 'readonly');
                const store = transaction.objectStore('conversations');
                const emailIndex = store.index('userEmail');
                const request = emailIndex.getAll(email);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(new Error('Failed to load user conversations'));
            } catch (error) {
                reject(error);
            }
        });
    }
}
