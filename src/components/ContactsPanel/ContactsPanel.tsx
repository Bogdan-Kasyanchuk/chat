import { Text, UnstyledButton } from '@mantine/core';
import { IconSearch, IconUserPlus, IconUsers } from '@tabler/icons-react';
import { useQuery } from 'convex/react';
import type { FC } from 'react';

import ChatListSkeleton from '@/components/ChatListSkeleton';
import ContactItem from '@/components/ContactItem';
import EmptyState from '@/components/EmptyState';
import useNow from '@/hooks/useNow';
import useOpenChatWith from '@/hooks/useOpenChatWith';
import { api } from '@convex/_generated/api';

import classes from './ContactsPanel.module.css';

type ContactsPanelProps = {
    search: string,
    onAddContact: () => void,
    // Чат з контактом відкрито: панель повертається до списку чатів
    onOpened?: () => void
};

const countLabel = (count: number) => `${ count } ${ count === 1 ? 'contact' : 'contacts' }`;

// Артборди Contacts і MobileContacts: рядок «Add contact», кількість контактів, список
const ContactsPanel: FC<ContactsPanelProps> = ({ search, onAddContact, onOpened }) => {
    const contacts = useQuery(api.contacts.list);
    const openChatWith = useOpenChatWith();
    const now = useNow();

    const query = search.trim();
    const visible = contacts?.filter(contact => contact.name.toLowerCase().includes(query.toLowerCase()));

    const renderBody = () => {
        if (!contacts || !visible) {
            return <ChatListSkeleton label="Loading contacts" />;
        }

        if (contacts.length === 0) {
            return (
                <EmptyState
                    icon={
                        <IconUsers
                            size={ 36 }
                            stroke={ 1.6 }
                            aria-hidden
                        />
                    }
                    title="No contacts yet"
                />
            );
        }

        if (visible.length === 0) {
            return (
                <EmptyState
                    icon={
                        <IconSearch
                            size={ 36 }
                            stroke={ 1.8 }
                            color="var(--chat-muted)"
                            aria-hidden
                        />
                    }
                    title="No results"
                    text={ `No contacts match “${ query }”.` }
                />
            );
        }

        return (
            <>
                <Text
                    className={ classes.count }
                    size="sm"
                    fw={ 600 }
                    c="dimmed"
                >
                    { countLabel(visible.length) }
                </Text>
                { visible.map(contact => (
                    <ContactItem
                        key={ contact.userId }
                        contact={ contact }
                        now={ now }
                        onOpen={ item => {
                            void openChatWith(item.userId).then(opened => {
                                if (opened) {
                                    onOpened?.();
                                }
                            });
                        } }
                    />
                )) }
            </>
        );
    };

    return (
        <div className={ classes.list }>
            <UnstyledButton
                className={ classes.add }
                onClick={ onAddContact }
            >
                <span className={ classes.addIcon }>
                    <IconUserPlus
                        size={ 20 }
                        aria-hidden
                    />
                </span>
                Add contact
            </UnstyledButton>
            { renderBody() }
        </div>
    );
};

export default ContactsPanel;
