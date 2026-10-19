import { Center, Text } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import type { FC } from 'react';

const EmptyChat: FC = () => (
    <Center h="100%">
        <Text
            c="dimmed"
            ta="center"
            p="md"
        >
            <IconMessageCircle
                size={ 40 }
                stroke={ 1.5 }
            />
            <br />
            Choose who you would like to write to
        </Text>
    </Center>
);

export default EmptyChat;
