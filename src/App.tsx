import { Navigate, Route, Routes } from 'react-router-dom';

import { Button, Container, Flex } from '@mantine/core';

import Footer from '@/layouts/Footer';
import Header from '@/layouts/Header';

import ChatPage from '@/pages/ChatPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';

import PrivateRoute from '@/routes/PrivateRoute';
import PublicRoute from '@/routes/PublicRoute';

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
