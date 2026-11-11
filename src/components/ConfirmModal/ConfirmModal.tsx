import { Button, Text } from '@mantine/core';
import type { FC, ReactNode } from 'react';

import ResponsiveDialog, { DialogActions } from '@/components/ResponsiveDialog';

import classes from './ConfirmModal.module.css';

type ConfirmModalProps = {
    opened: boolean,
    title: string,
    text: string,
    // Під текстом — наприклад, «Also delete for …»
    children?: ReactNode,
    confirmLabel: string,
    danger?: boolean,
    loading?: boolean,
    onConfirm: () => void,
    onClose: () => void
};

// Артборди DeleteDialog і MobileDelete: заголовок 28, текст 16 muted, «Cancel» і дія; на телефоні — нижня
// панель, дія над «Cancel». Фокус спершу на «Cancel», як у Log out / Delete account
const ConfirmModal: FC<ConfirmModalProps> = ({ opened, title, text, children, confirmLabel, danger = false, loading = false, onConfirm, onClose }) => (
    <ResponsiveDialog
        opened={ opened }
        title={ title }
        busy={ loading }
        onClose={ onClose }
    >
        <Text
            size="md"
            c="var(--chat-muted)"
        >
            { text }
        </Text>
        { children && <div className={ classes.extra }>{ children }</div> }
        <DialogActions
            cancel={ (
                <Button
                    variant="default"
                    disabled={ loading }
                    data-autofocus
                    onClick={ onClose }
                >
                    Cancel
                </Button>
            ) }
            confirm={ (
                <Button
                    color={ danger ? 'red' : undefined }
                    loading={ loading }
                    onClick={ onConfirm }
                >
                    { confirmLabel }
                </Button>
            ) }
        />
    </ResponsiveDialog>
);

export default ConfirmModal;
