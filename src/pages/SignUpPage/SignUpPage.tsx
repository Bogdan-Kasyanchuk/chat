import { useAuthActions } from '@convex-dev/auth/react';
import { Anchor, Button, Stack, Text, TextInput } from '@mantine/core';
import { hasLength, isEmail, matchesField, useForm } from '@mantine/form';
import { type FC, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import AuthCard from '@/components/AuthCard';
import PasswordField from '@/components/PasswordField';
import useFrom from '@/hooks/useFrom';
import authError from '@/lib/authError';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, NAME_REQUIRED, NAME_TOO_LONG, normalizeEmail } from '@convex/authRules';
import { MAX_NAME_LENGTH } from '@convex/chatRules';

const validateName = (value: string) => {
    const name = value.trim();

    if (name === '') {
        return NAME_REQUIRED;
    }

    return name.length > MAX_NAME_LENGTH ? NAME_TOO_LONG : null;
};

const SignUpPage: FC = () => {
    const { signIn } = useAuthActions();
    const navigate = useNavigate();
    const from = useFrom();
    const [ formError, setFormError ] = useState<string | null>(null);
    const [ submitting, setSubmitting ] = useState(false);
    const form = useForm({
        initialValues: { name: '', email: '', password: '', confirmPassword: '' },
        validate: {
            name: validateName,
            email: (value: string) => isEmail('Enter a valid email')(value.trim()),
            password: (value: string) => hasLength({ min: MIN_PASSWORD_LENGTH }, `Password must be at least ${ MIN_PASSWORD_LENGTH } characters`)(value)
                ?? hasLength({ max: MAX_PASSWORD_LENGTH }, `Password must be at most ${ MAX_PASSWORD_LENGTH } characters`)(value),
            confirmPassword: matchesField('password', 'Passwords do not match')
        }
    });

    const submit = form.onSubmit(async ({ name, email, password }) => {
        setFormError(null);
        setSubmitting(true);

        try {
            await signIn('password', { name: name.trim(), email: normalizeEmail(email), password, flow: 'signUp' });
            await navigate(from, { replace: true });
        } catch (error) {
            setFormError(authError(error, 'signUp'));
        } finally {
            setSubmitting(false);
        }
    });

    return (
        <AuthCard
            title="Create account"
            subtitle="It takes less than a minute."
            googleLabel="Continue with Google"
            showcase="contacts"
            footer={
                <Text
                    ta="center"
                    c="dimmed"
                >
                    Have an account?
                    { ' ' }
                    <Anchor
                        component={ Link }
                        to="/login"
                        state={ { from } }
                        fw={ 600 }
                    >
                        Sign in
                    </Anchor>
                </Text>
            }
        >
            <form
                noValidate
                onSubmit={ submit }
            >
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        placeholder="How contacts will see you"
                        autoComplete="name"
                        size="lg"
                        { ...form.getInputProps('name') }
                    />
                    <TextInput
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        size="lg"
                        { ...form.getInputProps('email') }
                    />
                    { /* Підказка під полем, як на канвасі (у Mantine вона над полем) */ }
                    <PasswordField
                        label="Password"
                        description={ `At least ${ MIN_PASSWORD_LENGTH } characters` }
                        inputWrapperOrder={ [ 'label', 'input', 'description', 'error' ] }
                        autoComplete="new-password"
                        size="lg"
                        { ...form.getInputProps('password') }
                    />
                    <PasswordField
                        label="Confirm password"
                        autoComplete="new-password"
                        size="lg"
                        { ...form.getInputProps('confirmPassword') }
                    />
                    { formError && (
                        <Text
                            c="red"
                            size="xs"
                            role="alert"
                        >
                            { formError }
                        </Text>
                    ) }
                    <Button
                        type="submit"
                        size="lg"
                        loading={ submitting }
                    >
                        Create account
                    </Button>
                </Stack>
            </form>
        </AuthCard>
    );
};

export default SignUpPage;
