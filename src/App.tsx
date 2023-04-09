import { Navigate, Route, Routes } from 'react-router-dom';

import { Container, Flex, LoadingOverlay } from '@mantine/core';

import useUser from '@/hooks/useUser';

import { Footer, Header } from '@/layouts';
import { ChatPage, HomePage, LoginPage, RegisterPage } from '@/pages';
import { PrivateRoute, PublicRoute } from '@/routes';

function App() {
  const { loading } = useUser();
  return (
    <>
      <Flex direction='column' h='100%'>
        <LoadingOverlay
          visible={loading}
          overlayColor='dark.5'
          overlayOpacity={0.3}
          loaderProps={{ color: 'dark.5', size: 100 }}
        />
        {!loading && (
          <>
            <Header />
            <Container px={0} h='calc(100% - 119px)'>
              <Routes>
                <Route
                  path='/'
                  element={
                    <PublicRoute>
                      <HomePage />
                    </PublicRoute>
                  }
                />
                <Route
                  path='/login'
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path='/register'
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path='/chat'
                  element={
                    <PrivateRoute>
                      <ChatPage />
                    </PrivateRoute>
                  }
                />
                <Route path='/*' element={<Navigate to='/' />} />
              </Routes>
            </Container>
            <Footer />
          </>
        )}
      </Flex>
    </>
  );
}

export default App;
