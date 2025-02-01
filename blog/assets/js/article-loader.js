document.addEventListener('DOMContentLoaded', function() {
    // Umfangreiches Logging und Debugging
    console.group('Artikel-Loader Diagnostics');
    console.log('Aktuelle URL:', window.location.href);
    console.log('Aktueller Pfad:', window.location.pathname);

    // Relative Pfadangabe für Metadaten
    const METADATA_PATH = 'articles/article-metadata.json';

    // Artikel-ID aus der URL extrahieren
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    console.log('Extrahierte Artikel-ID:', articleId);

    if (!articleId) {
        console.error('Keine Artikel-ID in der URL gefunden');
        displayErrorMessage('Kein Artikel ausgewählt', 'Bitte wählen Sie einen gültigen Artikel.');
        console.groupEnd();
        return;
    }

    // Verbesserte Fehlerbehandlung beim Metadaten-Laden
    fetch(METADATA_PATH)
        .then(response => {
            console.log('Fetch-Antwort-Status:', response.status);
            console.log('Fetch-URL:', response.url);
            
            if (!response.ok) {
                throw new Error(`HTTP-Fehler: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Detaillierte Artikel-Debugging-Informationen
            console.log('Verfügbare Artikel-IDs:', data.articles.map(a => a.id));
            
            const article = data.articles.find(a => a.id === articleId);
            
            if (!article) {
                console.error(`Kein Artikel gefunden für ID: ${articleId}`);
                displayErrorMessage(
                    'Artikel nicht gefunden', 
                    `Der Artikel mit der ID "${articleId}" existiert nicht.`
                );
                console.groupEnd();
                return;
            }

            console.log('Gefundener Artikel:', article.title);
            renderArticle(article);
            console.groupEnd();
        })
        .catch(error => {
            console.error('Fehler beim Laden der Artikel-Metadaten:', error);
            displayErrorMessage(
                'Laden fehlgeschlagen', 
                `Fehler beim Laden der Artikel: ${error.message}. Bitte überprüfen Sie Ihre Internetverbindung.`
            );
            console.groupEnd();
        });

    function renderArticle(article) {
        const articleContent = document.getElementById('article-content');
        const articleLoading = document.getElementById('article-loading');
        const errorContainer = document.getElementById('error-container');

        // Verstecke Ladeindikator
        articleLoading.classList.add('d-none');
        
        // Zeige Artikel-Inhalt
        articleContent.classList.remove('d-none');
        articleContent.innerHTML = `
            <article class="blog-article">
                <header class="article-header mb-4">
                    <h1 class="display-4">${escapeHTML(article.title)}</h1>
                    <div class="article-meta text-muted">
                        <span class="author">Von ${escapeHTML(article.author)}</span>
                        <span class="date">am ${formatDate(article.date)}</span>
                        <span class="read-time">Lesezeit: ${escapeHTML(article.readTime)}</span>
                    </div>
                    ${article.imageUrl ? `
                        <img src="${escapeHTML(article.imageUrl)}" 
                             alt="${escapeHTML(article.title)}" 
                             class="img-fluid rounded mt-3">
                    ` : ''}
                </header>

                <div class="article-body">
                    ${article.content.map(section => {
                        switch(section.type) {
                            case 'subtitle':
                                return `<h2 class="mt-4 mb-3">${escapeHTML(section.text)}</h2>`;
                            case 'paragraph':
                                return `<p>${section.text}</p>`;
                            case 'list':
                                return `
                                    <div class="article-list mb-3">
                                        ${section.title ? `<h3>${escapeHTML(section.title)}</h3>` : ''}
                                        <ul>
                                            ${section.items.map(item => `<li>${item}</li>`).join('')}
                                        </ul>
                                    </div>
                                `;
                            case 'conclusion':
                                return `<div class="article-conclusion alert alert-info mt-4">${escapeHTML(section.text)}</div>`;
                            default:
                                return '';
                        }
                    }).join('')}
                </div>
            </article>
        `;
    }

    // Sicherheitsfunktion zur HTML-Escaping
    function escapeHTML(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('de-DE', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        } catch (dateError) {
            console.error('Fehler beim Formatieren des Datums:', dateError);
            return dateString;
        }
    }

    function displayErrorMessage(title, message) {
        const articleContentEl = document.getElementById('article-content');
        if (articleContentEl) {
            articleContentEl.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4>${escapeHTML(title)}</h4>
                    <p>${escapeHTML(message)}</p>
                    <a href="/blog" class="btn btn-primary">Zurück zur Artikelübersicht</a>
                </div>
            `;
        } else {
            console.error('Fehler-Container nicht gefunden');
        }
    }
});