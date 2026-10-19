import { Box, Button, Flex, Text, Title } from '@mantine/core';
import type { FC } from 'react';
import { useNavigate } from 'react-router';

import classes from './NotFoundPage.module.css';

const NotFoundPage: FC = () => {
    const navigate = useNavigate();

    return (
        <Flex
            h="100%"
            px={ 20 }
            direction="column"
            justify="center"
            align="center"
            gap={ 40 }
        >
            <div className={ classes.label }>404</div>
            <Box>
                <Title className={ classes.title }>Something is not right...</Title>
                <Text
                    fz={ 18 }
                    maw={ 500 }
                >
                    Page you are trying to open does not exist. You may have mistyped the address, or the page
                    has been moved to another URL. If you think this is an error contact support.
                </Text>
            </Box>
            <Button
                size="lg"
                tt="uppercase"
                onClick={
                    () => {
                        void navigate('/');
                    }
                }
            >
                Back to home page
            </Button>
        </Flex>
    );
};

export default NotFoundPage;
