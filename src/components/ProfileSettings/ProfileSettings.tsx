import { Button, Input } from '@mantine/core';
import { useMutation } from 'convex/react';
import { type FC, type SubmitEvent, useId, useState } from 'react';

import errorMessage from '@/lib/errorMessage';
import { showSuccess } from '@/lib/toast';
import { api } from '@convex/_generated/api';
import { NAME_REQUIRED, NAME_TOO_LONG } from '@convex/authRules';
import { MAX_NAME_LENGTH } from '@convex/chatRules';

import classes from './ProfileSettings.module.css';

type ProfileSettingsProps = {
    name: string
};

// Ті самі правила, що на сервері (validateName): обрізати пробіли, 1..MAX_NAME_LENGTH
const validate = (value: string): string | null => {
    const trimmed = value.trim();

    if (trimmed === '') {
        return NAME_REQUIRED;
    }

    return trimmed.length > MAX_NAME_LENGTH ? NAME_TOO_LONG : null;
};

// Артборд Settings: поле Name з кнопкою Save у тому ж рядку
const ProfileSettings: FC<ProfileSettingsProps> = ({ name }) => {
    const id = useId();
    const updateName = useMutation(api.users.updateName);
    const [ value, setValue ] = useState(name);
    const [ error, setError ] = useState<string | null>(null);
    const [ saving, setSaving ] = useState(false);

    const save = async (event: SubmitEvent) => {
        event.preventDefault();

        const invalid = validate(value);

        setError(invalid);

        if (invalid) {
            return;
        }

        setSaving(true);

        try {
            await updateName({ name: value.trim() });
            showSuccess('Profile updated');
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={ e => {
                void save(e);
            } }
        >
            <Input.Wrapper
                id={ id }
                label="Name"
                error={ error }
            >
                <div className={ classes.field }>
                    <Input
                        id={ id }
                        className={ classes.input }
                        value={ value }
                        error={ Boolean(error) }
                        aria-describedby={ error ? `${ id }-error` : undefined }
                        onChange={ e => {
                            setValue(e.currentTarget.value);
                            setError(null);
                        } }
                    />
                    <Button
                        type="submit"
                        loading={ saving }
                    >
                        Save
                    </Button>
                </div>
            </Input.Wrapper>
        </form>
    );
};

export default ProfileSettings;
