import { useAuthActions } from '@convex-dev/auth/react';
import { Button, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from 'convex/react';
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router';

import ConfirmModal from '@/components/ConfirmModal';
import useLogout from '@/hooks/useLogout';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';

type AccountSettingsProps = {
    onDeleted: () => void
};

const AccountSettings: FC<AccountSettingsProps> = ({ onDeleted }) => {
    const { signOut } = useAuthActions();
    const deleteAccount = useMutation(api.users.deleteAccount);
    const navigate = useNavigate();
    const { logout, loading: loggingOut } = useLogout();
    const [ confirmingLogout, setConfirmingLogout ] = useState(false);
    const [ confirming, setConfirming ] = useState(false);
    const [ deleting, setDeleting ] = useState(false);

    const remove = async () => {
        setDeleting(true);

        try {
            await deleteAccount();
        } catch (e) {
            notifications.show({ color: 'red', message: errorMessage(e) });
            setDeleting(false);

            return;
        }

        // Сесії вже немає: помилку виходу ігноруємо. Виходимо одразу, щоб живі запити не сипали NOT_SIGNED_IN
        await signOut().catch(() => {});
        onDeleted();
        await navigate('/login', { replace: true });
    };

    return (
        <Stack>
            <Button
                variant="default"
                onClick={ () => {
                    setConfirmingLogout(true);
                } }
            >
                Log out
            </Button>
            <Button
                color="red"
                variant="light"
                onClick={ () => {
                    setConfirming(true);
                } }
            >
                Delete account
            </Button>
            <ConfirmModal
                opened={ confirmingLogout }
                title="Log out?"
                confirmLabel="Log out"
                loading={ loggingOut }
                onConfirm={ () => {
                    void logout();
                } }
                onClose={ () => {
                    setConfirmingLogout(false);
                } }
            >
                You will need to sign in again to read your messages.
            </ConfirmModal>
            <ConfirmModal
                opened={ confirming }
                title="Delete account?"
                confirmLabel="Delete account"
                loading={ deleting }
                danger
                onConfirm={ () => {
                    void remove();
                } }
                onClose={ () => {
                    setConfirming(false);
                } }
            >
                Your profile, contacts and chats will be deleted. Your messages stay visible to other people as Deleted account. This cannot be undone.
            </ConfirmModal>
        </Stack>
    );
};

export default AccountSettings;
