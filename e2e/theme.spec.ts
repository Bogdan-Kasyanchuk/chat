import { type Locator, expect, test } from '@playwright/test';

import { addContact, isPhone, newUserPage, signUp } from './helpers';

// Стани полів і чекбоксів з артборду Components живуть у global.css, тож jsdom їх не бачить — перевіряємо в браузері
const ACCENT = 'rgb(11, 122, 117)';
const MUTED = 'rgb(90, 107, 104)';
const DANGER = 'rgb(194, 55, 44)';
const DANGER_RING = 'rgba(194, 55, 44, 0.18)';

const style = (locator: Locator, property: string) => locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property);

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
});

test('the password field gets the focus ring and keeps the accent border under the cursor', async ({ page }) => {
    test.skip(isPhone(), 'hover is a desktop state');
    await page.goto('/login');

    const field = page.locator('.mantine-PasswordInput-root .mantine-Input-input');

    await page.getByLabel('Password', { exact: true }).focus();
    await field.hover();

    await expect.poll(async () => style(field, 'box-shadow')).toContain('3px');
    await expect.poll(async () => style(field, 'border-top-color')).toBe(ACCENT);
});

test('an unchecked checkbox is a 2px muted ring', async ({ page, browser }) => {
    test.skip(isPhone(), 'same CSS on both projects');
    const other = await newUserPage(browser);
    const otherEmail = await signUp(other, 'Marko');

    await signUp(page, 'Olena');
    await addContact(page, otherEmail);
    await page.getByRole('button', { name: 'Chat settings' }).click();
    await page.getByRole('menuitem', { name: 'Clear history' }).click();

    const checkbox = page.getByRole('checkbox');

    await expect(checkbox).not.toBeChecked();
    expect(await style(checkbox, 'border-top-width')).toBe('2px');
    expect(await style(checkbox, 'border-top-color')).toBe(MUTED);
});

// Поле з помилкою у фокусі — червоні рамка й м'яке кільце (dangerRing), а не акцентні
test('a field with an error keeps the danger border and gets the danger ring in focus', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign in' }).click();

    const email = page.getByLabel('Email');
    const password = page.locator('.mantine-PasswordInput-root .mantine-Input-input');

    await expect(email).toHaveAttribute('aria-invalid', 'true');

    for (const [ field, focus ] of [ [ email, email ], [ password, page.getByLabel('Password', { exact: true }) ] ] as const) {
        await focus.focus();
        await expect.poll(async () => style(field, 'box-shadow')).toContain(DANGER_RING);
        await expect.poll(async () => style(field, 'border-top-color')).toBe(DANGER);
    }
});

// Між md (768) і ~1040px вітрина й форма звужуються поруч: вітрина не заходить під форму й нічого не прокручується вбік
for (const path of [ '/login', '/signup' ]) {
    test(`on a narrow desktop the showcase of ${ path } stays beside the form`, async ({ page }) => {
        test.skip(isPhone(), 'the phone has no showcase');
        await page.setViewportSize({ width: 800, height: 900 });
        await page.goto(path);

        const showcase = await page.locator('section[aria-hidden="true"]').boundingBox();
        const form = await page.getByRole('main').boundingBox();

        expect(showcase).not.toBeNull();
        expect(form).not.toBeNull();
        expect(showcase!.x + showcase!.width).toBeLessThanOrEqual(form!.x + 1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(800);
    });
}
