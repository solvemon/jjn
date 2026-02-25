document.addEventListener('DOMContentLoaded', async () => {
    const searchBox = document.getElementById('search-box');
    const navLinks = document.querySelectorAll('.nav-link');

    let searchIndex = [];
    try {
        const response = await fetch('search-index.json');
        searchIndex = await response.json();
    } catch (e) {
        console.error('Failed to load search index', e);
    }

    searchBox.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();

        document.querySelectorAll('.nav-link').forEach(link => {
            const text = link.textContent.toLowerCase();
            if (text.includes(term)) {
                link.style.display = 'block';
            } else {
                link.style.display = 'none';
            }
        });

        document.querySelectorAll('.nav-group').forEach(group => {
            const visibleLinks = group.querySelectorAll('.nav-link[style="display: block;"]');
            if (visibleLinks.length === 0 && term !== "") {
                group.style.display = 'none';
            } else {
                group.style.display = 'block';
            }
        });
    });
});
