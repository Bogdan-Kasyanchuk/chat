import { Button, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUserPlus } from '@tabler/icons-react';
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
        <div
            className={ classes.banner }
            role="region"
            aria-label="Not in your contacts"
        >
            <Text
                className={ classes.text }
                size="sm"
            >
                { partner.name } is not in your contacts. Only you can see this.
            </Text>
            <Button
                leftSection={ <IconUserPlus size={ 18 } /> }
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
