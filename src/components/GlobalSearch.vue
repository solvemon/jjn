<template>
    <div :class="['search-container', type]">
        <div class="search-input-wrap">
            <input type="text" v-model="query" :placeholder="placeholder" @input="handleInput" @focus="isFocused = true"
                ref="inputRef">

            <!-- Results Dropdown -->
            <transition name="fade">
                <div v-if="results.length > 0 && isFocused" class="results-dropdown">
                    <router-link v-for="res in results.slice(0, 10)" :key="res.item.id" :to="`/c/${res.item.id}`"
                        class="result-item" @click="clearSearch">
                        <div class="result-title">{{ res.item.name }}</div>
                        <div class="result-meta">
                            <span v-if="res.item.japanese" class="result-sub">{{ res.item.japanese }}</span>
                            <span class="tag small">{{ res.item.typeLabel }}</span>
                        </div>
                    </router-link>
                </div>
                <div v-else-if="query.length > 1 && results.length === 0 && isFocused"
                    class="results-dropdown no-results">
                    Ingen treff for "{{ query }}"
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Fuse from 'fuse.js';
import curriculumData from '../data/curriculum.json';

const props = defineProps({
    type: { type: String, default: 'hero' } // 'hero' or 'header'
});

const query = ref('');
const results = ref([]);
const isFocused = ref(false);
const inputRef = ref(null);
const placeholder = props.type === 'hero' ? 'Hva vil du trene på i dag?' : 'Søk i pensum...';

let fuse = null;

onMounted(() => {
    const nodes = Object.values(curriculumData.nodes);
    fuse = new Fuse(nodes, {
        keys: ['name', 'japanese', 'id', 'typeLabel', 'domainLabel'],
        threshold: 0.3,
        ignoreLocation: true
    });

    window.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
    window.removeEventListener('click', handleOutsideClick);
});

const handleInput = () => {
    if (query.value.length < 2) {
        results.value = [];
        return;
    }
    results.value = fuse.search(query.value);
};

const clearSearch = () => {
    query.value = '';
    results.value = [];
    isFocused.value = false;
};

const handleOutsideClick = (e) => {
    if (inputRef.value && !inputRef.value.contains(e.target)) {
        isFocused.value = false;
    }
};
</script>

<style scoped>
.search-container {
    width: 100%;
}

.search-input-wrap {
    position: relative;
    width: 100%;
}

input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    color: white;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

input:focus {
    outline: none;
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 20px var(--accent-glow);
}

/* Hero Variant */
.hero input {
    padding: 1.5rem 2rem;
    font-size: 1.2rem;
    border-radius: 4rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

/* Header Variant */
.header input {
    padding: 0.6rem 1.2rem;
    font-size: 0.95rem;
    border-radius: 0.5rem;
}

.results-dropdown {
    position: absolute;
    top: 110%;
    left: 0;
    width: 100%;
    background: #0f0f14;
    backdrop-filter: blur(25px);
    border: 1px solid var(--glass-border);
    border-radius: 1rem;
    padding: 0.5rem;
    z-index: 2000;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
    max-height: 450px;
    overflow-y: auto;
}

.result-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem 1.2rem;
    border-radius: 0.8rem;
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 4px;
    background: rgba(255, 255, 255, 0.02);
    gap: 1.5rem;
}

.result-item:hover {
    background: rgba(56, 189, 248, 0.12);
    transform: translateX(6px);
}

.result-title {
    color: #ffffff;
    font-weight: 500;
    font-size: 0.95rem;
    letter-spacing: 0.01em;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.result-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
}

.result-sub {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 300;
    letter-spacing: 0.02em;
    white-space: nowrap;
}

.tag.small {
    font-size: 0.6rem;
    background: transparent;
    border: 1px solid rgba(56, 189, 248, 0.6);
    color: var(--accent);
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
}

.no-results {
    padding: 2rem;
    text-align: center;
    color: var(--text-muted);
}

@media (max-width: 768px) {
    .results-dropdown {
        position: fixed;
        top: 70px;
        left: 0;
        width: 100vw;
        height: auto;
        max-height: calc(100vh - 70px);
        border-radius: 0;
        border: none;
        border-bottom: 1px solid var(--glass-border);
    }

    .result-item {
        gap: 0.8rem;
        padding: 1.2rem;
    }

    .hero .results-dropdown {
        top: unset;
        bottom: 0;
        height: 60vh;
        border-top: 1px solid var(--glass-border);
        border-top-left-radius: 1.5rem;
        border-top-right-radius: 1.5rem;
    }

    .result-title {
        font-size: 1rem;
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .result-sub {
        display: none;
    }
}
</style>
