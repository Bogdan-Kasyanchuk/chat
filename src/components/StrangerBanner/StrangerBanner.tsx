import { Button, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from 'convex/react';
import { type FC, useState } from 'react';

import errorMessage from '@/lib/errorMessage';
import type { ChatView } from '@/types/chat';
import { api } from '@convex/_generated/api';

import classes from './StrangerBanner.module.css';

type StrangerBannerProps = {
    chat: ChatView
};

// Чат з людиною, якої немає в контактах (написала першою), — пропозиція додати її
const StrangerBanner: FC<StrangerBannerProps> = ({ chat }) => {
    const addContact = useMutation(api.contacts.add);
    const [ loading, setLoading ] = useState(false);
    const { partner } = chat;
    const { userId } = partner;

    if (partner.isContact || userId === null) {
        return null;
    }

    const add = async () => {
        setLoading(true);

        try {
            await addContact({ userId });
        } catch (error) {
            notifications.show({ color: 'red', message: errorMessage(error) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={ classes.banner }>
            <Text
                size="sm"
                truncate
            >
                { partner.name } is not in your contacts
            </Text>
            <Button
                size="xs"
                variant="default"
                loading={ loading }
                onClick={ () => {
                    void add();
                } }
            >
                Add to contacts
            </Button>
        </div>
    );
};

export default StrangerBanner;
