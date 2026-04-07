import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { Center, Flex } from '@mantine/core';

import { firebaseGitHubAuth, firebaseGoogleAuth } from '@/service/firebase';

import { Button } from '@/components';

const Home: FC = () => {
  return (
    <Center h='100%'>
      <Flex
        gap='xl'
        p={20}
        direction='column'
        maw={360}
        bg='white'
        w='100%'
        sx={{ boxShadow: '0px 4px 5px 2px rgba(18, 18, 18, 0.35)' }}
      >
        <Button
          type='button'
          variant='filled'
          size='lg'
          uppercase
          color='red.7'
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
    </Center>
  );
};

export default Home;
