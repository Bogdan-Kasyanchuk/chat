import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

// Тести незалежні (кожен реєструє власних користувачів), тож ідуть паралельно. Воркерів два: на чотирьох
// локальний бекенд Convex під час одночасних реєстрацій часом перевищує ліміт мутації в 1 с.
// Бекенд має бути вже запущений (`npx convex dev`): webServer піднімає лише Vite
export default defineConfig({
    testDir: 'e2e',
    fullyParallel: true,
    workers: 2,
    use: {
        baseURL,
        trace: 'retain-on-failure'
    },
    projects: [
        {
            name: 'desktop',
            use: { ...devices[ 'Desktop Chrome' ], viewport: { width: 1280, height: 860 } }
        },
        {
            name: 'phone',
            use: { ...devices[ 'Pixel 7' ], viewport: { width: 390, height: 844 } }
        }
    ],
    webServer: process.env.E2E_BASE_URL
        ? undefined
        : { command: 'npm run dev', url: baseURL, reuseExistingServer: true },
    globalTeardown: './e2e/teardown.ts'
});
