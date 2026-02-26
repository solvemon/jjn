const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const md = require('markdown-it')({ html: true });

const CONTENT_DIR = path.join(__dirname, '../content');
const OUTPUT_FILE = path.join(__dirname, '../src/data/curriculum.json');

const TYPE_MAP = {
    'techniques': 'Teknikk',
    'attacks': 'Angrep',
    'defenses': 'Forsvar',
    'levels': 'Gradering',
    'drills': 'Drill',
    'combinations': 'Kombinasjon',
    'positions': 'Posisjon'
};

const DOMAIN_MAP = {
    'standing': 'Stående',
    'ground': 'Bakke'
};

async function generate() {
    console.log('Generating curriculum database...');

    const allNodes = {};
    const folders = await fs.readdir(CONTENT_DIR);

    // Pass 1: Load and parse all nodes
    for (const folder of folders) {
        const folderPath = path.join(CONTENT_DIR, folder);
        if (!(await fs.stat(folderPath)).isDirectory()) continue;

        const files = await fs.readdir(folderPath);
        for (const file of files) {
            if (!file.endsWith('.md')) continue;
            const { data, content } = matter(await fs.readFile(path.join(folderPath, file), 'utf-8'));

            const typeLabel = TYPE_MAP[folder] || folder;
            allNodes[data.id] = {
                ...data,
                html: md.render(content),
                type: folder,
                typeLabel,
                domainLabel: DOMAIN_MAP[data.domain] || data.domain,
                related: [] // Will be populated in pass 2
            };
        }
    }

    // Pass 2: Build bi-directional graph
    for (const id in allNodes) {
        const node = allNodes[id];

        // Bi-directional linking logic
        if (Array.isArray(node.introduced_at)) {
            node.introduced_at.forEach(lvlId => {
                if (allNodes[lvlId]) {
                    allNodes[lvlId].related.push({ id, title: node.name, relation: 'Inneholder teknikk' });
                    node.related.push({ id: lvlId, title: allNodes[lvlId].name, relation: 'Introduseres ved' });
                }
            });
        }

        if (Array.isArray(node.part_of_group)) {
            node.part_of_group.forEach(groupId => {
                if (allNodes[groupId]) {
                    allNodes[groupId].related.push({ id, title: node.name, relation: 'Medlem av gruppe' });
                    node.related.push({ id: groupId, title: allNodes[groupId].name, relation: 'Del av gruppe' });
                }
            });
        }

        if (Array.isArray(node.against)) {
            node.against.forEach(atkId => {
                if (allNodes[atkId]) {
                    allNodes[atkId].related.push({ id, title: node.name, relation: 'Forsvar mot dette angrepet' });
                    node.related.push({ id: atkId, title: allNodes[atkId].name, relation: 'Forsvar mot' });
                }
            });
        }
    }

    // Pass 3: Sanitize and deduplicate related links
    for (const id in allNodes) {
        const node = allNodes[id];
        const seen = new Set();
        node.related = node.related.filter(r => {
            const key = `${r.id}-${r.relation}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    // Build Navigation Structure
    const nav = buildNav(allNodes);

    await fs.ensureDir(path.dirname(OUTPUT_FILE));
    await fs.writeJson(OUTPUT_FILE, { nodes: allNodes, nav }, { spaces: 2 });
    console.log('Database generated successfully!');
}

function buildNav(nodes) {
    const groups = {
        'Senior Graderinger': [],
        'Junior Graderinger': [],
        'Basisteknikker': [],
        'Angrep & Forsvar': []
    };

    for (const id in nodes) {
        const node = nodes[id];
        if (id.includes('-test')) continue;

        const item = { id: node.id, text: node.name };

        if (node.track === 'senior' && (id.includes('kyu') || id.includes('dan'))) {
            groups['Senior Graderinger'].push(item);
        } else if (node.track === 'junior') {
            groups['Junior Graderinger'].push(item);
        } else if (['ukemi', 'tsuki', 'keri', 'nage', 'osae', 'gatame'].includes(node.category)) {
            groups['Basisteknikker'].push(item);
        } else {
            groups['Angrep & Forsvar'].push(item);
        }
    }

    return Object.keys(groups).map(k => ({
        title: k,
        links: groups[k].sort((a, b) => a.text.localeCompare(b.text))
    }));
}

generate().catch(console.error);
