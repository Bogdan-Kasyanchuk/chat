import { Button, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from 'convex/react';
import { type FC, type SubmitEvent, useState } from 'react';

import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';
import { NAME_REQUIRED, NAME_TOO_LONG } from '@convex/authRules';
import { MAX_NAME_LENGTH } from '@convex/chatRules';

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

const ProfileSettings: FC<ProfileSettingsProps> = ({ name }) => {
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
            notifications.show({ message: 'Profile updated' });
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
            <Stack>
                <TextInput
                    label="Name"
                    value={ value }
                    error={ error }
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
            </Stack>
        </form>
    );
};

export default ProfileSettings;
