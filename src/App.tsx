import { Container, Flex } from '@mantine/core';

import Footer from '@/layouts/Footer';
import Header from '@/layouts/Header';

import ChatPage from '@/pages/ChatPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';

function App() {
  return (
    <Flex direction='column' h='100%'>
      <Header />
      <Container p={20} h='100%'>
        <ChatPage />
        <HomePage />
        <LoginPage />
      </Container>
      <Footer />
    </Flex>
  );
}

export default App;
