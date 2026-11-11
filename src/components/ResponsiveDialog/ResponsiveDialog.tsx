import { Drawer, Modal } from '@mantine/core';
import type { FC, ReactNode } from 'react';

import useIsDesktop from '@/hooks/useIsDesktop';

import classes from './ResponsiveDialog.module.css';

type ResponsiveDialogProps = {
    opened: boolean,
    title: ReactNode,
    children: ReactNode,
    // Дія виконується: діалог не закривається ні хрестиком, ні Escape, ні кліком повз
    busy?: boolean,
    // Хрестик і в нижній панелі (MobileForward); підтвердження обходяться без нього
    sheetCloseButton?: boolean,
    onClose: () => void
};

// Висота нижньої панелі — за вмістом. Mantine задає її змінною --drawer-height інлайн (size="auto" дає
// неіснуючу --drawer-size-auto, тобто весь екран), тож перебиваємо теж інлайн
const SHEET_STYLES = { content: { height: 'auto', maxHeight: 'calc(100dvh - 2.5rem)' } };

// Артборди LogoutDialog і DeleteAccountDialog: діалог 420 посередині на десктопі;
// MobileDelete: нижня панель з ручкою на телефоні
const ResponsiveDialog: FC<ResponsiveDialogProps> = ({ opened, title, children, busy = false, sheetCloseButton = false, onClose }) => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return (
            <Modal
                opened={ opened }
                title={ title }
                closeOnClickOutside={ !busy }
                closeOnEscape={ !busy }
                withCloseButton={ !busy }
                classNames={ { header: classes.header } }
                centered
                onClose={ onClose }
            >
                { children }
            </Modal>
        );
    }

    return (
        <Drawer
            opened={ opened }
            title={ title }
            position="bottom"
            withCloseButton={ sheetCloseButton && !busy }
            closeOnClickOutside={ !busy }
            closeOnEscape={ !busy }
            classNames={ { content: classes.sheet, header: classes.sheetHeader, body: classes.sheetBody } }
            styles={ SHEET_STYLES }
            onClose={ onClose }
        >
            <span
                className={ classes.handle }
                data-testid="sheet-handle"
                aria-hidden
            />
            { children }
        </Drawer>
    );
};

type DialogActionsProps = {
    cancel: ReactNode,
    confirm: ReactNode
};

// Кнопки діалогу: на десктопі в ряд «Cancel», потім дія; на телефоні стовпчиком, дія перша
export const DialogActions: FC<DialogActionsProps> = ({ cancel, confirm }) => {
    const isDesktop = useIsDesktop();

    return (
        <div className={ classes.actions }>
            { isDesktop ? cancel : confirm }
            { isDesktop ? confirm : cancel }
        </div>
    );
};

export default ResponsiveDialog;
