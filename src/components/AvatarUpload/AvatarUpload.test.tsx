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
            name="Alice"
            avatar="https://img.test/a.png"
        />
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Remove photo' }));

    await waitFor(() => {
        expect(setAvatar).toHaveBeenCalledWith({ storageId: null });
    });
});
