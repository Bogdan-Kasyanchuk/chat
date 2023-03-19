import { Navigate, Route, Routes } from 'react-router-dom';

import { Container, Flex } from '@mantine/core';

import { Footer, Header } from '@/layouts';
import { ChatPage, HomePage, LoginPage, RegisterPage } from '@/pages';
import { PrivateRoute, PublicRoute } from '@/routes';

function App() {
  return (
    <Flex direction='column' h='100%'>
      <Header />
      <Container p={20} h='100%'>
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
    </Flex>
  );
}

export default App;
