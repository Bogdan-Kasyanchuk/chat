import { MantineProvider } from '@mantine/core';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import useColorSchemeSetting from '@/hooks/useColorSchemeSetting';
import { THEME_COLOR, colorSchemeManager } from '@/theme';

import useThemeColorMeta from './useThemeColorMeta';

let osDark = false;
const listeners = new Set<(event: { matches: boolean, media: string }) => void>();

const setOsDark = (dark: boolean) => {
    osDark = dark;
    listeners.forEach(listener => {
        listener({ matches: dark, media: '(prefers-color-scheme: dark)' });
    });
};

beforeEach(() => {
    window.localStorage.clear();
    osDark = false;
    listeners.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        get matches() {
            return query.includes('prefers-color-scheme: dark') && osDark;
        },
        media: query,
        addEventListener: (_: string, listener: (event: { matches: boolean, media: string }) => void) => {
            listeners.add(listener);
        },
        removeEventListener: (_: string, listener: (event: { matches: boolean, media: string }) => void) => {
            listeners.delete(listener);
        },
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
    }));
    document.head.innerHTML = `
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="${ THEME_COLOR.light }">
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="${ THEME_COLOR.dark }">
    `;
});

afterEach(() => {
    document.head.innerHTML = '';
    document.documentElement.removeAttribute('data-mantine-color-scheme');
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <MantineProvider
        defaultColorScheme="auto"
        colorSchemeManager={ colorSchemeManager }
    >
        { children }
    </MantineProvider>
);

const barColors = () => [ ...document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]') ].map(meta => meta.content);

const render = () => renderHook(() => {
    useThemeColorMeta();

    return useColorSchemeSetting();
}, { wrapper });

// Смуга браузера на телефоні йде за темою застосунку, а не лише за темою системи
test('a manual Light keeps the browser bar light on a dark system', () => {
    osDark = true;
    const { result } = render();

    act(() => {
        result.current.setValue('light');
    });

    expect(barColors()).toEqual([ THEME_COLOR.light, THEME_COLOR.light ]);
});

test('a manual Dark makes the browser bar dark on a light system', () => {
    const { result } = render();

    act(() => {
        result.current.setValue('dark');
    });

    expect(barColors()).toEqual([ THEME_COLOR.dark, THEME_COLOR.dark ]);
});

// Review Focus 4: у режимі System зміна теми ОС перефарбовує й смугу
test('System follows the OS scheme in the browser bar while the app is open', () => {
    render();

    expect(barColors()).toEqual([ THEME_COLOR.light, THEME_COLOR.light ]);

    act(() => {
        setOsDark(true);
    });

    expect(barColors()).toEqual([ THEME_COLOR.dark, THEME_COLOR.dark ]);
});
