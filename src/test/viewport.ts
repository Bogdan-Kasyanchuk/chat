import { vi } from 'vitest';

// useMediaQuery читає matchMedia; тест вирішує, десктоп це (від md) чи телефон
export const mockViewport = (desktop: boolean) => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: desktop && query.includes('min-width'),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
    }));
};
