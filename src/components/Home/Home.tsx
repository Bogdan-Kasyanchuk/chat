import { FC } from 'react';
import { Link } from 'react-router-dom';

import { Flex } from '@mantine/core';

import { userGitHubAuth } from '@/service/firebaseGitHubAuth';
import { userGoogleAuth } from '@/service/firebaseGoogleAuth';

import { ButtonCustom } from '@/components';

const Home: FC = () => {
  return (
    <Flex gap='xl' align='center' justify='center' direction='column' h='100%'>
      <ButtonCustom variant='filled' size='lg' uppercase color='red' onClick={userGoogleAuth}>
        Login with google
      </ButtonCustom>
      {/* <ButtonCustom
        variant='filled'
        size='lg'
        uppercase
        onClick={userAuth}
      >
        Login with Facebook
      </ButtonCustom> */}
      <ButtonCustom variant='outline' size='lg' uppercase color='dark' onClick={userGitHubAuth}>
        Login with GitHub
      </ButtonCustom>
      <Link to='/login'>
        <ButtonCustom variant='filled-grey' size='lg' uppercase>
          Login with Email
        </ButtonCustom>
      </Link>
      <Link to='/register'>
        <ButtonCustom variant='filled-grey' size='lg' uppercase>
          Register with Email
        </ButtonCustom>
      </Link>
    </Flex>
  );
};

export default Home;
