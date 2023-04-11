import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { Flex } from '@mantine/core';

import { firebaseGitHubAuth, firebaseGoogleAuth } from '@/service/firebase';

import { ButtonCustom } from '@/components';

const Home: FC = () => {
  return (
    <Flex gap='xl' justify='center' direction='column' h='100%' w='fit-content' mx='auto'>
      <ButtonCustom
        variant='filled'
        size='lg'
        uppercase
        color='orange'
        onClick={firebaseGoogleAuth}
      >
        Continue with google
      </ButtonCustom>
      <ButtonCustom variant='outline' size='lg' uppercase color='dark' onClick={firebaseGitHubAuth}>
        Continue with GitHub
      </ButtonCustom>
      <Link to='/login'>
        <ButtonCustom variant='filled-grey' size='lg' uppercase w='100%'>
          Login with Email
        </ButtonCustom>
      </Link>
      <Link to='/register'>
        <ButtonCustom variant='filled-grey' size='lg' uppercase w='100%'>
          Register with Email
        </ButtonCustom>
      </Link>
    </Flex>
  );
};

export default Home;
