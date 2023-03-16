import { FC } from 'react';

import { Flex } from '@mantine/core';

import { userAuth } from '@/service/firebaseAuth';

import { ButtonCustom } from '@/components';

const Login: FC = () => {
  return (
    <Flex gap='xl' align='center' justify='center' direction='column' h='100%'>
      <ButtonCustom
        variant='filled-grey'
        size='lg'
        uppercase
        // onClick={userAuth}
      >
        Login with google
      </ButtonCustom>
      <ButtonCustom
        variant='filled-grey'
        size='lg'
        uppercase
        // onClick={userAuth}
      >
        Login with GitHub
      </ButtonCustom>
      <ButtonCustom
        variant='filled-grey'
        size='lg'
        uppercase
        // onClick={userAuth}
      >
        Login with Email
      </ButtonCustom>
    </Flex>
  );
};

export default Login;
