import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { ConvexReactClient } from 'convex/react';
import { ContextMenuProvider } from 'mantine-contextmenu';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-contextmenu/styles.css';
import '@/global.css';

import App from '@/App';
import theme from '@/theme';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ConvexAuthProvider client={ convex }>
            <BrowserRouter>
                <MantineProvider theme={ theme }>
                    <ContextMenuProvider>
                        <ModalsProvider>
                            <Notifications
                                position="top-center"
                                autoClose={ 4000 }
                            />
                            <App />
                        </ModalsProvider>
                    </ContextMenuProvider>
                </MantineProvider>
            </BrowserRouter>
        </ConvexAuthProvider>
    </StrictMode>
);
