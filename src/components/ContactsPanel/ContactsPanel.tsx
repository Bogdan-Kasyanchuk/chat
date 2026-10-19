import { Button, Center, Loader, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUserPlus } from '@tabler/icons-react';
import { useMutation, useQuery } from 'convex/react';
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router';

import AddContactModal from '@/components/AddContactModal';
import ContactItem from '@/components/ContactItem';
import useNow from '@/hooks/useNow';
import errorMessage from '@/lib/errorMessage';
import type { ContactView } from '@/types/chat';
import { api } from '@convex/_generated/api';

type ContactsPanelProps = {
    search: string
};

const ContactsPanel: FC<ContactsPanelProps> = ({ search }) => {
    const contacts = useQuery(api.contacts.list);
    const openChat = useMutation(api.chats.open);
    const navigate = useNavigate();
    const now = useNow();
    const [ adding, setAdding ] = useState(false);

    const open = async (contact: ContactView) => {
        try {
            const chatId = contact.chatId ?? await openChat({ userId: contact.userId });

            await navigate(`/chat/${ chatId }`);
        } catch (error) {
            notifications.show({ color: 'red', message: errorMessage(error) });
        }
    };

    const query = search.trim().toLowerCase();
    const visible = contacts?.filter(contact => contact.name.toLowerCase().includes(query));

    return (
        <>
            <Button
                variant="default"
                leftSection={ <IconUserPlus size={ 18 } /> }
                m="md"
                onClick={ () => {
                    setAdding(true);
                } }
            >
                Add contact
            </Button>
            { !visible && (
                <Center p="md">
                    <Loader size="sm" />
                </Center>
            ) }
            { visible?.length === 0 && (
                <Text
                    c="dimmed"
                    ta="center"
                    p="md"
                >
                    { query ? 'No contacts found' : 'No contacts yet' }
                </Text>
            ) }
            { visible?.map(contact => (
                <ContactItem
                    key={ contact.userId }
                    contact={ contact }
                    now={ now }
                    onOpen={ item => {
                        void open(item);
                    } }
                />
            )) }
            <AddContactModal
                opened={ adding }
                onClose={ () => {
                    setAdding(false);
                } }
            />
        </>
    );
};

export default ContactsPanel;
