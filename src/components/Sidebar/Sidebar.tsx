import { ActionIcon } from '@mantine/core';
import { IconArrowLeft, IconPencil } from '@tabler/icons-react';
import { useQuery } from 'convex/react';
import { type CSSProperties, type FC, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import AddContactModal from '@/components/AddContactModal';
import BottomTabs from '@/components/BottomTabs';
import ChatList from '@/components/ChatList';
import ContactsPanel from '@/components/ContactsPanel';
import MainMenu from '@/components/MainMenu';
import SettingsPanel from '@/components/SettingsPanel';
import SidebarHeader from '@/components/SidebarHeader';
import useIsDesktop from '@/hooks/useIsDesktop';
import { unreadTotal } from '@/lib/unread';
import type { SidebarView } from '@/types/sidebar';
import { api } from '@convex/_generated/api';

import classes from './Sidebar.module.css';

const TITLES = { chats: 'Chats', contacts: 'Contacts', settings: 'Settings' } as const;

// Mantine ставить --ai-color інлайн-стилем з varsResolver; style застосовується після нього
const ACCENT_ICON = { '--ai-color': 'var(--chat-accent-text)' } as CSSProperties;

// Відкритий Add contact — запис в історії (?add=contact): системний «назад» закриває діалог чи екран телефона
const ADD_PARAM = 'add';

// Бічна панель: на десктопі розділи перемикає меню ☰ (контакти — зі стрілкою «назад»),
// на телефоні — нижні вкладки й заголовок екрана. Налаштування — панель на місці списку, розмова праворуч лишається
const Sidebar: FC = () => {
    const isDesktop = useIsDesktop();
    // Той самий запит, що й у ChatList: Convex-клієнт зводить однакові підписки в одну
    const chats = useQuery(api.chats.list);
    const [ view, setView ] = useState<SidebarView>('chats');
    const [ search, setSearch ] = useState('');
    const [ params, setParams ] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const adding = params.get(ADD_PARAM) === 'contact';
    const searchRef = useRef<HTMLInputElement>(null);
    const backRef = useRef<HTMLButtonElement>(null);
    // Кнопка, що перемкнула розділ (☰, «назад», «New chat»), зникає: фокус переходить у пошук нового розділу,
    // а в налаштуваннях — на стрілку «назад»
    const focusSearch = useRef(false);

    useEffect(() => {
        if (focusSearch.current) {
            focusSearch.current = false;
            (view === 'settings' ? backRef : searchRef).current?.focus();
        }
    }, [ view ]);

    const unread = unreadTotal(chats);

    // focus — перемкнули кнопкою, що зникає; на телефоні фокус у пошуку відкрив би клавіатуру, тож лише десктоп
    const select = (next: SidebarView, focus = false) => {
        focusSearch.current = focus && isDesktop;
        setView(next);
        setSearch('');
    };

    const back = () => {
        select('chats', true);
    };

    const addContact = () => {
        setParams(current => {
            current.set(ADD_PARAM, 'contact');

            return current;
        }, { state: { addContact: true } });
    };

    // Відкрили кнопкою — повертаємось на запис назад; прийшли за посиланням з ?add — просто прибираємо параметр
    const closeAddContact = () => {
        if ((location.state as { addContact?: boolean } | null)?.addContact) {
            void navigate(-1);

            return;
        }

        setParams(current => {
            current.delete(ADD_PARAM);

            return current;
        }, { replace: true });
    };

    const newChat = (
        <ActionIcon
            variant={ isDesktop ? 'filled' : 'subtle' }
            size={ isDesktop ? 50 : undefined }
            aria-label="New chat"
            className={ isDesktop ? classes.fab : classes.newChat }
            style={ isDesktop ? undefined : ACCENT_ICON }
            onClick={ () => {
                select('contacts', true);
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
                onSelect={ next => {
                    select(next, true);
                } }
            />
        )
        : (
            <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Back to chats"
                onClick={ back }
            >
                <IconArrowLeft
                    size={ 22 }
                    aria-hidden
                />
            </ActionIcon>
        );

    const content = view === 'settings'
        ? (
            <SettingsPanel
                backRef={ backRef }
                onBack={ back }
            />
        )
        : (
            <>
                <SidebarHeader
                    title={ isDesktop ? undefined : TITLES[ view ] }
                    start={ desktopStart }
                    end={ view === 'chats' ? newChat : undefined }
                    searchLabel={ view === 'chats' ? 'Search' : 'Search contacts' }
                    search={ search }
                    searchRef={ searchRef }
                    onSearch={ setSearch }
                />
                <div className={ classes.list }>
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
            </>
        );

    return (
        <aside className={ classes.sidebar }>
            { content }
            { !isDesktop && (
                <BottomTabs
                    view={ view }
                    unread={ unread }
                    onSelect={ select }
                />
            ) }
            <AddContactModal
                opened={ adding }
                backLabel={ view === 'chats' ? 'Back to chats' : 'Back to contacts' }
                onClose={ closeAddContact }
                onOpened={ () => {
                    select('chats');
                } }
            />
        </aside>
    );
};

export default Sidebar;
