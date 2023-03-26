import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { MantineProvider, rem } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

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
            xs: rem(360),
            sm: rem(576),
            md: rem(768),
            lg: rem(1024),
            xl: rem(1440),
          },
          activeStyles: { transform: 'translateY(0px)' },
          focusRingStyles: {
            inputStyles: (theme) => ({
              outline: 'none',
              borderColor: theme.black,
              boxShadow: `inset 0 0 0 1px ${theme.black}`,
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
              styles: (theme) => ({
                input: {
                  border: `${rem(1)} solid ${theme.colors.gray[4]}`,
                  transition: 'border-color 100ms ease, box-shadow 100ms ease',
                },
              }),
            },

            Button: {
              styles: (theme) => ({
                root: {
                  '&:not([data-disabled])': theme.fn.hover({
                    backgroundColor: theme.colors.dark[5],
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
                'filled-white': (theme) => ({
                  root: {
                    backgroundColor: theme.white,
                    color: theme.black,
                  },
                }),
              },
            },
          },
        }}
      >
        <Notifications position='top-center' autoClose={2000} zIndex={100} />
        <App />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
