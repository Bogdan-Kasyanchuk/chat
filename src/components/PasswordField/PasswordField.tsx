import { PasswordInput, type PasswordInputProps } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import type { FC } from 'react';

import classes from './PasswordField.module.css';

// Поле пароля з канвасу: кнопка з оком 44×44 праворуч у полі — справжня кнопка з підписом «Show / Hide password»,
// до якої можна дійти Tab-ом (у Mantine вона за замовчуванням поза порядком фокусу й з одним підписом на обидва стани)
const PasswordField: FC<Omit<PasswordInputProps, 'visible' | 'onVisibilityChange' | 'visibilityToggleIcon'>> = props => {
    const [ visible, { toggle } ] = useDisclosure(false);

    return (
        <PasswordInput
            { ...props }
            // Mantine не передає стан помилки внутрішньому <input> (withAria: false), тож ставимо його самі
            aria-invalid={ props.error ? true : undefined }
            classNames={ { visibilityToggle: classes.toggle } }
            visible={ visible }
            visibilityToggleIcon={
                ({ reveal }) => reveal
                    ? <IconEyeOff
                        size={ 20 }
                        stroke={ 1.8 }
                    />
                    : <IconEye
                        size={ 20 }
                        stroke={ 1.8 }
                    />
            }
            visibilityToggleButtonProps={ { 'aria-label': visible ? 'Hide password' : 'Show password' } }
            visibilityToggleFocusable
            onVisibilityChange={ toggle }
        />
    );
};

export default PasswordField;
