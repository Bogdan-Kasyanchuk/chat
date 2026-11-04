// Дані емодзі віддаємо зі свого сайту, а не з cdn.jsdelivr.net (типовий шлях frimousse)
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const source = join(import.meta.dirname, '../node_modules/emojibase-data/en');
const target = join(import.meta.dirname, '../public/emojibase/en');

mkdirSync(target, { recursive: true });

for (const file of [ 'data.json', 'messages.json' ]) {
    copyFileSync(join(source, file), join(target, file));
}
