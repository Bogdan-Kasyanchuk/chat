/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { COLOR_SCHEME_KEY, THEME_COLOR, TOKENS } from '@/theme';

import indexHtml from '../index.html?raw';
import manifestText from '../public/site.webmanifest?raw';

// Global Constraints: кольори в CSS modules — лише токени; сірі, білі й темні Mantine переносяться на --chat-*
test('CSS takes no white, black, gray or dark colours from Mantine', () => {
    // Vitest віддає імпорт CSS порожнім, тож файли читаються з диска
    const files = readdirSync('src', { recursive: true, encoding: 'utf8' })
        .filter(path => path.endsWith('.css'))
        .map(path => [ path, readFileSync(join('src', path), 'utf8') ] as const);
    const offenders = files.flatMap(([ path, css ]) => css
        .split('\n')
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => /color-(white|black|gray|dark)-?/.test(line))
        .map(({ line, index }) => `${ path }:${ index + 1 } ${ line.trim() }`));

    expect(files.length).toBeGreaterThan(10);
    expect(offenders).toEqual([]);
});

describe('browser colours', () => {
    const head = new DOMParser().parseFromString(indexHtml, 'text/html').head;
    const metas = () => [ ...document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]') ];

    // Смуга браузера — колір шапок (тло бічної панелі) у схемі, яку бачить людина
    test('the theme colour is the sidebar background of each scheme', () => {
        expect(THEME_COLOR).toEqual({ light: TOKENS.light[ '--chat-sidebar-bg' ], dark: TOKENS.dark[ '--chat-sidebar-bg' ] });
    });

    // Без JavaScript браузер бере колір за темою системи
    test('index.html has a theme colour for each system scheme', () => {
        const byMedia = Object.fromEntries([ ...head.querySelectorAll('meta[name="theme-color"]') ]
            .map(meta => [ meta.getAttribute('media'), meta.getAttribute('content') ]));

        expect(byMedia).toEqual({
            '(prefers-color-scheme: light)': THEME_COLOR.light,
            '(prefers-color-scheme: dark)': THEME_COLOR.dark
        });
    });

    describe('the anti-flicker script', () => {
        const script = head.querySelector('script:not([src])')?.textContent ?? '';

        const run = (stored: string | null, osDark: boolean) => {
            document.head.innerHTML = head.innerHTML;
            window.localStorage.clear();

            if (stored !== null) {
                window.localStorage.setItem(COLOR_SCHEME_KEY, stored);
            }

            window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: query.includes('dark') && osDark, media: query }));
            new Function(script)();
        };

        afterEach(() => {
            document.head.innerHTML = '';
            document.documentElement.removeAttribute('data-mantine-color-scheme');
            window.localStorage.clear();
        });

        // Ключ повторено літералом: index.html не імпортує src/theme.ts (Minor етапу 1)
        test('reads the choice under COLOR_SCHEME_KEY', () => {
            run('dark', false);

            expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark');
        });

        test('follows the system when nothing is chosen', () => {
            run(null, true);

            expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark');
        });

        // Ручний вибір перебиває тему системи й у смузі браузера, ще до React
        test.each([
            [ 'light', true, THEME_COLOR.light ],
            [ 'dark', false, THEME_COLOR.dark ],
            [ 'auto', true, THEME_COLOR.dark ]
        ])('a stored %s with a dark OS = %s colours the browser bar %s', (stored, osDark, color) => {
            run(stored, osDark);

            expect(metas().map(meta => meta.content)).toEqual([ color, color ]);
        });
    });

    test('the web manifest uses the light sidebar background', () => {
        const manifest = JSON.parse(manifestText) as { theme_color: string, background_color: string };

        expect(manifest.theme_color).toBe(THEME_COLOR.light);
        expect(manifest.background_color).toBe(THEME_COLOR.light);
    });
});
