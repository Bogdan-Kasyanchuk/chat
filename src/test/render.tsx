import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import { ContextMenuProvider } from 'mantine-contextmenu';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import type { InitialEntry } from 'react-router';

import theme from '@/theme';

// Провайдери через wrapper: rerender з тестів лишає їх на місці.
// env="test" вимикає анімації й приховування випадних меню, чий якір jsdom вважає невидимим (усі розміри нульові)
export const renderWithProviders = (ui: ReactElement, { route }: { route?: InitialEntry } = {}) => render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
        <MantineProvider
            theme={ theme }
            env="test"
        >
            <ContextMenuProvider>
                <MemoryRouter initialEntries={ [ route ?? '/' ] }>{ children }</MemoryRouter>
            </ContextMenuProvider>
        </MantineProvider>
    )
});
