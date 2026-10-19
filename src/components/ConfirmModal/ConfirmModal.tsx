import { Button, Group, Modal } from '@mantine/core';
import type { FC, ReactNode } from 'react';

type ConfirmModalProps = {
    opened: boolean,
    title: string,
    children: ReactNode,
    confirmLabel: string,
    danger?: boolean,
    loading?: boolean,
    onConfirm: () => void,
    onClose: () => void
};

const ConfirmModal: FC<ConfirmModalProps> = ({ opened, title, children, confirmLabel, danger = false, loading = false, onConfirm, onClose }) => (
    <Modal
        opened={ opened }
        title={ title }
        centered
        onClose={ onClose }
    >
        { children }
        <Group
            justify="flex-end"
            mt="lg"
        >
            <Button
                variant="default"
                onClick={ onClose }
            >
                Cancel
            </Button>
            <Button
                color={ danger ? 'red' : undefined }
                loading={ loading }
                onClick={ onConfirm }
            >
                { confirmLabel }
            </Button>
        </Group>
    </Modal>
);

export default ConfirmModal;
