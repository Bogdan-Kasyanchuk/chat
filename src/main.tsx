import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { MantineProvider } from '@mantine/core';

import './index.scss';
import App from '@/App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
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
          focusRingStyles: {
            inputStyles: () => ({
              outline: 'none',
              borderColor: 'black',
              boxShadow: 'inset 0 0 0 1px black',
            }),
          },

          defaultRadius: 0,
          components: {
            Container: {
              defaultProps: {
                maw: 1440,
              },
            },
            Input: {
              styles: () => ({
                input: {
                  transition: 'border-color 100ms ease, box-shadow 100ms ease',
                },
              }),
            },

            Button: {
              styles: (theme) => ({
                root: {
                  '&:not([data-disabled])': theme.fn.hover({
                    backgroundColor: theme.black,
                    color: theme.white,
                  }),
                },
              }),
              variants: {
                'filled-grey': (theme) => ({
                  root: {
                    backgroundColor: theme.colors.gray[4],
                    color: theme.black,
                  },
                }),
              },
            },
          },
        }}
      >
        <App />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
