import { FC } from 'react';

import { Button, Flex } from '@mantine/core';

import { userAuth } from '@/service/firebaseAuth';

const Login: FC = () => {
  return (
    <Flex gap='xl' align='center' justify='center' direction='column' h='100%'>
      <Button
        variant='filled-grey'
        size='lg'
        uppercase
        // onClick={userAuth}
      >
        Login with google
      </Button>
      <Button
        variant='filled-grey'
        size='lg'
        uppercase
        // onClick={userAuth}
      >
        Login with GitHub
      </Button>
      <Button
        variant='filled-grey'
        size='lg'
        uppercase
        // onClick={userAuth}
      >
        Login with Email
      </Button>
    </Flex>
  );
};

export default Login;
