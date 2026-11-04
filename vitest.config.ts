import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            projects: [
                {
                    extends: true,
                    test: {
                        name: 'convex',
                        include: [ 'convex/**/*.test.ts' ],
                        environment: 'edge-runtime'
                    }
                },
                {
                    extends: true,
                    test: {
                        name: 'frontend',
                        include: [ 'src/**/*.test.{ts,tsx}' ],
                        environment: 'jsdom',
                        setupFiles: [ './src/test/setup.ts' ]
                    }
                }
            ]
        }
    })
);
