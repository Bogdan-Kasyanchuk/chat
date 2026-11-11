import type { CSSProperties, FC, ReactNode } from 'react';

import classes from './ChatWallpaper.module.css';

type ChatWallpaperProps = {
    children: ReactNode,
    className?: string,
    style?: CSSProperties
};

// Тло розмови: --chat-bg і тонкий крапковий візерунок --chat-pattern (окремі для кожної теми), без зовнішніх файлів
const ChatWallpaper: FC<ChatWallpaperProps> = ({ children, className, style }) => (
    <main
        className={ className ? `${ classes.wallpaper } ${ className }` : classes.wallpaper }
        style={ style }
    >
        { children }
    </main>
);

export default ChatWallpaper;
