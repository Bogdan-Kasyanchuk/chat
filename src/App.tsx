import type { FC } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';

import { Container, LoadingOverlay } from '@mantine/core';

import { useUser } from '@/hooks';

import { ChatPage, Error_404Page, HomePage, LoginPage, RegisterPage } from '@/pages';

import { PrivateRoute, PublicRoute } from '@/routes';

const App: FC = () => {
  const { loading } = useUser();
  return (
    <>
      <LoadingOverlay
        visible={loading}
        overlayBlur={3}
        overlayColor='dark.5'
        overlayOpacity={0.25}
        loaderProps={{ color: 'dark.5', size: 100 }}
      />
      {!loading && (
        <Routes>
          <Route
            path='/'
            element={
              <Container>
                <Outlet />
              </Container>
            }
          >
            <Route
              index
              element={
                <PublicRoute>
                  <HomePage />
                </PublicRoute>
              }
            />
            <Route
              path='login'
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path='register'
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path='chat'
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />
          </Route>
          <Route path='/*' element={<Error_404Page />} />
        </Routes>
      )}
    </>
  );
};

export default App;
