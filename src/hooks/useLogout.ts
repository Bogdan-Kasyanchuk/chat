import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { api } from '@convex/_generated/api';

// Вихід: позначаємо себе офлайн (не критично), закриваємо сесію, ведемо на /login
const useLogout = () => {
    const { signOut } = useAuthActions();
    const disconnect = useMutation(api.presence.disconnect);
    const navigate = useNavigate();
    const [ loading, setLoading ] = useState(false);

    const logout = async () => {
        setLoading(true);

        try {
            await disconnect().catch(() => {});
            await signOut();
            await navigate('/login', { replace: true });
        } finally {
            setLoading(false);
        }
    };

    return { logout, loading };
};

export default useLogout;
