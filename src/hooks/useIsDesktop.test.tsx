import { renderHook } from '@testing-library/react';
import { expect, test } from 'vitest';

import { mockViewport } from '@/test/viewport';

import useIsDesktop from './useIsDesktop';

// Щойно змонтований компонент (панель налаштувань, вміст діалогу) не має спершу малюватися телефонним
test('useIsDesktop knows the desktop on the first render', () => {
    mockViewport(true);

    const renders: boolean[] = [];

    renderHook(() => {
        renders.push(useIsDesktop());
    });

    expect(renders[ 0 ]).toBe(true);
});
