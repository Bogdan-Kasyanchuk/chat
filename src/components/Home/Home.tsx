import { FC } from 'react';
import { Link } from 'react-router-dom';

import { Flex } from '@mantine/core';

import { userGitHubAuth } from '@/service/firebaseGitHubAuth';
import { userGoogleAuth } from '@/service/firebaseGoogleAuth';

import { ButtonCustom } from '@/components';

const Home: FC = () => {
  return (
    <Flex gap='xl' align='stretch' justify='center' direction='column' h='100%'>
      <ButtonCustom variant='filled' size='lg' uppercase color='orange' onClick={userGoogleAuth}>
        Login with google
      </ButtonCustom>
      <ButtonCustom variant='outline' size='lg' uppercase color='dark' onClick={userGitHubAuth}>
        Login with GitHub
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
