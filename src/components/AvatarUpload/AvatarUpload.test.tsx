import { rem } from '@mantine/core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FunctionReference, getFunctionName } from 'convex/server';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import AvatarUpload from './AvatarUpload';

const generateUrl = vi.fn();
const setAvatar = vi.fn();
const fetchMock = vi.fn();

vi.mock('convex/react', () => ({
    useMutation: () => generateUrl,
    useAction: (ref: FunctionReference<'action'>) => getFunctionName(ref) === 'users:setAvatar' ? setAvatar : vi.fn()
}));

beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
    vi.unstubAllGlobals();
    generateUrl.mockReset();
    setAvatar.mockReset();
    fetchMock.mockReset();
});

const pick = async (file: File) => {
    const { container } = renderWithProviders(
        <AvatarUpload
            userId="k17me"
            name="Alice"
            avatar={ null }
        />
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');

    await userEvent.setup().upload(input as HTMLInputElement, file);
};

test('AvatarUpload rejects a 6 MB file without uploading', async () => {
    const file = new File([ new Uint8Array(6 * 1024 * 1024) ], 'big.png', { type: 'image/png' });

    await pick(file);

    expect(await screen.findByText('Image must be 5 MB or smaller')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(generateUrl).not.toHaveBeenCalled();
});

test('AvatarUpload uploads and saves the storage id', async () => {
    generateUrl.mockResolvedValue('https://upload.test/u');
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ storageId: 's1' }) });
    setAvatar.mockResolvedValue(null);

    await pick(new File([ 'x' ], 'a.png', { type: 'image/png' }));

    await waitFor(() => {
        expect(setAvatar).toHaveBeenCalledWith({ storageId: 's1' });
    });
    expect(fetchMock).toHaveBeenCalledWith('https://upload.test/u', expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'image/png' } }));
});

test('AvatarUpload removes the photo', async () => {
    setAvatar.mockResolvedValue(null);

    renderWithProviders(
        <AvatarUpload
            userId="k17me"
            name="Alice"
            avatar="https://img.test/a.png"
        />
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Remove photo' }));

    await waitFor(() => {
        expect(setAvatar).toHaveBeenCalledWith({ storageId: null });
    });
});

test('AvatarUpload lets the same file be picked twice', async () => {
    generateUrl.mockResolvedValue('https://upload.test/u');
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ storageId: 's1' }) });
    setAvatar.mockResolvedValue(null);

    const file = new File([ 'x' ], 'a.png', { type: 'image/png' });
    const { container } = renderWithProviders(
        <AvatarUpload
            userId="k17me"
            name="Alice"
            avatar={ null }
        />
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]') as HTMLInputElement;
    const user = userEvent.setup();

    await user.upload(input, file);
    await waitFor(() => {
        expect(setAvatar).toHaveBeenCalledTimes(1);
    });
    await user.upload(input, file);
    await waitFor(() => {
        expect(setAvatar).toHaveBeenCalledTimes(2);
    });
});

// Артборд Settings → Profile: фото 104, кругла кнопка «Change photo» знизу праворуч, «Remove photo» — зверху праворуч
test('the profile photo is 104px with Change photo and Remove photo buttons', () => {
    renderWithProviders(
        <AvatarUpload
            userId="k17me"
            name="Alice"
            avatar="https://img.test/a.png"
        />
    );

    const avatar = screen.getByRole('img', { name: 'Alice' }).closest('.mantine-Avatar-root') as HTMLElement;

    expect(avatar.style.getPropertyValue('--avatar-size')).toContain('6.5rem');
    // Ініціали на фото профілю — 36, як на канвасі (за пропорцією аватара 44 вийшло б 38)
    expect((avatar.closest('[style*="--avatar-initials-fz"]') as HTMLElement).style.getPropertyValue('--avatar-initials-fz')).toBe(rem(36));
    expect(screen.getByRole('button', { name: 'Change photo' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove photo' })).toBeTruthy();
});

// Без фото прибирати нічого: кнопки «Remove photo» немає, а не вимкнена
test('without a photo there is no Remove photo button', () => {
    renderWithProviders(
        <AvatarUpload
            userId="k17me"
            name="Alice"
            avatar={ null }
        />
    );

    expect(screen.getByRole('button', { name: 'Change photo' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Remove photo' })).toBeNull();
});

// Кнопка «Remove photo» зникає разом з фото: фокус переходить на «Change photo», а не на початок сторінки
test('after removing the photo the focus moves to Change photo', async () => {
    setAvatar.mockResolvedValue(null);

    const props = { userId: 'k17me', name: 'Alice' };
    const { rerender } = renderWithProviders(
        <AvatarUpload
            { ...props }
            avatar="https://img.test/a.png"
        />
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Remove photo' }));
    await waitFor(() => {
        expect(setAvatar).toHaveBeenCalledWith({ storageId: null });
    });

    rerender(
        <AvatarUpload
            { ...props }
            avatar={ null }
        />
    );

    await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Change photo' }));
    });
});
