/// <reference types="node" />
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { COLOR_SCHEME_KEY, THEME_COLOR, TOKENS } from '@/theme';

import indexHtml from '../index.html?raw';
import manifestText from '../public/site.webmanifest?raw';

// Шляхи від цього файла, а не від теки, з якої запущено Vitest
const SRC = import.meta.dirname;
const PUBLIC = join(import.meta.dirname, '../public');

// Global Constraints: кольори в CSS modules — лише токени; сірі, білі й темні Mantine переносяться на --chat-*
test('CSS takes no white, black, gray or dark colours from Mantine', () => {
    // Vitest віддає імпорт CSS порожнім, тож файли читаються з диска
    const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
        .filter(path => path.endsWith('.css'))
        .map(path => [ path, readFileSync(join(SRC, path), 'utf8') ] as const);
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
        expect(TOKENS.light[ '--chat-sidebar-bg' ]).toBe('#FFFFFF');
        expect(TOKENS.dark[ '--chat-sidebar-bg' ]).toBe('#151C1D');
        expect(THEME_COLOR).toEqual({ light: '#FFFFFF', dark: '#151C1D' });
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
        const inline = head.querySelector('script:not([src])');
        const script = inline?.textContent ?? '';

        // Скрипт виконується під час розбору head: мети, які він фарбує, мусять стояти вище
        test('comes after the theme-color metas', () => {
            const metasInHead = [ ...head.querySelectorAll('meta[name="theme-color"]') ];

            expect(metasInHead).toHaveLength(2);

            for (const meta of metasInHead) {
                expect(meta.compareDocumentPosition(inline!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
            }
        });

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
            vi.restoreAllMocks();
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

        // Дані сайту заблоковано (Chrome кидає SecurityError на localStorage): тема все одно за системою
        test('follows the system when storage throws', () => {
            run(null, true);
            document.documentElement.removeAttribute('data-mantine-color-scheme');
            vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
                throw new DOMException('Access is denied', 'SecurityError');
            });
            new Function(script)();

            expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark');
            expect(metas().map(meta => meta.content)).toEqual([ THEME_COLOR.dark, THEME_COLOR.dark ]);
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

    // Іконки — знак Logo; SVG для сучасних браузерів, PNG 192 і 512 для встановлення на телефон
    test('index.html links the SVG favicon and the manifest has 192 and 512 icons', () => {
        const svg = head.querySelector('link[rel="icon"][type="image/svg+xml"]');
        const { icons } = JSON.parse(manifestText) as { icons: Array<{ src: string, sizes: string }> };

        expect(svg?.getAttribute('href')).toBe('/favicon.svg');
        expect(icons.map(icon => icon.sizes)).toEqual([ '192x192', '512x512' ]);

        for (const href of [ '/favicon.svg', ...icons.map(icon => icon.src) ]) {
            expect(existsSync(join(PUBLIC, href)), href).toBe(true);
        }
    });

    test('the web manifest uses the light sidebar background', () => {
        const manifest = JSON.parse(manifestText) as { theme_color: string, background_color: string };

        expect(manifest.theme_color).toBe(THEME_COLOR.light);
        expect(manifest.background_color).toBe(THEME_COLOR.light);
    });
});
