import { useAuthActions } from '@convex-dev/auth/react';
import { Anchor, Button, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { hasLength, isEmail, matchesField, useForm } from '@mantine/form';
import { type FC, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import AuthCard from '@/components/AuthCard';
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
            googleLabel="Continue with Google"
            footer={
                <Text
                    ta="center"
                    size="sm"
                >
                    Have an account?
                    { ' ' }
                    <Anchor
                        component={ Link }
                        to="/login"
                        state={ { from } }
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
                <Stack gap="sm">
                    <TextInput
                        label="Name"
                        autoComplete="name"
                        { ...form.getInputProps('name') }
                    />
                    <TextInput
                        label="Email"
                        type="email"
                        autoComplete="email"
                        { ...form.getInputProps('email') }
                    />
                    <PasswordInput
                        label="Password"
                        autoComplete="new-password"
                        { ...form.getInputProps('password') }
                    />
                    <PasswordInput
                        label="Confirm password"
                        autoComplete="new-password"
                        { ...form.getInputProps('confirmPassword') }
                    />
                    { formError && (
                        <Text
                            c="red"
                            size="sm"
                            role="alert"
                        >
                            { formError }
                        </Text>
                    ) }
                    <Button
                        type="submit"
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
