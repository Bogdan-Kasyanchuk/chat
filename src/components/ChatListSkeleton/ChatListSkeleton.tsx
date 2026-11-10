import type { FC } from 'react';

import classes from './ChatListSkeleton.module.css';

type ChatListSkeletonProps = {
    label?: string
};

// Ширини смуг з артборду Loading
const ROWS = [
    [ '60%', '85%' ], [ '45%', '70%' ], [ '55%', '90%' ], [ '40%', '65%' ],
    [ '65%', '80%' ], [ '50%', '75%' ], [ '58%', '88%' ], [ '42%', '60%' ]
] as const;

// Вісім рядків-заглушок замість списку, поки запит не відповів
const ChatListSkeleton: FC<ChatListSkeletonProps> = ({ label = 'Loading chats' }) => (
    <div
        className={ classes.root }
        aria-busy="true"
        aria-label={ label }
        role="status"
    >
        { ROWS.map(([ name, preview ]) => (
            <div
                key={ `${ name }-${ preview }` }
                className={ classes.row }
                data-row
            >
                <span className={ classes.avatar } />
                <span className={ classes.lines }>
                    <span
                        className={ classes.name }
                        style={ { width: name } }
                    />
                    <span
                        className={ classes.preview }
                        style={ { width: preview } }
                    />
                </span>
            </div>
        )) }
    </div>
);

export default ChatListSkeleton;
