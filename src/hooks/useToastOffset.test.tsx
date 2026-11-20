import { renderHook } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';

import useToastOffset from './useToastOffset';

let resize: (() => void) | null = null;
const disconnect = vi.fn();

class FakeResizeObserver {
    constructor(callback: () => void) {
        resize = callback;
    }

    observe() {}

    unobserve() {}

    disconnect = disconnect;
}

const offset = () => document.documentElement.style.getPropertyValue('--chat-toast-offset');

afterEach(() => {
    vi.unstubAllGlobals();
    resize = null;
});

test('toasts stand 20 above the bottom bar of the conversation and follow its height', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);

    const bar = document.createElement('div');
    let height = 70;

    Object.defineProperty(bar, 'offsetHeight', { get: () => height });

    const { unmount } = renderHook(() => {
        useToastOffset({ current: bar });
    });

    // Композер 70 — як на канвасі: toast на 90 від низу
    expect(offset()).toBe('90px');

    // Панель відповіді, кілька рядків чи панель емодзі піднімають смугу — toast піднімається з нею
    height = 370;
    resize?.();

    expect(offset()).toBe('390px');

    unmount();

    expect(disconnect).toHaveBeenCalled();
    expect(offset()).toBe('');
});
