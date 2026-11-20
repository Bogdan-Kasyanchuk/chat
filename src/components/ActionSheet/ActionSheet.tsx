import { Drawer, UnstyledButton } from '@mantine/core';
import type { FC, KeyboardEvent, ReactNode } from 'react';

import classes from './ActionSheet.module.css';

export type ActionSheetItem = {
    key: string,
    label: string,
    icon: ReactNode,
    danger?: boolean,
    // Лінія line над пунктом (MobileChatMenu: перед «Clear history»)
    dividerBefore?: boolean,
    onClick: () => void
};

type ActionSheetProps = {
    opened: boolean,
    // Називає панель для читача екрана; на канвасі заголовка немає
    title: string,
    items: ActionSheetItem[],
    // Над аркушем, на затемненні (прев'ю повідомлення в MobileActions)
    above?: ReactNode,
    // role="menu" з пунктами menuitem, як MobileChatMenu; інакше — звичайні кнопки, як MobileActions
    asMenu?: boolean,
    onClose: () => void,
    onExited?: () => void
};

// Висота за вмістом: Mantine задає --drawer-height інлайн, тож перебиваємо теж інлайн (як у ResponsiveDialog).
// Тло має аркуш з пунктами, а не вся панель: над ним може бути прев'ю на затемненні.
// Панель відкривається під пальцем, тож текст у ній не виділяється (Android виділяв слово під пальцем)
const STYLES = {
    content: {
        height: 'auto',
        maxHeight: '100dvh',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none'
    }
} as const;

// role="menu" обіцяє стрілки: ↑ / ↓ по колу, Home / End — до першого й останнього пункту
const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const menuItems = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    const current = menuItems.indexOf(document.activeElement as HTMLElement);
    const last = menuItems.length - 1;
    const next = {
        ArrowDown: current === last ? 0 : current + 1,
        ArrowUp: current <= 0 ? last : current - 1,
        Home: 0,
        End: last
    }[ event.key ];

    if (next !== undefined) {
        event.preventDefault();
        menuItems[ next ]?.focus();
    }
};

// Нижня панель дій на телефоні (Components → Bottom sheets): радіус 16 зверху, ручка, пункти 44 з іконками 22.
// Пункт спершу закриває панель, потім виконує дію
const ActionSheet: FC<ActionSheetProps> = ({ opened, title, items, above, asMenu = false, onClose, onExited }) => (
    <Drawer
        opened={ opened }
        position="bottom"
        title={ title }
        withCloseButton={ false }
        classNames={ { header: classes.header, body: classes.body } }
        styles={ STYLES }
        onClose={ onClose }
        onExitTransitionEnd={ onExited }
    >
        { above }
        <div
            className={ classes.sheet }
            role={ asMenu ? 'menu' : undefined }
            aria-label={ asMenu ? title : undefined }
            onKeyDown={ asMenu ? moveFocus : undefined }
        >
            <span
                className={ classes.handle }
                data-testid="sheet-handle"
                aria-hidden
            />
            { items.map(item => [
                item.dividerBefore && (
                    <span
                        key={ `${ item.key }-divider` }
                        className={ classes.divider }
                        role="separator"
                    />
                ),
                <UnstyledButton
                    key={ item.key }
                    className={ classes.item }
                    role={ asMenu ? 'menuitem' : undefined }
                    mod={ { danger: item.danger } }
                    onClick={ () => {
                        onClose();
                        item.onClick();
                    } }
                >
                    { item.icon }
                    { item.label }
                </UnstyledButton>
            ]) }
        </div>
    </Drawer>
);

export default ActionSheet;
