document.addEventListener('DOMContentLoaded', async () => {
    const searchBox = document.getElementById('search-box');
    const searchResults = document.getElementById('search-results');
    const navTree = document.getElementById('nav-tree');

    let searchIndex = [];
    let fuse = null;

    try {
        const response = await fetch('search-index.json');
        searchIndex = await response.json();

        fuse = new Fuse(searchIndex, {
            keys: ['title', 'japanese', 'id'],
            threshold: 0.3,
            ignoreLocation: true
        });
    } catch (e) {
        console.error('Failed to load search index', e);
    }

    searchBox.addEventListener('input', (e) => {
        const term = e.target.value.trim();

        if (term.length < 2) {
            searchResults.innerHTML = '';
            searchResults.classList.add('hidden');
            navTree.classList.remove('hidden');
            return;
        }

        const results = fuse.search(term);

        if (results.length > 0) {
            navTree.classList.add('hidden');
            searchResults.classList.remove('hidden');

            searchResults.innerHTML = results.slice(0, 10).map(result => {
                const item = result.item;
                return `
                    <a href="${item.url}" class="search-result-item nav-link">
                        <div class="result-title">${item.title}</div>
                        <div class="result-meta">
                            ${item.japanese ? `<span class="result-sub">${item.japanese}</span>` : ''}
                            <span class="tag small">${item.type}</span>
                        </div>
                    </a>
                `;
            }).join('');
        } else {
            searchResults.innerHTML = '<div class="no-results">Ingen treff...</div>';
            searchResults.classList.remove('hidden');
            navTree.classList.add('hidden');
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target) && !searchResults.contains(e.target)) {
            // Optional: clear search on blur if desired
        }
    });
});
