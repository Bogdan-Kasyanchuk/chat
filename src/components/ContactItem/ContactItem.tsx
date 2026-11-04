import { Text, UnstyledButton } from '@mantine/core';
import type { FC } from 'react';

import PresenceAvatar from '@/components/PresenceAvatar';
import StatusText from '@/components/StatusText';
import type { ContactView } from '@/types/chat';

import classes from './ContactItem.module.css';

type ContactItemProps = {
    contact: ContactView,
    now: number,
    onOpen: (contact: ContactView) => void
};

const ContactItem: FC<ContactItemProps> = ({ contact, now, onOpen }) => (
    <UnstyledButton
        className={ classes.item }
        onClick={ () => {
            onOpen(contact);
        } }
    >
        <PresenceAvatar
            name={ contact.name }
            avatar={ contact.avatar }
            size={ 48 }
            online={ contact.online }
        />
        <div className={ classes.body }>
            <Text
                fw={ 600 }
                truncate
            >
                { contact.name }
            </Text>
            <StatusText
                lastSeenAt={ contact.lastSeenAt }
                now={ now }
                online={ contact.online }
            />
        </div>
    </UnstyledButton>
);

export default ContactItem;
