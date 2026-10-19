import { MantineProvider, Title } from '@mantine/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-contextmenu/styles.css';
import '@/global.css';

import theme from '@/theme';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <MantineProvider theme={ theme }>
            <Title>Chat</Title>
        </MantineProvider>
    </StrictMode>
);
