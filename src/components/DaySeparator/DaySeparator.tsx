import { Text } from '@mantine/core';
import type { FC } from 'react';

import classes from './DaySeparator.module.css';

type DaySeparatorProps = {
    label: string
};

const DaySeparator: FC<DaySeparatorProps> = ({ label }) => (
    <div className={ classes.separator }>
        <Text
            className={ classes.label }
            size="xs"
            fw={ 500 }
        >
            { label }
        </Text>
    </div>
);

export default DaySeparator;
