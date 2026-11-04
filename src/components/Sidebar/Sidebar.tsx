import { SegmentedControl, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { type FC, useState } from 'react';

import ChatList from '@/components/ChatList';
import ContactsPanel from '@/components/ContactsPanel';
import UserMenu from '@/components/UserMenu';

import classes from './Sidebar.module.css';

type Tab = 'chats' | 'contacts';

const Sidebar: FC = () => {
    const [ tab, setTab ] = useState<Tab>('chats');
    const [ search, setSearch ] = useState('');

    return (
        <aside className={ classes.sidebar }>
            <div className={ classes.header }>
                <UserMenu />
                <SegmentedControl
                    value={ tab }
                    data={ [ { value: 'chats', label: 'Chats' }, { value: 'contacts', label: 'Contacts' } ] }
                    fullWidth
                    onChange={ value => {
                        setTab(value as Tab);
                        setSearch('');
                    } }
                />
                <TextInput
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    leftSection={ <IconSearch size={ 16 } /> }
                    value={ search }
                    onChange={ e => {
                        setSearch(e.currentTarget.value);
                    } }
                />
            </div>
            <div className={ classes.list }>
                { tab === 'chats'
                    ? <ChatList search={ search } />
                    : <ContactsPanel search={ search } /> }
            </div>
        </aside>
    );
};

export default Sidebar;
