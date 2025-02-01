document.addEventListener('DOMContentLoaded', function() {
    // Konfiguration
    const CONFIG = {
        METADATA_URL: 'articles/article-metadata.json',
        ARTICLE_BASE_URL: 'article.html',
        MAX_PREVIEW_ARTICLES: 9,
        FALLBACK_IMAGE: '/assets/images/default-article-image.jpg'
    };

    // Referenzen
    const blogContainer = document.querySelector('.blog-preview-container');
    const loadingIndicator = document.getElementById('blog-loading');

    // Logging-Utility
    const Logger = {
        log: (message) => console.log(`[Blog Preview] ${message}`),
        error: (message) => console.error(`[Blog Preview Error] ${message}`)
    };

    // Formatierungs-Hilfsfunktionen
    const Formatter = {
        truncateText: (text, maxLength = 150) => 
            text.length > maxLength ? `${text.slice(0, maxLength)}...` : text,
        
        formatDate: (dateString) => {
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('de-DE', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                });
            } catch (error) {
                Logger.error(`Datumsformatierung fehlgeschlagen: ${error}`);
                return dateString;
            }
        }
    };

    // Fehlerbehandlung
    function displayError(message) {
        loadingIndicator.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    <h4>Fehler beim Laden</h4>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" class="btn btn-primary mt-3">
                        Seite neu laden
                    </button>
                </div>
            </div>
        `;
    }

    // Artikel-Vorschau generieren
    function createArticlePreview(article) {
        const { id, title, summary, imageUrl, date, readTime, author } = article;

        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100 blog-preview-card">
                    <img 
                        src="${imageUrl || CONFIG.FALLBACK_IMAGE}" 
                        class="card-img-top" 
                        alt="${title}" 
                        onerror="this.src='${CONFIG.FALLBACK_IMAGE}'"
                        loading="lazy"
                    >
                    <div class="card-body">
                        <h5 class="card-title">${Formatter.truncateText(title, 60)}</h5>
                        <p class="card-text text-muted">
                            ${Formatter.truncateText(summary, 120)}
                        </p>
                    </div>
                    <div class="card-footer bg-transparent d-flex justify-content-between align-items-center">
                        <div class="article-meta">
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>${readTime} 
                                | <i class="fas fa-calendar me-1"></i>${Formatter.formatDate(date)}
                            </small>
                        </div>
                        <a 
                            href="${CONFIG.ARTICLE_BASE_URL}?id=${id}" 
                            class="btn btn-sm btn-outline-primary"
                            data-article-id="${id}"
                        >
                            Lesen <i class="fas fa-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Hauptfunktion zum Laden der Artikel
    async function loadArticlePreviews() {
        try {
            Logger.log('Lade Artikel-Metadaten...');

            const response = await fetch(CONFIG.METADATA_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP-Fehler: ${response.status}`);
            }

            const data = await response.json();
            
            // Nach Datum sortieren und begrenzen
            const sortedArticles = data.articles
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, CONFIG.MAX_PREVIEW_ARTICLES);

            Logger.log(`${sortedArticles.length} Artikel geladen`);

            // Ladeindikator entfernen
            loadingIndicator.style.display = 'none';

            // Artikel rendern
            const articlesHTML = sortedArticles.map(createArticlePreview).join('');
            blogContainer.innerHTML = articlesHTML;

        } catch (error) {
            Logger.error(`Artikelvorschau-Fehler: ${error.message}`);
            displayError('Die Artikel konnten nicht geladen werden. Bitte versuchen Sie es später noch einmal.');
        }
    }

    // Initiierung
    loadArticlePreviews();
});