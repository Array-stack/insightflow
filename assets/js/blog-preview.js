class BlogPreviewManager {
    constructor() {
        this.previewList = document.getElementById('blog-preview-list');
    }

    async loadBlogPreview() {
        try {
            const response = await fetch('/blog/articles/article-metadata.json');
            const data = await response.json();
            
            // Nur die ersten 3 Artikel anzeigen
            const previewArticles = data.articles.slice(0, 3);
            
            this.renderPreviews(previewArticles);
        } catch (error) {
            console.error('Blog-Vorschau konnte nicht geladen werden', error);
            this.previewList.innerHTML = `
                <div class="col-12 text-center">
                    <p>Artikel können momentan nicht geladen werden.</p>
                </div>
            `;
        }
    }

    renderPreviews(articles) {
        this.previewList.innerHTML = articles.map(article => `
            <div class="col-md-4">
                <div class="blog-preview-card h-100 shadow-sm">
                    <img src="${article.imageUrl}" alt="${article.title}" class="img-fluid rounded-top">
                    <div class="p-3">
                        <h3 class="h5 mb-2">${article.title}</h3>
                        <p class="text-muted mb-3">${article.summary}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">${article.date}</span>
                            <a href="/blog/articles/${article.id}.html" class="btn btn-sm btn-outline-primary">Weiterlesen</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const blogPreviewManager = new BlogPreviewManager();
    blogPreviewManager.loadBlogPreview();
});
