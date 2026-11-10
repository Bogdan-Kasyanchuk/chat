import { PasswordInput, type PasswordInputProps, type PasswordInputStylesNames } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import cx from 'clsx';
import type { FC, MouseEvent } from 'react';

import classes from './PasswordField.module.css';

type PasswordFieldProps = Omit<PasswordInputProps, 'visible' | 'onVisibilityChange' | 'visibilityToggleIcon' | 'classNames'> & {
    // Лише об'єкт: його класи зливаються з власними (функцію classNames злити не можна)
    classNames?: Partial<Record<PasswordInputStylesNames, string>>,
    // Підпис кнопки з оком; друге поле на формі отримує свій («Show confirm password»)
    toggleLabel?: string
};

// Поле пароля з канвасу: кнопка з оком 44×44 праворуч у полі. Це перемикач з незмінним підписом (за замовчуванням «Show password»)
// і aria-pressed; до нього можна дійти Tab-ом (у Mantine кнопка за замовчуванням поза порядком фокусу)
const PasswordField: FC<PasswordFieldProps> = ({ classNames, toggleLabel = 'Show password', ...props }) => {
    const [ visible, { toggle } ] = useDisclosure(false);

    return (
        <PasswordInput
            { ...props }
            // Mantine не передає стан помилки внутрішньому <input> (withAria: false), тож ставимо його самі
            aria-invalid={ props.error ? true : undefined }
            classNames={ { ...classNames, visibilityToggle: cx(classes.toggle, classNames?.visibilityToggle) } }
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
            visibilityToggleButtonProps={
                {
                    'aria-label': toggleLabel,
                    // Mantine перемикає на mousedown / touchend / Enter і Space; читач екрана в режимі огляду
                    // надсилає лише click з detail = 0 — його й ловимо (клік мишею має detail ≥ 1 і вже оброблений)
                    'onClick': (event: MouseEvent<HTMLButtonElement>) => {
                        if (event.detail === 0) {
                            toggle();
                        }
                    }
                }
            }
            visibilityToggleFocusable
            onVisibilityChange={ toggle }
        />
    );
};

export default PasswordField;
