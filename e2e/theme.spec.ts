import { type Locator, type Page, expect, test } from '@playwright/test';

import { addContact, isPhone, newUserPage, openSettings, signUp } from './helpers';

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

// Кнопка з оком слухає ще й click читача екрана (detail = 0): Enter, Space і клік мишею мусять перемикати рівно один раз
test('Enter, Space and a click on the eye button toggle the password once', async ({ page }) => {
    await page.goto('/login');

    const field = page.getByLabel('Password', { exact: true });
    const toggle = page.getByRole('button', { name: 'Show password' });

    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(field).toHaveAttribute('type', 'text');
    await page.keyboard.press('Enter');
    await expect(field).toHaveAttribute('type', 'password');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(field).toHaveAttribute('type', 'text');
});

// Від md вітрина ліворуч, знак у колонці форми схований (він у вітрині); на телефоні навпаки
test('the auth screen shows the showcase on desktop and the logo above the heading on the phone', async ({ page }) => {
    await page.goto('/login');

    const showcase = page.locator('section[aria-hidden="true"]');
    const formLogo = page.getByRole('main').getByText('Chat', { exact: true });

    if (isPhone()) {
        await expect(showcase).toBeHidden();
        await expect(formLogo).toBeVisible();
    } else {
        await expect(showcase).toBeVisible();
        await expect(formLogo).toBeHidden();
    }
});

// iPad горизонтально (1024×768): вітрина входу вища за екран, а форма все одно посередині екрана, не колонки
test('on a short desktop screen the sign-in form stays in the middle of the screen', async ({ page }) => {
    test.skip(isPhone(), 'the phone has no showcase');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/login');

    const column = await page.getByRole('main').locator('> div').boundingBox();

    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(768);
    expect(column).not.toBeNull();
    expect(Math.abs(column!.y + column!.height / 2 - 384)).toBeLessThanOrEqual(1);
});

// Review Focus 4: System іде за темою ОС одразу, ручний вибір переживає перезавантаження; смуга браузера — за темою застосунку
test.describe('colour scheme', () => {
    // Тло сторінки — --chat-bg (тло розмови)
    const LIGHT_BG = 'rgb(230, 238, 235)';
    const DARK_BG = 'rgb(14, 20, 21)';

    const bodyBackground = (page: Page) => style(page.locator('body'), 'background-color');
    const barColors = (page: Page) => page.locator('meta[name="theme-color"]').evaluateAll(metas => metas.map(meta => meta.getAttribute('content')));

    test('a dark system gives the dark background and a dark browser bar', async ({ page }) => {
        test.skip(isPhone(), 'same scheme logic on both projects');
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto('/login');

        await expect.poll(async () => bodyBackground(page)).toBe(DARK_BG);
        await expect.poll(async () => barColors(page)).toEqual([ '#151C1D', '#151C1D' ]);
    });

    test('System follows the OS while the app is open, a manual Light survives a reload', async ({ page }) => {
        test.skip(isPhone(), 'same scheme logic on both projects');
        await signUp(page, 'Theme');

        const settings = await openSettings(page);
        const theme = settings.getByRole('radiogroup', { name: 'Theme' });

        await expect(theme.getByRole('radio', { name: 'System' })).toBeChecked();

        await page.emulateMedia({ colorScheme: 'dark' });
        await expect.poll(async () => bodyBackground(page)).toBe(DARK_BG);
        await expect.poll(async () => barColors(page)).toEqual([ '#151C1D', '#151C1D' ]);

        await theme.getByText('Light', { exact: true }).click();
        await expect.poll(async () => bodyBackground(page)).toBe(LIGHT_BG);

        await page.reload();
        await expect(page.getByRole('searchbox', { name: 'Search', exact: true })).toBeVisible();
        await expect.poll(async () => bodyBackground(page)).toBe(LIGHT_BG);
        await expect.poll(async () => barColors(page)).toEqual([ '#FFFFFF', '#FFFFFF' ]);
    });
});
