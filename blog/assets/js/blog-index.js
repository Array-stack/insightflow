(function() {
    // Debug-Hilfsfunktion
    const DEBUG = {
        enabled: true,
        log(message, data = null) {
            if (this.enabled) {
                console.group('%cRelated Articles Debug', 'color: blue; font-weight: bold');
                console.log(message);
                if (data) console.log(data);
                console.groupEnd();
            }
        }
    };

    // Robuste Container-Suche
    function findContainer() {
        const selectors = [
            '#related-articles-preview', 
            '.related-articles .row', 
            '#blog-preview-list',
            '.blog-preview-container'
        ];

        for (let selector of selectors) {
            const container = document.querySelector(selector);
            if (container) {
                DEBUG.log(`Container gefunden: ${selector}`);
                return container;
            }
        }

        DEBUG.log('KRITISCHER FEHLER: Kein Container gefunden');
        return null;
    }

    // Bildpfad-Korrektur
    function resolveImagePath(imageUrl) {
        const knownImages = [
            'prozess-optimierung.webp',
            'blogassetsimagesworkflow-auto.webp',
            'Künstliche Intelligenz (KI).webp',
            'WhatsApp Agent Assistants.webp',
            'ChatbotAssistants.webp',
            'ethische-ki-verantwortung.webp'
        ];

        const corrections = [
            url => url.replace(/^\/?(blog\/)?assets\/images\//, ''),
            url => url.split('/').pop()
        ];

        for (let correction of corrections) {
            const correctedName = correction(imageUrl);
            const matchedImage = knownImages.find(img => 
                img.toLowerCase() === correctedName.toLowerCase()
            );

            if (matchedImage) {
                return `assets/images/${matchedImage}`;
            }
        }

        return 'assets/images/default-article-image.jpg';
    }

    // Artikel rendern
    function renderRelatedArticles(articles) {
        DEBUG.log('Rendering Related Articles', articles);
    
        const container = findContainer();
        const loadingIndicator = document.getElementById('blog-loading');
    
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    
        if (!container) {
            DEBUG.log('KRITISCHER FEHLER: Kein Rendering-Container');
            return;
        }
    
        // Kompakter Container
        container.classList.add('related-articles-compact');
    
        const articlesHTML = articles.length > 0 
            ? articles.map(article => {
                const imageUrl = resolveImagePath(article.imageUrl);
                const truncatedTitle = article.title.length > 30 
                    ? article.title.substring(0, 30) + '...' 
                    : article.title;
                const truncatedSummary = article.summary.length > 50
                    ? article.summary.substring(0, 50) + '...'
                    : article.summary;
    
                return `
                <div class="col-md-4 mb-3">
                    <div class="card h-100 shadow-sm">
                        <img 
                            src="${imageUrl}" 
                            class="card-img-top" 
                            alt="${article.title}"
                            onerror="this.src='assets/images/default-article-image.jpg'"
                        >
                        <div class="card-body p-2">
                            <h6 class="card-title">${truncatedTitle}</h6>
                            <p class="card-text text-muted">${truncatedSummary}</p>
                            <a href="article.html?id=${article.id}" 
                               class="btn btn-sm btn-outline-primary">Lesen</a>
                        </div>
                    </div>
                </div>
            `}).join('')
            : `
                <div class="col-12 text-center">
                    <div class="alert alert-info">
                        Keine verwandten Artikel gefunden
                    </div>
                </div>
            `;
    
        container.innerHTML = articlesHTML;
        DEBUG.log('Artikel HTML gesetzt', articlesHTML);
    }

    // Fehler-Handler
    function handleLoadingError(error) {
        DEBUG.log('Fehler beim Laden', error);
        const container = findContainer();
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        <h4>Fehler beim Laden</h4>
                        <p>Verwandte Artikel konnten nicht geladen werden.</p>
                        <details>
                            <summary>Technische Details</summary>
                            <pre>${error.message}</pre>
                        </details>
                        <button onclick="window.location.reload()" class="btn btn-primary mt-3">Neu laden</button>
                    </div>
                </div>
            `;
        }
    }

    // Hauptfunktion zum Laden verwandter Artikel
    async function loadRelatedArticles() {
        try {
            DEBUG.log('Starte Laden verwandter Artikel');

            const possiblePaths = [
                'articles/article-metadata.json',
                '/blog/articles/article-metadata.json',
                '../articles/article-metadata.json',
                './articles/article-metadata.json'
            ];

            let response;
            for (let path of possiblePaths) {
                try {
                    response = await fetch(path, { 
                        method: 'GET',
                        cache: 'no-cache',
                        headers: { 'Accept': 'application/json' }
                    });
                    
                    if (response.ok) break;
                } catch (err) {
                    DEBUG.log(`Pfad nicht gefunden: ${path}`, err);
                }
            }

            if (!response || !response.ok) {
                throw new Error('Keine gültige Metadaten-Datei gefunden');
            }

            const data = await response.json();
            DEBUG.log('Artikel geladen', data.articles);

            const currentArticleId = new URLSearchParams(window.location.search).get('id');
            DEBUG.log(`Aktuelle Artikel-ID: ${currentArticleId}`);

            const relatedArticles = data.articles
                .filter(article => article.id !== currentArticleId)
                .slice(0, 3);

            DEBUG.log('Gefilterte Artikel', relatedArticles);
            renderRelatedArticles(relatedArticles);
        } catch (error) {
            console.error('Fehler beim Laden verwandter Artikel:', error);
            handleLoadingError(error);
        }
    }

    // Initialisierung
    function initRelatedArticles() {
        if (window.location.pathname.includes('article.html')) {
            loadRelatedArticles();
        }
    }

    // Event-Listener
    document.addEventListener('DOMContentLoaded', initRelatedArticles);
})();