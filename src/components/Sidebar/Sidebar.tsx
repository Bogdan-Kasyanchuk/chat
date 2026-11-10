import { ActionIcon } from '@mantine/core';
import { IconArrowLeft, IconPencil } from '@tabler/icons-react';
import { useQuery } from 'convex/react';
import { type FC, useState } from 'react';

import AddContactModal from '@/components/AddContactModal';
import BottomTabs from '@/components/BottomTabs';
import ChatList from '@/components/ChatList';
import ContactsPanel from '@/components/ContactsPanel';
import MainMenu from '@/components/MainMenu';
import SettingsModal from '@/components/SettingsModal';
import SidebarHeader from '@/components/SidebarHeader';
import useIsDesktop from '@/hooks/useIsDesktop';
import type { SidebarView } from '@/types/sidebar';
import { api } from '@convex/_generated/api';

import classes from './Sidebar.module.css';

const TITLES = { chats: 'Chats', contacts: 'Contacts', settings: 'Settings' } as const;

// Бічна панель: на десктопі розділи перемикає меню ☰ (контакти — зі стрілкою «назад»),
// на телефоні — нижні вкладки й заголовок екрана. Settings поки відкриває SettingsModal (етап 4 — панель)
const Sidebar: FC = () => {
    const isDesktop = useIsDesktop();
    // Той самий запит, що й у ChatList: Convex-клієнт зводить однакові підписки в одну
    const chats = useQuery(api.chats.list);
    const [ view, setView ] = useState<Exclude<SidebarView, 'settings'>>('chats');
    const [ search, setSearch ] = useState('');
    const [ adding, setAdding ] = useState(false);
    const [ settingsOpened, setSettingsOpened ] = useState(false);

    const unread = chats?.reduce((sum, chat) => chat.muted ? sum : sum + chat.unread, 0) ?? 0;

    const select = (next: SidebarView) => {
        if (next === 'settings') {
            setSettingsOpened(true);

            return;
        }

        setView(next);
        setSearch('');
    };

    const addContact = () => {
        setAdding(true);
    };

    const newChat = (
        <ActionIcon
            variant={ isDesktop ? 'filled' : 'subtle' }
            size={ isDesktop ? 50 : undefined }
            aria-label="New chat"
            className={ isDesktop ? classes.fab : classes.newChat }
            onClick={ () => {
                select('contacts');
            } }
        >
            <IconPencil
                size={ isDesktop ? 24 : 22 }
                aria-hidden
            />
        </ActionIcon>
    );

    const desktopStart = view === 'chats'
        ? (
            <MainMenu
                view={ view }
                onSelect={ select }
            />
        )
        : (
            <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Back to chats"
                onClick={ () => {
                    select('chats');
                } }
            >
                <IconArrowLeft
                    size={ 22 }
                    aria-hidden
                />
            </ActionIcon>
        );

    return (
        <aside className={ classes.sidebar }>
            <SidebarHeader
                title={ isDesktop ? undefined : TITLES[ view ] }
                start={ desktopStart }
                end={ view === 'chats' ? newChat : undefined }
                searchLabel={ view === 'chats' ? 'Search' : 'Search contacts' }
                search={ search }
                onSearch={ setSearch }
            />
            <div
                className={ classes.list }
                data-fab={ isDesktop && view === 'chats' && chats !== undefined && chats.length > 0 ? true : undefined }
            >
                { view === 'chats'
                    ? (
                        <ChatList
                            search={ search }
                            footer={ isDesktop ? newChat : undefined }
                            onAddContact={ addContact }
                        />
                    )
                    : (
                        <ContactsPanel
                            search={ search }
                            onAddContact={ addContact }
                            onOpened={ () => {
                                select('chats');
                            } }
                        />
                    ) }
            </div>
            { !isDesktop && (
                <BottomTabs
                    view={ view }
                    unread={ unread }
                    onSelect={ select }
                />
            ) }
            <AddContactModal
                opened={ adding }
                onClose={ () => {
                    setAdding(false);
                } }
                onOpened={ () => {
                    select('chats');
                } }
            />
            <SettingsModal
                opened={ settingsOpened }
                onClose={ () => {
                    setSettingsOpened(false);
                } }
            />
        </aside>
    );
};

export default Sidebar;
