import { MantineProvider } from '@mantine/core';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { COLOR_SCHEME_KEY, colorSchemeManager } from '@/theme';

import useColorSchemeSetting from './useColorSchemeSetting';

// Тема системи, яку можна змінити посеред тесту, як перемикач ОС
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
        onchange: null,
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
});

afterEach(() => {
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

const scheme = () => document.documentElement.getAttribute('data-mantine-color-scheme');

// Review Focus 4
test('System follows the OS scheme while the app is open', () => {
    const { result } = renderHook(() => useColorSchemeSetting(), { wrapper });

    expect(result.current.value).toBe('auto');
    expect(scheme()).toBe('light');

    act(() => {
        setOsDark(true);
    });

    expect(scheme()).toBe('dark');
});

test('a manual choice is stored on the device and survives a reload', () => {
    const first = renderHook(() => useColorSchemeSetting(), { wrapper });

    act(() => {
        first.result.current.setValue('dark');
    });

    expect(window.localStorage.getItem(COLOR_SCHEME_KEY)).toBe('dark');
    expect(scheme()).toBe('dark');
    first.unmount();

    const second = renderHook(() => useColorSchemeSetting(), { wrapper });

    expect(second.result.current.value).toBe('dark');

    act(() => {
        setOsDark(false);
    });

    expect(scheme()).toBe('dark');
});

test('going back to System follows the OS again', () => {
    window.localStorage.setItem(COLOR_SCHEME_KEY, 'light');
    osDark = true;
    const { result } = renderHook(() => useColorSchemeSetting(), { wrapper });

    expect(scheme()).toBe('light');

    act(() => {
        result.current.setValue('auto');
    });

    expect(window.localStorage.getItem(COLOR_SCHEME_KEY)).toBe('auto');
    expect(scheme()).toBe('dark');
});

test('the storage key is chat-color-scheme', () => {
    expect(COLOR_SCHEME_KEY).toBe('chat-color-scheme');
});
