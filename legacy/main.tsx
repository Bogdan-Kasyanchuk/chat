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
            body: {
              color: theme.colors.dark[5],
              backgroundColor: theme.colors.gray[2],
              backgroundImage: `url('https://www.transparenttextures.com/patterns/type.png')`,
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
              borderColor: theme.colors.dark[5],
              boxShadow: `inset 0 0 0 1px ${theme.colors.dark[5]}`,
            }),
          },
          defaultRadius: 0,
          components: {
            Container: {
              defaultProps: {
                size: 1440,
                p: {
                  xs: 10,
                  md: 20,
                },
                w: '100%',
                h: '100%',
              },
            },
            Input: {
              styles: (theme) => ({
                input: {
                  border: `${rem(1)} solid ${theme.colors.gray[4]}`,
                  transition: 'border-color 100ms ease, box-shadow 100ms ease',
                  color: theme.colors.dark[5],
                  '&::placeholder': {
                    color: theme.colors.gray[6],
                  },
                  '&[data-invalid]': {
                    outline: 'none',
                    borderColor: theme.colors.dark[5],
                    boxShadow: `inset 0 0 0 1px ${theme.colors.dark[5]}`,
                    color: theme.colors.dark[5],
                    '&::placeholder': {
                      color: theme.colors.gray[6],
                    },
                  },
                },
                icon: {
                  color: theme.colors.gray[6],
                },
              }),
            },
            TextInput: {
              styles: (theme) => ({
                required: {
                  color: theme.colors.red[7],
                },
              }),
            },
            PasswordInput: {
              styles: (theme) => ({
                innerInput: {
                  color: theme.colors.dark[5],
                  '&::placeholder': {
                    color: theme.colors.gray[6],
                  },
                  '&[data-with-icon]': {
                    paddingLeft: rem(40),
                  },
                  '&[data-invalid]': {
                    color: theme.colors.dark[5],
                    '&::placeholder': {
                      color: theme.colors.gray[6],
                    },
                  },
                },
                required: {
                  color: theme.colors.red[7],
                },
              }),
            },
            ActionIcon: {
              styles: () => ({
                root: {
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                },
              }),
            },
            ScrollArea: {
              defaultProps: {
                type: 'auto',
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
                    color: theme.colors.dark[5],
                  },
                }),
              },
            },
          },
        }}
      >
        <Notifications position='top-center' autoClose={3000} zIndex={100} />
        <App />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);
