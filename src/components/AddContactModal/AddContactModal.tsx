import { Button, Card, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useConvex, useMutation } from 'convex/react';
import type { FunctionReturnType } from 'convex/server';
import { type FC, type SubmitEvent, useState } from 'react';
import { useNavigate } from 'react-router';

import PresenceAvatar from '@/components/PresenceAvatar';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';

type AddContactModalProps = {
    opened: boolean,
    onClose: () => void
};

type Found = NonNullable<FunctionReturnType<typeof api.users.findByEmail>>;

const AddContactModal: FC<AddContactModalProps> = ({ opened, onClose }) => {
    const convex = useConvex();
    const addContact = useMutation(api.contacts.add);
    const openChat = useMutation(api.chats.open);
    const navigate = useNavigate();
    const [ email, setEmail ] = useState('');
    const [ found, setFound ] = useState<Found | null>(null);
    const [ searched, setSearched ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ busy, setBusy ] = useState(false);
    const [ acting, setActing ] = useState(false);

    const reset = () => {
        setEmail('');
        setFound(null);
        setSearched(false);
        setError(null);
    };

    const close = () => {
        reset();
        onClose();
    };

    const find = async (event: SubmitEvent) => {
        event.preventDefault();
        setBusy(true);
        setError(null);
        setFound(null);
        setSearched(false);

        try {
            setFound(await convex.query(api.users.findByEmail, { email }));
            setSearched(true);
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

        try {
            const chatId = await openChat({ userId: found.userId });

            close();
            await navigate(`/chat/${ chatId }`);
        } catch (e) {
            notifications.show({ color: 'red', message: errorMessage(e) });
        } finally {
            setActing(false);
        }
    };

    return (
        <Modal
            opened={ opened }
            title="Add contact"
            centered
            onClose={ close }
        >
            <form
                onSubmit={ e => {
                    void find(e);
                } }
            >
                <Stack>
                    <TextInput
                        label="Email"
                        type="email"
                        placeholder="name@example.com"
                        value={ email }
                        error={ error }
                        onChange={ e => {
                            setEmail(e.currentTarget.value);
                        } }
                    />
                    <Button
                        type="submit"
                        loading={ busy }
                        disabled={ email.trim() === '' }
                    >
                        Find
                    </Button>
                </Stack>
            </form>
            { searched && !found && (
                <Text
                    c="dimmed"
                    ta="center"
                    mt="md"
                >
                    No user with this email
                </Text>
            ) }
            { found && (
                <Card
                    mt="md"
                    withBorder
                >
                    <Group
                        wrap="nowrap"
                        mb="md"
                    >
                        <PresenceAvatar
                            name={ found.name }
                            avatar={ found.avatar }
                            size={ 48 }
                        />
                        <Text
                            fw={ 600 }
                            truncate
                        >
                            { found.name }
                        </Text>
                    </Group>
                    <Group grow>
                        <Button
                            variant="default"
                            disabled={ found.isContact || acting }
                            onClick={ () => {
                                void add();
                            } }
                        >
                            { found.isContact ? 'In contacts' : 'Add to contacts' }
                        </Button>
                        <Button
                            disabled={ acting }
                            onClick={ () => {
                                void message();
                            } }
                        >
                            Message
                        </Button>
                    </Group>
                </Card>
            ) }
        </Modal>
    );
};

export default AddContactModal;
