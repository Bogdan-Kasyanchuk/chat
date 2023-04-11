import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { Flex } from '@mantine/core';

import { firebaseGitHubAuth, firebaseGoogleAuth } from '@/service/firebase';

import { ButtonCustom } from '@/components';

const Home: FC = () => {
  return (
    <Flex gap='xl' justify='center' direction='column' h='100%' w='fit-content' mx='auto'>
      <ButtonCustom
        type='button'
        variant='filled'
        size='lg'
        uppercase
        color='orange'
        onClick={firebaseGoogleAuth}
      >
        Continue with google
      </ButtonCustom>
      <ButtonCustom
        type='button'
        variant='outline'
        size='lg'
        uppercase
        color='dark.5'
        onClick={firebaseGitHubAuth}
      >
        Continue with GitHub
      </ButtonCustom>
      <Link to='/login'>
        <ButtonCustom type='button' variant='filled-grey' size='lg' uppercase w='100%'>
          Login with Email
        </ButtonCustom>
      </Link>
      <Link to='/register'>
        <ButtonCustom type='button' variant='filled-grey' size='lg' uppercase w='100%'>
          Register with Email
        </ButtonCustom>
      </Link>
    </Flex>
  );
};

export default Home;
