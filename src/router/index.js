import { createRouter, createWebHashHistory } from 'vue-router';
import LandingView from '../views/LandingView.vue';
import CurriculumView from '../views/CurriculumView.vue';

const routes = [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/c/:id', name: 'curriculum', component: CurriculumView, props: true }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 };
    }
});

export default router;
