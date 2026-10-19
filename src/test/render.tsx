import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

import theme from '@/theme';

export const renderWithProviders = (ui: ReactElement, { route }: { route?: string } = {}) => render(
    <MantineProvider theme={ theme }>
        <MemoryRouter initialEntries={ [ route ?? '/' ] }>{ ui }</MemoryRouter>
    </MantineProvider>
);
