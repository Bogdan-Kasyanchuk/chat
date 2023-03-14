import { MantineProvider } from '@mantine/core';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.scss';
import App from '@/App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        breakpoints: {
          xs: '22.5em',
          sm: '36em',
          md: '48em',
          lg: '64em',
          xl: '90em',
        },
        activeStyles: { transform: 'translateY(0px)' },
        components: {
          Container: {
            defaultProps: {
              maw: 1440,
            },
          },
        },
      }}
    >
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
