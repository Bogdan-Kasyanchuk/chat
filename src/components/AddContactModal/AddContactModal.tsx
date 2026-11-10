import { ActionIcon, Button, CloseButton, Input, Modal, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useConvex, useMutation } from 'convex/react';
import type { FunctionReturnType } from 'convex/server';
import { type FC, type SubmitEvent, useId, useState } from 'react';

import PresenceAvatar from '@/components/PresenceAvatar';
import useIsDesktop from '@/hooks/useIsDesktop';
import useOpenChatWith from '@/hooks/useOpenChatWith';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';

import classes from './AddContactModal.module.css';

type AddContactModalProps = {
    opened: boolean,
    onClose: () => void
};

type Found = NonNullable<FunctionReturnType<typeof api.users.findByEmail>>;

const TITLE = 'Add contact';
const HINT = 'Enter the exact email the person signed up with.';
const NOT_FOUND = 'No one has signed up with this email. Check the spelling.';

// Артборди AddContact, AddContactNotFound, AddContactExists (діалог 420 на десктопі) і MobileAddContact
// (екран на телефоні: «назад», заголовок 32, кнопки внизу)
const AddContactModal: FC<AddContactModalProps> = ({ opened, onClose }) => {
    const convex = useConvex();
    const addContact = useMutation(api.contacts.add);
    const openChatWith = useOpenChatWith();
    const isDesktop = useIsDesktop();
    const id = useId();
    const [ email, setEmail ] = useState('');
    // Пошта, за якою знайдено людину: показується в картці
    const [ foundEmail, setFoundEmail ] = useState('');
    const [ found, setFound ] = useState<Found | null>(null);
    const [ missing, setMissing ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ busy, setBusy ] = useState(false);
    const [ acting, setActing ] = useState(false);

    const clearResult = () => {
        setFound(null);
        setMissing(false);
        setError(null);
    };

    const close = () => {
        setEmail('');
        clearResult();
        onClose();
    };

    const find = async (event: SubmitEvent) => {
        event.preventDefault();
        setBusy(true);
        clearResult();

        try {
            const user = await convex.query(api.users.findByEmail, { email });

            setFound(user);
            setMissing(user === null);
            setFoundEmail(email.trim());
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setBusy(false);
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

        if (await openChatWith(found.userId)) {
            close();
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
            onClick={ close }
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

    if (isDesktop) {
        return (
            <Modal.Root
                opened={ opened }
                centered
                onClose={ close }
            >
                <Modal.Overlay />
                <Modal.Content>
                    <Modal.Header>
                        <Modal.Title>{ TITLE }</Modal.Title>
                        <CloseButton
                            aria-label="Close"
                            className={ classes.close }
                            onClick={ close }
                        />
                    </Modal.Header>
                    <Modal.Body className={ classes.body }>
                        { form }
                        { card }
                        { renderActions() }
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        );
    }

    return (
        <Modal.Root
            opened={ opened }
            fullScreen
            onClose={ close }
        >
            <Modal.Content
                aria-label={ TITLE }
                data-full-screen
            >
                <Modal.Body className={ classes.screen }>
                    <div className={ classes.back }>
                        <ActionIcon
                            variant="subtle"
                            aria-label="Back to contacts"
                            className={ classes.backButton }
                            onClick={ close }
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
                        { form }
                        { card }
                        <div className={ classes.bottom }>{ renderActions() }</div>
                    </div>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};

export default AddContactModal;
