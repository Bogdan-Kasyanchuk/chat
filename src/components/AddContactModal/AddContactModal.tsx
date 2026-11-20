import { ActionIcon, Button, Input, Modal, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useConvex, useMutation } from 'convex/react';
import type { FunctionReturnType } from 'convex/server';
import { type CSSProperties, type FC, type SubmitEvent, useId, useRef, useState } from 'react';

import PresenceAvatar from '@/components/PresenceAvatar';
import useIsDesktop from '@/hooks/useIsDesktop';
import useOpenChatWith from '@/hooks/useOpenChatWith';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';

import classes from './AddContactModal.module.css';

type AddContactModalProps = {
    opened: boolean,
    onClose: () => void,
    // Чат з людиною відкрито («Message» чи «Open chat»): чат заміняє запис діалогу в історії,
    // тож діалог закривається сам (opened стає false), без onClose
    onOpened?: () => void,
    // Підпис стрілки на телефоні: розділ, куди вона повертає
    backLabel?: string
};

type Found = NonNullable<FunctionReturnType<typeof api.users.findByEmail>>;

const TITLE = 'Add contact';
const HINT = 'Enter the exact email the person signed up with.';
const NOT_FOUND = 'No one has signed up with this email. Check the spelling.';
// Mantine ставить --ai-color інлайн-стилем з varsResolver; style застосовується після нього
const ACCENT_ICON = { '--ai-color': 'var(--chat-accent-text)' } as CSSProperties;

type AddContactFormProps = {
    isDesktop: boolean,
    onCancel: () => void,
    onOpened?: () => void,
    // Обгортка кнопок дій: на телефоні вони притиснуті донизу екрана
    actionsClassName?: string
};

// Пошук за поштою, картка і дії. Стан живе тут: Modal демонтує вміст, коли закривається (і ззовні,
// системним «назад»), тож наступне відкриття починається з порожнього поля
const AddContactForm: FC<AddContactFormProps> = ({ isDesktop, onCancel, onOpened, actionsClassName }) => {
    const convex = useConvex();
    const addContact = useMutation(api.contacts.add);
    const openChatWith = useOpenChatWith();
    const id = useId();
    const [ email, setEmail ] = useState('');
    // Пошта, за якою знайдено людину: показується в картці
    const [ foundEmail, setFoundEmail ] = useState('');
    const [ found, setFound ] = useState<Found | null>(null);
    const [ missing, setMissing ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ busy, setBusy ] = useState(false);
    const [ acting, setActing ] = useState(false);
    // Номер пошуку: відповідь застосовується, лише якщо відтоді пошту не змінили
    const request = useRef(0);

    const clearResult = () => {
        request.current += 1;
        setBusy(false);
        setFound(null);
        setMissing(false);
        setError(null);
    };

    const find = async (event: SubmitEvent) => {
        event.preventDefault();
        clearResult();
        setBusy(true);

        const current = request.current;

        try {
            const user = await convex.query(api.users.findByEmail, { email });

            if (current === request.current) {
                setFound(user);
                setMissing(user === null);
                setFoundEmail(email.trim());
            }
        } catch (e) {
            if (current === request.current) {
                setError(errorMessage(e));
            }
        } finally {
            if (current === request.current) {
                setBusy(false);
            }
        }
    };

    const add = async () => {
        if (!found || acting) {
            return;
        }

        setActing(true);

        try {
            await addContact({ userId: found.userId });
            setFound({ ...found, isContact: true });
        } catch (e) {
            notifications.show({ color: 'red', message: errorMessage(e) });
        } finally {
            setActing(false);
        }
    };

    const message = async () => {
        if (!found || acting) {
            return;
        }

        setActing(true);

        if (await openChatWith(found.userId, { replace: true })) {
            onOpened?.();
        }

        setActing(false);
    };

    const fieldError = missing ? NOT_FOUND : error;

    const form = (
        <form
            onSubmit={ e => {
                void find(e);
            } }
        >
            <Input.Wrapper
                id={ id }
                label="Email"
                description={ fieldError ? undefined : HINT }
                error={ fieldError && <span role="alert">{ fieldError }</span> }
                inputWrapperOrder={ [ 'label', 'input', 'description', 'error' ] }
            >
                <div className={ classes.field }>
                    <Input
                        id={ id }
                        className={ classes.input }
                        type="email"
                        placeholder="name@example.com"
                        value={ email }
                        error={ Boolean(fieldError) }
                        aria-describedby={ fieldError ? `${ id }-error` : `${ id }-description` }
                        onChange={ e => {
                            setEmail(e.currentTarget.value);
                            clearResult();
                        } }
                    />
                    <Button
                        type="submit"
                        loading={ busy }
                        disabled={ email.trim() === '' }
                    >
                        Find
                    </Button>
                </div>
            </Input.Wrapper>
        </form>
    );

    const card = found && (
        <div className={ classes.card }>
            <PresenceAvatar
                userId={ found.userId }
                name={ found.name }
                avatar={ found.avatar }
                size={ 44 }
            />
            <div className={ classes.person }>
                <Text
                    fw={ 600 }
                    truncate
                >
                    { found.name }
                </Text>
                { found.isContact
                    ? (
                        <Text
                            size="sm"
                            c="var(--chat-accent-text)"
                        >
                            Already in your contacts
                        </Text>
                    )
                    : (
                        <Text
                            size="sm"
                            c="dimmed"
                            truncate
                        >
                            { foundEmail }
                        </Text>
                    ) }
            </div>
        </div>
    );

    const messageButton = (label: string, variant: 'filled' | 'default') => (
        <Button
            variant={ variant }
            disabled={ acting }
            onClick={ () => {
                void message();
            } }
        >
            { label }
        </Button>
    );

    const addButton = (
        <Button
            disabled={ acting || missing }
            onClick={ () => {
                void add();
            } }
        >
            Add to contacts
        </Button>
    );

    const cancelButton = (
        <Button
            variant="default"
            onClick={ onCancel }
        >
            Cancel
        </Button>
    );

    const renderActions = () => {
        if (found?.isContact) {
            return <div className={ classes.actions }>{ messageButton('Open chat', 'filled') }</div>;
        }

        if (found) {
            // На телефоні головна дія — перша, кнопки одна над одною
            return isDesktop
                ? <div className={ classes.actions }>{ messageButton('Message', 'default') }{ addButton }</div>
                : <div className={ classes.actions }>{ addButton }{ messageButton('Message', 'default') }</div>;
        }

        if (missing) {
            return isDesktop
                ? <div className={ classes.actions }>{ cancelButton }{ addButton }</div>
                : <div className={ classes.actions }>{ addButton }{ cancelButton }</div>;
        }

        return null;
    };

    return (
        <>
            { form }
            { card }
            <div className={ actionsClassName }>{ renderActions() }</div>
        </>
    );
};

// Артборди AddContact, AddContactNotFound, AddContactExists (діалог 420 на десктопі) і MobileAddContact
// (екран на телефоні: «назад», заголовок 32, кнопки внизу)
const AddContactModal: FC<AddContactModalProps> = ({ opened, onClose, onOpened, backLabel = 'Back to contacts' }) => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return (
            <Modal
                opened={ opened }
                title={ TITLE }
                classNames={ { body: classes.body } }
                centered
                onClose={ onClose }
            >
                <AddContactForm
                    isDesktop
                    onCancel={ onClose }
                    onOpened={ onOpened }
                />
            </Modal>
        );
    }

    return (
        <Modal.Root
            opened={ opened }
            fullScreen
            onClose={ onClose }
        >
            <Modal.Content aria-label={ TITLE }>
                <Modal.Body className={ classes.screen }>
                    <div className={ classes.back }>
                        <ActionIcon
                            variant="subtle"
                            aria-label={ backLabel }
                            style={ ACCENT_ICON }
                            onClick={ onClose }
                        >
                            <IconArrowLeft
                                size={ 22 }
                                aria-hidden
                            />
                        </ActionIcon>
                    </div>
                    <div className={ classes.screenBody }>
                        <div className={ classes.heading }>
                            <Title
                                order={ 1 }
                                className={ classes.title }
                            >
                                { TITLE }
                            </Title>
                            <Text c="dimmed">Find people by the email they signed up with.</Text>
                        </div>
                        <AddContactForm
                            isDesktop={ false }
                            actionsClassName={ classes.bottom }
                            onCancel={ onClose }
                            onOpened={ onOpened }
                        />
                    </div>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};

export default AddContactModal;
