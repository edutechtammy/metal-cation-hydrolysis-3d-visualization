import { defineConfig } from 'vite';

export default defineConfig({
    base: '/metal-cation-hydrolysis-3d-visualization/',
    root: '.',
    publicDir: 'public',
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
});
