import type { FC } from 'react';

import classes from './DaySeparator.module.css';

type DaySeparatorProps = {
    label: string
};

const DaySeparator: FC<DaySeparatorProps> = ({ label }) => (
    <div className={ classes.separator }>
        <span className={ classes.label }>{ label }</span>
    </div>
);

export default DaySeparator;
