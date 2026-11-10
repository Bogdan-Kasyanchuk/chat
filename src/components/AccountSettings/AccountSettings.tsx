import { useAuthActions } from '@convex-dev/auth/react';
import { Button, Text, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLogout, IconTrash } from '@tabler/icons-react';
import { useMutation } from 'convex/react';
import { type FC, type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';

import ResponsiveDialog, { DialogActions } from '@/components/ResponsiveDialog';
import SettingsSection from '@/components/SettingsSection';
import useLogout from '@/hooks/useLogout';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';

import classes from './AccountSettings.module.css';

type ConfirmProps = {
    opened: boolean,
    title: string,
    text: string,
    action: ReactNode,
    busy: boolean,
    onClose: () => void
};

// Діалоги LogoutDialog і DeleteAccountDialog (на телефоні — нижні панелі): текст, «Cancel» і дія
const Confirm: FC<ConfirmProps> = ({ opened, title, text, action, busy, onClose }) => (
    <ResponsiveDialog
        opened={ opened }
        title={ title }
        busy={ busy }
        onClose={ onClose }
    >
        <Text
            size="md"
            c="var(--chat-muted)"
        >
            { text }
        </Text>
        <DialogActions
            cancel={ (
                <Button
                    variant="default"
                    disabled={ busy }
                    onClick={ onClose }
                >
                    Cancel
                </Button>
            ) }
            confirm={ action }
        />
    </ResponsiveDialog>
);

// Артборд Settings → Account: рядки «Log out» і червоний «Delete account», кожен — з підтвердженням
const AccountSettings: FC = () => {
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
        await navigate('/login', { replace: true });
    };

    return (
        <SettingsSection title="Account">
            <UnstyledButton
                className={ classes.row }
                onClick={ () => {
                    setConfirmingLogout(true);
                } }
            >
                <IconLogout
                    size={ 20 }
                    stroke={ 1.8 }
                    aria-hidden
                />
                Log out
            </UnstyledButton>
            <UnstyledButton
                className={ classes.row }
                mod={ { danger: true } }
                onClick={ () => {
                    setConfirming(true);
                } }
            >
                <IconTrash
                    size={ 20 }
                    stroke={ 1.8 }
                    aria-hidden
                />
                Delete account
            </UnstyledButton>
            <Confirm
                opened={ confirmingLogout }
                title="Log out?"
                text="You will need to sign in again to read your messages."
                busy={ loggingOut }
                action={ (
                    <Button
                        loading={ loggingOut }
                        onClick={ () => {
                            void logout();
                        } }
                    >
                        Log out
                    </Button>
                ) }
                onClose={ () => {
                    setConfirmingLogout(false);
                } }
            />
            <Confirm
                opened={ confirming }
                title="Delete account?"
                text="Your profile, contacts and chats are deleted for good. People you talked to will see “Deleted account”."
                busy={ deleting }
                action={ (
                    <Button
                        color="red"
                        loading={ deleting }
                        onClick={ () => {
                            void remove();
                        } }
                    >
                        Delete account
                    </Button>
                ) }
                onClose={ () => {
                    setConfirming(false);
                } }
            />
        </SettingsSection>
    );
};

export default AccountSettings;
