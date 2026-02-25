const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true
});

const CONTENT_DIR = path.join(__dirname, 'content');
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'base.html');
const PUBLIC_DIR = path.join(__dirname, 'public');

async function build() {
    console.log('Building enhanced curriculum site...');

    await fs.ensureDir(DIST_DIR);
    await fs.copy(PUBLIC_DIR, DIST_DIR);
    await fs.ensureDir(path.join(DIST_DIR, 'js'));

    const template = await fs.readFile(TEMPLATE_PATH, 'utf-8');
    const allNodes = {};
    const searchIndex = [];

    // 1. Load all nodes
    const folders = await fs.readdir(CONTENT_DIR);
    for (const folder of folders) {
        const folderPath = path.join(CONTENT_DIR, folder);
        if (!(await fs.stat(folderPath)).isDirectory()) continue;

        const files = await fs.readdir(folderPath);
        for (const file of files) {
            if (!file.endsWith('.md')) continue;
            const { data, content } = matter(await fs.readFile(path.join(folderPath, file), 'utf-8'));
            allNodes[data.id] = { ...data, body: content, url: `${data.id}.html`, type: folder };
            searchIndex.push({ id: data.id, title: data.name, type: folder, url: `${data.id}.html` });
        }
    }

    // 2. Initialize and Build bi-directional graph
    for (const id in allNodes) {
        allNodes[id].related = { derived: [], children: [], parents: [] };
    }

    for (const id in allNodes) {
        const node = allNodes[id];

        // Level -> Technique / Technique -> Level
        if (node.introduced_at) {
            node.introduced_at.forEach(levelId => {
                if (allNodes[levelId]) {
                    allNodes[levelId].related.children.push({ id: node.id, name: node.name, type: 'Technique' });
                    node.related.parents.push({ id: levelId, name: allNodes[levelId].name, type: 'Level' });
                }
            });
        }

        // Defense -> Attack / Attack -> Defense
        if (node.against && allNodes[node.against]) {
            allNodes[node.against].related.derived.push({ id: node.id, name: node.name, type: 'Defense' });
            node.related.parents.push({ id: node.against, name: allNodes[node.against].name, type: 'Attack' });
        }

        // Defense -> Technique / Technique -> Defense
        if (node.sequence) {
            node.sequence.forEach(techId => {
                if (allNodes[techId]) {
                    allNodes[techId].related.derived.push({ id: node.id, name: node.name, type: 'Defense' });
                    node.related.children.push({ id: techId, name: allNodes[techId].name, type: 'Technique' });
                }
            });
        }
    }

    const nav = buildNav(allNodes);

    // 3. Render
    for (const id in allNodes) {
        const node = allNodes[id];
        let bodyHtml = md.render(node.body);
        bodyHtml = bodyHtml.replace(/\[(.*?)\]\((.*?)\.md\)/g, '[$1]($2.html)');

        // Build metadata header
        let metaHtml = '<div class="metadata-header">';
        if (node.japanese) metaHtml += `<div class="tag">🇯🇵 ${node.japanese}</div>`;
        if (node.category) metaHtml += `<div class="tag">📁 ${node.category}</div>`;
        if (node.domain) metaHtml += `<div class="tag">🌐 ${node.domain}</div>`;
        metaHtml += '</div>';

        // Build related section
        let relatedHtml = '';
        const rels = [
            { label: 'Brukte teknikker', items: node.related.children.filter(i => i.type === 'Technique' && node.type === 'defenses') },
            { label: 'Inngår i forsvar', items: node.related.derived.filter(i => i.type === 'Defense') },
            { label: 'Teknikker introdusert her', items: node.related.children.filter(i => node.type === 'levels') },
            { label: 'Introdusert ved', items: node.related.parents.filter(i => i.type === 'Level') },
            { label: 'Svar mot dette angrepet', items: node.related.derived.filter(d => d.type === 'Defense' && node.type === 'attacks') },
            { label: 'Motangrep til', items: node.related.parents.filter(i => i.type === 'Attack') }
        ];

        rels.forEach(r => {
            if (r.items && r.items.length > 0) {
                // Unique names
                const unique = Array.from(new Set(r.items.map(i => i.id))).map(id => r.items.find(i => i.id === id));
                relatedHtml += `<h4>${r.label}</h4><ul>`;
                unique.forEach(i => {
                    relatedHtml += `<li><a href="${i.id}.html">${i.name}</a></li>`;
                });
                relatedHtml += '</ul>';
            }
        });

        let finalHtml = template
            .replace('{{title}}', node.name)
            .replace('{{{content}}}', metaHtml + bodyHtml)
            .replace(/{{#if related}}[\s\S]*?{{\/if}}/, relatedHtml ? `<div class="card related-section">${relatedHtml}</div>` : '')
            .replace('{{NAV_ITEMS}}', renderNav(nav));

        await fs.writeFile(path.join(DIST_DIR, node.url), finalHtml);
    }

    await fs.writeJson(path.join(DIST_DIR, 'search-index.json'), searchIndex);
    await fs.writeFile(path.join(DIST_DIR, 'index.html'), '<meta http-equiv="refresh" content="0; url=senior-5-kyu-yellow.html">');
    console.log('Build complete with enhanced links!');
}

function buildNav(nodes) {
    const groups = { 'Senior': [], 'Junior': [], 'Basisteknikker': [], 'Sone 1/2': [] };
    for (const id in nodes) {
        const node = nodes[id];
        if (id.includes('-test')) continue;
        if (node.track === 'senior') groups['Senior'].push({ text: node.name, url: node.url });
        else if (node.track === 'junior') groups['Junior'].push({ text: node.name, url: node.url });
        else if (node.category) groups['Basisteknikker'].push({ text: node.name, url: node.url });
        else groups['Sone 1/2'].push({ text: node.name, url: node.url });
    }
    return Object.keys(groups).map(k => ({ title: k, links: groups[k].sort((a, b) => a.text.localeCompare(b.text)) }));
}

function renderNav(nav) {
    return nav.map(g => `<div class="nav-group"><h3>${g.title}</h3>${g.links.map(l => `<a href="${l.url}" class="nav-link">${l.text}</a>`).join('')}</div>`).join('');
}

build().catch(console.error);
