import type { FC } from 'react';

import classes from './EmptyChat.module.css';

// Чат не відкрито (десктоп): плашка кольору chip посередині тла розмови, як плашка дати
const EmptyChat: FC = () => (
    <div className={ classes.root }>
        <p className={ classes.chip }>Select a chat to start messaging</p>
    </div>
);

export default EmptyChat;
