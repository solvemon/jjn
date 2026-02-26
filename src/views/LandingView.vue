<template>
    <main class="landing-container">
        <section class="landing-search">
            <GlobalSearch type="hero" />
        </section>

    </main>
</template>

<script setup>
import GlobalSearch from '../components/GlobalSearch.vue';
</script>

<style scoped>
.landing-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 2rem;
    text-align: center;
}

.logo-text {
    font-size: clamp(3rem, 10vw, 4.5rem);
    letter-spacing: 0.1em;
    font-weight: 300;
    margin-bottom: 2rem;
}

.logo-text span {
    font-weight: 700;
    color: var(--accent);
}

.landing-search {
    width: 100%;
    max-width: 650px;
    margin-bottom: 3rem;
}

.landing-quick-nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2.5rem;
}

.quick-link {
    color: var(--text-muted);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    font-size: 1.1rem;
    opacity: 0.8;
}

.quick-link:hover {
    color: var(--accent);
    opacity: 1;
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .logo-text {
        font-size: 2.8rem;
        margin-bottom: 1.5rem;
    }

    .landing-container {
        padding: 1.5rem;
    }

    .landing-search {
        max-width: 100%;
    }
}
</style>
