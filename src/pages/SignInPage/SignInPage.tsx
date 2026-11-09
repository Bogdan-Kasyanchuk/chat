import { useAuthActions } from '@convex-dev/auth/react';
import { Anchor, Button, Stack, Text, TextInput } from '@mantine/core';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { type FC, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import AuthCard from '@/components/AuthCard';
import PasswordField from '@/components/PasswordField';
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
        },
        // Помилка сервера стосується введеного: щойно людина щось змінює, вона зникає
        onValuesChange: () => {
            setFormError(null);
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

    const passwordProps = form.getInputProps('password');

    return (
        <AuthCard
            title="Sign in"
            subtitle="Welcome back. Pick up where you left off."
            googleLabel="Continue with Google"
            showcase="messages"
            footer={
                <Text
                    ta="center"
                    c="dimmed"
                >
                    No account?
                    { ' ' }
                    <Anchor
                        component={ Link }
                        to="/signup"
                        state={ { from } }
                        fw={ 600 }
                    >
                        Create account
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
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        size="lg"
                        { ...form.getInputProps('email') }
                    />
                    { /* На канвасі помилка входу стоїть під полем пароля, і поле підсвічене червоним */ }
                    <PasswordField
                        label="Password"
                        autoComplete="current-password"
                        size="lg"
                        { ...passwordProps }
                        error={ passwordProps.error ?? formError }
                        errorProps={ formError ? { role: 'alert' } : undefined }
                    />
                    <Button
                        type="submit"
                        size="lg"
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
