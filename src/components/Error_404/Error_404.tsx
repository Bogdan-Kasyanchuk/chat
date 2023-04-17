import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Flex, Text, Title } from '@mantine/core';

import { Button } from '@/components';

import useStyles from './Error_404.styles';

const Error_404: FC = () => {
  const { classes: c } = useStyles();
  const navigate = useNavigate();

  return (
    <Flex h='100%' px={20} direction='column' justify='center' align='center' gap={40}>
      <div className={c.label}>404</div>
      <Box>
        <Title className={c.title}>Something is not right...</Title>
        <Text fz={18} maw={500} color='gray.6'>
          Page you are trying to open does not exist. You may have mistyped the address, or the page
          has been moved to another URL. If you think this is an error contact support.
        </Text>
      </Box>
      <Button
        type='button'
        variant='filled-grey'
        size='lg'
        uppercase
        onClick={() => {
          navigate('/');
        }}
      >
        Back to home page
      </Button>
    </Flex>
  );
};

export default Error_404;
