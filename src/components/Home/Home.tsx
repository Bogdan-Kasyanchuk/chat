import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { Flex } from '@mantine/core';

import { firebaseGitHubAuth, firebaseGoogleAuth } from '@/service/firebase';

import { Button } from '@/components';

const Home: FC = () => {
  return (
    <Flex gap='xl' justify='center' direction='column' h='100%' w='fit-content' mx='auto'>
      <Button
        type='button'
        variant='filled'
        size='lg'
        uppercase
        color='orange'
        onClick={firebaseGoogleAuth}
      >
        Continue with google
      </Button>
      <Button
        type='button'
        variant='outline'
        size='lg'
        uppercase
        color='dark.5'
        onClick={firebaseGitHubAuth}
      >
        Continue with GitHub
      </Button>
      <Link to='/login'>
        <Button type='button' variant='filled-grey' size='lg' uppercase w='100%'>
          Login with Email
        </Button>
      </Link>
      <Link to='/register'>
        <Button type='button' variant='filled-grey' size='lg' uppercase w='100%'>
          Register with Email
        </Button>
      </Link>
    </Flex>
  );
};

export default Home;
