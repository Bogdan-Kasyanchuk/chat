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
          globalStyles: (theme) => ({
            'html, body, #root': {
              height: '100vh',
            },
            ul: {
              listStyleType: 'none',
              margin: 0,
              padding: 0,
            },
            p: {
              margin: 0,
            },
          }),
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
                w: '100%',
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
            ScrollArea: {
              defaultProps: {
                type: 'auto',
                py: 20,
                px: 15,
              },
              styles: (theme) => ({
                scrollbar: {
                  '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                    backgroundColor: theme.colors.gray[2],
                  },
                  '&[data-orientation="vertical"] .mantine-ScrollArea-thumb:hover': {
                    backgroundColor: theme.colors.dark[5],
                  },
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
