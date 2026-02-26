<template>
    <div class="curriculum-layout" v-if="node">
        <aside id="sidebar" :class="{ 'mobile-show': sidebarOpen }">
            <div class="nav-tree">
                <div v-for="group in curriculumData.nav" :key="group.title" class="nav-group">
                    <h3>{{ group.title }}</h3>
                    <router-link v-for="link in group.links" :key="link.id" :to="`/c/${link.id}`"
                        :class="['nav-link', { active: link.id === id }]">
                        {{ link.text }}
                    </router-link>
                </div>
            </div>
        </aside>

        <main id="main-content">
            <div class="content-card">
                <header class="content-header">
                    <h1>{{ node.name }}</h1>
                    <div class="metadata-header">
                        <div v-if="node.japanese" class="tag">🇯🇵 {{ node.japanese }}</div>
                        <div class="tag">📁 {{ node.typeLabel }}</div>
                        <div v-if="node.domainLabel" class="tag">🌐 {{ node.domainLabel }}</div>
                    </div>
                </header>

                <article class="content-body prose" v-html="node.html"></article>

                <section v-if="node.related && node.related.length" class="related-section">
                    <h4>Relatert innhold</h4>
                    <div class="related-grid">
                        <router-link v-for="rel in node.related" :key="`${rel.id}-${rel.relation}`" :to="`/c/${rel.id}`"
                            class="related-card">
                            <div class="rel-label">{{ rel.relation }}</div>
                            <div class="rel-title">{{ rel.title }}</div>
                        </router-link>
                    </div>
                </section>
            </div>
        </main>
    </div>
    <div v-else class="loading">Søker etter teknikken...</div>
</template>

<script setup>
import { computed } from 'vue';
import curriculumData from '../data/curriculum.json';

const props = defineProps(['id', 'sidebarOpen']);

const node = computed(() => curriculumData.nodes[props.id]);
</script>

<style scoped>
.curriculum-layout {
    display: flex;
    padding-top: 70px;
}

#sidebar {
    width: 300px;
    height: calc(100vh - 70px);
    position: fixed;
    left: 0;
    background: rgba(15, 15, 20, 0.4);
    backdrop-filter: blur(10px);
    border-right: 1px solid var(--glass-border);
    padding: 2rem;
    overflow-y: auto;
    transition: transform 0.3s ease;
    z-index: 1000;
}

#sidebar.mobile-show {
    transform: translateX(0);
}

#main-content {
    margin-left: 300px;
    flex: 1;
    padding: 3rem;
    max-width: 1000px;
    transition: margin-left 0.3s ease;
}

.content-card {
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 1.5rem;
    padding: 3.5rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

@media (max-width: 1024px) {
    #main-content {
        padding: 2rem;
    }

    .content-card {
        padding: 2.5rem;
    }
}

@media (max-width: 768px) {
    #sidebar {
        transform: translateX(-100%);
        background: rgba(10, 10, 12, 0.95);
        height: 100vh;
        top: 0;
        padding-top: 80px;
    }

    #main-content {
        margin-left: 0;
        padding: 1rem;
        padding-top: 2rem;
    }

    .content-card {
        padding: 1.5rem;
        border-radius: 1rem;
    }

    .content-header h1 {
        font-size: 2rem;
    }
}

.content-header h1 {
    font-size: 2.8rem;
    margin-bottom: 1rem;
}

.metadata-header {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 3rem;
}

.tag {
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 0.35rem 1rem;
    border-radius: 2rem;
    font-size: 0.85rem;
    font-weight: 600;
}

.content-body {
    font-size: 1.1rem;
    line-height: 1.7;
}

.content-body :deep(h2) {
    font-size: 1.6rem;
    margin-top: 2.5rem;
    border-bottom: 2px solid var(--accent);
    padding-bottom: 0.5rem;
    display: inline-block;
}

.related-section {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--glass-border);
}

.related-section h4 {
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
}

.related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
}

.related-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--glass-border);
    padding: 1.2rem;
    border-radius: 1rem;
    transition: all 0.3s ease;
    text-decoration: none;
}

.related-card:hover {
    background: rgba(56, 189, 248, 0.1);
    border-color: var(--accent);
    transform: translateY(-3px);
}

.rel-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 4px;
}

.rel-title {
    font-weight: 700;
    color: #fff;
}

/* Nav Link Styles */
.nav-link {
    display: block;
    padding: 0.6rem 0.8rem;
    color: var(--text-muted);
    border-radius: 0.5rem;
    margin-bottom: 0.2rem;
    transition: all 0.2s;
    font-size: 0.95rem;
}

.nav-link:hover,
.nav-link.active {
    background: rgba(56, 189, 248, 0.1);
    color: var(--accent);
}

.nav-group h3 {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-top: 2rem;
    margin-bottom: 0.8rem;
    opacity: 0.6;
}
</style>
