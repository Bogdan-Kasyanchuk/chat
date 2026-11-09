import { IconCheck, IconChecks } from '@tabler/icons-react';
import cx from 'clsx';
import type { FC } from 'react';

import Logo from '@/components/Logo';
import { AVATAR_COLORS } from '@/lib/avatarColor';

import classes from './AuthShowcase.module.css';

type Bubble = {
    text: string,
    time: string,
    out?: boolean,
    // Перше повідомлення групи відділене 8px, наступні — 4px і мають менший верхній кут з боку автора
    next?: boolean,
    tick?: 'sent' | 'read',
    forwardedFrom?: string
};

// Листування з артборду Main
const BUBBLES: Bubble[] = [
    { text: 'Are we still on for tonight?', time: '19:02' },
    { text: 'Yes! Table for two at eight', time: '19:03', out: true, tick: 'read' },
    { text: 'Booked the place by the river', time: '19:03', out: true, next: true, tick: 'read' },
    { text: 'Their terrace opens at 19:30', time: '19:05', forwardedFrom: 'Iryna Bondar' },
    { text: 'Perfect, see you there', time: '19:05', next: true },
    { text: 'See you!', time: '19:06', out: true, tick: 'sent' }
];

type Contact = {
    name: string,
    initials: string,
    color: string,
    status: string,
    online?: boolean,
    // online і typing… — акцентом, last seen — приглушено
    accent?: boolean
};

// Контакти з артборду SignUp
const CONTACTS: Contact[] = [
    { name: 'Marko Shevchuk', initials: 'MS', color: AVATAR_COLORS[ 0 ], status: 'online', online: true, accent: true },
    { name: 'Iryna Bondar', initials: 'IB', color: AVATAR_COLORS[ 1 ], status: 'last seen 5 minutes ago' },
    { name: 'Olha Melnyk', initials: 'OM', color: AVATAR_COLORS[ 5 ], status: 'typing…', online: true, accent: true },
    { name: 'Dmytro Koval', initials: 'DK', color: AVATAR_COLORS[ 4 ], status: 'last seen yesterday at 22:14' },
    { name: 'Sofia Tkachenko', initials: 'ST', color: AVATAR_COLORS[ 6 ], status: 'online', online: true, accent: true }
];

const COPY = {
    messages: {
        title: 'Messages that arrive the moment they are sent.',
        text: 'See who is online, reply, forward and keep your contacts in one place.'
    },
    contacts: {
        title: 'Add people by email and start talking.',
        text: 'Only your contacts and the people you write to can see you.'
    }
};

const Messages: FC = () => (
    <div className={ classes.messages }>
        <span className={ classes.chip }>Today</span>
        { BUBBLES.map(bubble => (
            <div
                key={ bubble.text }
                className={ cx(classes.bubble, bubble.out ? classes.out : classes.in, bubble.next && classes.next) }
            >
                { bubble.forwardedFrom && <span className={ classes.forwarded }>Forwarded from { bubble.forwardedFrom }</span> }
                <span>{ bubble.text }</span>
                <span className={ classes.meta }>
                    { bubble.time }
                    { bubble.tick === 'read' && (
                        <IconChecks
                            className={ classes.read }
                            size={ 16 }
                            stroke={ 2.2 }
                        />
                    ) }
                    { bubble.tick === 'sent' && (
                        <IconCheck
                            className={ classes.sent }
                            size={ 16 }
                            stroke={ 2.2 }
                        />
                    ) }
                </span>
            </div>
        )) }
        <div className={ cx(classes.bubble, classes.in, classes.typing) }>
            <span className={ classes.dot } />
            <span className={ classes.dot } />
            <span className={ classes.dot } />
        </div>
    </div>
);

const Contacts: FC = () => (
    <div className={ classes.contacts }>
        { CONTACTS.map(contact => (
            <div
                key={ contact.name }
                className={ classes.contact }
            >
                <span
                    className={ classes.avatar }
                    style={ { backgroundColor: contact.color } }
                >
                    { contact.initials }
                    { contact.online && <span className={ classes.online } /> }
                </span>
                <span className={ classes.person }>
                    <span className={ classes.name }>{ contact.name }</span>
                    <span className={ contact.accent ? classes.statusAccent : classes.status }>{ contact.status }</span>
                </span>
            </div>
        )) }
    </div>
);

// Вітрина поруч із формою входу (десктоп): лише картинка, читач екрана її пропускає
const AuthShowcase: FC<{ variant: 'messages' | 'contacts' }> = ({ variant }) => (
    <section
        className={ classes.root }
        aria-hidden="true"
    >
        <Logo />
        { variant === 'messages' ? <Messages /> : <Contacts /> }
        <div className={ classes.copy }>
            <p className={ classes.title }>{ COPY[ variant ].title }</p>
            <p className={ classes.text }>{ COPY[ variant ].text }</p>
        </div>
    </section>
);

export default AuthShowcase;
