import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import { mockViewport } from './viewport';

// Поліфіли з документації Mantine «Testing with Vitest»: jsdom не має цих API
const { getComputedStyle } = window;

window.getComputedStyle = elt => getComputedStyle(elt);
window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.ResizeObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
};
HTMLMediaElement.prototype.play = () => Promise.resolve();

beforeEach(() => {
    mockViewport(false);
});

afterEach(() => {
    cleanup();
});
