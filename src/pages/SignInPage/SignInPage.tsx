import { useAuthActions } from '@convex-dev/auth/react';
import { Anchor, Button, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { type FC, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import AuthCard from '@/components/AuthCard';
import useFrom from '@/hooks/useFrom';
import authError from '@/lib/authError';
import { normalizeEmail } from '@convex/authRules';

const SignInPage: FC = () => {
    const { signIn } = useAuthActions();
    const navigate = useNavigate();
    const from = useFrom();
    const [ formError, setFormError ] = useState<string | null>(null);
    const [ submitting, setSubmitting ] = useState(false);
    const form = useForm({
        initialValues: { email: '', password: '' },
        validate: {
            email: (value: string) => isEmail('Enter a valid email')(value.trim()),
            password: isNotEmpty('Enter your password')
        }
    });

    const submit = form.onSubmit(async ({ email, password }) => {
        setFormError(null);
        setSubmitting(true);

        try {
            await signIn('password', { email: normalizeEmail(email), password, flow: 'signIn' });
            await navigate(from, { replace: true });
        } catch (error) {
            setFormError(authError(error, 'signIn'));
        } finally {
            setSubmitting(false);
        }
    });

    return (
        <AuthCard
            title="Sign in"
            googleLabel="Continue with Google"
            footer={
                <Text
                    ta="center"
                    size="sm"
                >
                    No account?
                    { ' ' }
                    <Anchor
                        component={ Link }
                        to="/signup"
                        state={ { from } }
                    >
                        Sign up
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
                        label="Email"
                        type="email"
                        autoComplete="email"
                        { ...form.getInputProps('email') }
                    />
                    <PasswordInput
                        label="Password"
                        autoComplete="current-password"
                        { ...form.getInputProps('password') }
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
                        Sign in
                    </Button>
                </Stack>
            </form>
        </AuthCard>
    );
};

export default SignInPage;
