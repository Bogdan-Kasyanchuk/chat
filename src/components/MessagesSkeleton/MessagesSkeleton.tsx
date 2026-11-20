import type { FC } from 'react';

import classes from './MessagesSkeleton.module.css';

type MessagesSkeletonProps = {
    // Поки не відповів сам чат: ще шапка й композер блоками (артборд Loading)
    full?: boolean
};

// Сторона й ширина бульбашок — з артборду Loading
const BUBBLES = [
    [ 'in', '42%' ], [ 'in', '28%' ], [ 'out', '36%' ], [ 'out', '22%' ], [ 'in', '48%' ], [ 'out', '30%' ]
] as const;

const Bubbles: FC = () => (
    <div className={ classes.feed }>
        { BUBBLES.map(([ side, width ]) => (
            <span
                key={ `${ side }-${ width }` }
                className={ classes.bubble }
                data-side={ side }
                style={ { width } }
                data-bubble
            />
        )) }
    </div>
);

// Заглушка стрічки, поки не прийшла перша сторінка повідомлень
const MessagesSkeleton: FC<MessagesSkeletonProps> = ({ full = false }) => (
    <div
        className={ classes.root }
        aria-busy="true"
        aria-label={ full ? 'Loading chat' : 'Loading messages' }
        role="status"
    >
        { full && (
            <div
                className={ classes.header }
                data-header
            >
                <span className={ classes.avatar } />
                <span className={ classes.lines }>
                    <span className={ classes.name } />
                    <span className={ classes.status } />
                </span>
            </div>
        ) }
        <Bubbles />
        { full && (
            <div
                className={ classes.composer }
                data-composer
            >
                <span />
            </div>
        ) }
    </div>
);

export default MessagesSkeleton;
