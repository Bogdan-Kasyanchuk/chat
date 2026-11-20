import type { FC } from 'react';

import classes from './Logo.module.css';

// Знак з канвасу (Main, SignUp, MobileSignIn, MobileSignUp): дві бульбашки на акцентному квадраті й слово «Chat»
const Logo: FC = () => (
    <div className={ classes.root }>
        <svg
            className={ classes.mark }
            width="36"
            height="36"
            viewBox="0 0 40 40"
            aria-hidden="true"
        >
            <rect
                className={ classes.tile }
                width="40"
                height="40"
                rx="12"
            />
            <path
                className={ classes.bubble }
                d="M11 13.5h13a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-7l-4.5 3.5v-3.5H11a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3z"
            />
            <path
                className={ classes.reply }
                d="M29.5 17.5h.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-.5v2.5l-3.2-2.5"
                fill="none"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
        <span className={ classes.name }>Chat</span>
    </div>
);

export default Logo;
