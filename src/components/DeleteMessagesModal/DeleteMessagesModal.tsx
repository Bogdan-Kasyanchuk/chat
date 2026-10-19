import { Checkbox, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from 'convex/react';
import { type FC, useState } from 'react';

import ConfirmModal from '@/components/ConfirmModal';
import errorMessage from '@/lib/errorMessage';
import type { MessageView } from '@/types/chat';
import { api } from '@convex/_generated/api';

type DeleteMessagesModalProps = {
    messages: MessageView[],
    // null — акаунт співрозмовника видалено
    partnerName: string | null,
    // true — повідомлення видалено, false — людина передумала
    onDone: (deleted: boolean) => void
};

const DeleteMessagesModal: FC<DeleteMessagesModalProps> = ({ messages, partnerName, onDone }) => {
    const remove = useMutation(api.messages.remove);
    const [ forEveryone, setForEveryone ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    // Для обох — лише власні повідомлення й лише коли є кому їх ще бачити
    const canDeleteForEveryone = partnerName !== null && messages.every(message => message.authorIsMe);
    const single = messages.length === 1;

    const confirm = async () => {
        setLoading(true);

        try {
            await remove({
                messageIds: messages.map(message => message.id),
                forEveryone: canDeleteForEveryone && forEveryone
            });
            onDone(true);
        } catch (error) {
            notifications.show({ color: 'red', message: errorMessage(error) });
            setLoading(false);
        }
    };

    return (
        <ConfirmModal
            title={ single ? 'Delete message?' : `Delete ${ messages.length } messages?` }
            confirmLabel="Delete"
            loading={ loading }
            opened
            danger
            onConfirm={ () => {
                void confirm();
            } }
            onClose={ () => {
                onDone(false);
            } }
        >
            <Stack>
                <Text size="sm">
                    { single ? 'This message will be deleted.' : 'These messages will be deleted.' } You can&apos;t undo this.
                </Text>
                { canDeleteForEveryone && (
                    <Checkbox
                        label={ `Also delete for ${ partnerName }` }
                        checked={ forEveryone }
                        onChange={ event => {
                            setForEveryone(event.currentTarget.checked);
                        } }
                    />
                ) }
            </Stack>
        </ConfirmModal>
    );
};

export default DeleteMessagesModal;
