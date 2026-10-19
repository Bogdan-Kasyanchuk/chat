import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [ react() ],
    server: {
        // Слухати й локальну мережу, щоб відкривати dev з інших пристроїв
        host: true
    },
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, 'src'),
            '@convex': path.resolve(import.meta.dirname, 'convex')
        }
    }
});
