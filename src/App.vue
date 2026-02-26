<template>
    <div :class="['app-wrapper', { 'is-landing': isLanding }]">
        <!-- Shared Hero Background -->
        <div class="hero-bg" :style="{ backgroundImage: `url(${heroImage})` }"></div>
        <div class="landing-overlay"></div>

        <header id="top-bar" v-if="!isLanding">
            <div class="top-bar-inner">
                <router-link to="/" class="top-logo">AAJJ <span>PENSUM</span></router-link>
                <div class="top-search-wrap">
                    <GlobalSearch type="header" />
                </div>
            </div>
        </header>

        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <component :is="Component" />
            </transition>
        </router-view>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import GlobalSearch from './components/GlobalSearch.vue';
import heroImage from './assets/images/jj_bg_2.jpg';

const route = useRoute();
const isLanding = computed(() => route.name === 'landing');
</script>

<style scoped>
.app-wrapper {
    min-height: 100vh;
}

.hero-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-size: cover;
    background-position: center;
    filter: brightness(0.3) saturate(1.1);
    z-index: -2;
    transition: filter 1s ease;
}

.is-landing .hero-bg {
    filter: brightness(0.4) saturate(1.2);
}

.landing-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: radial-gradient(circle at center, transparent 0%, #0a0a0c 90%);
    z-index: -1;
}

#top-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 70px;
    background: rgba(10, 10, 12, 0.8);
    backdrop-filter: blur(var(--glass-blur));
    border-bottom: 1px solid var(--glass-border);
    z-index: 100;
    display: flex;
    align-items: center;
}

.top-bar-inner {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.top-logo {
    font-family: 'Outfit', sans-serif;
    font-size: 1.5rem;
    letter-spacing: 0.1em;
    font-weight: 300;
    color: #fff;
}

.top-logo span {
    font-weight: 700;
    color: var(--accent);
}

.top-search-wrap {
    position: relative;
    width: 100%;
    max-width: 500px;
}
</style>
