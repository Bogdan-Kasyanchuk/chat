import { type FC, type ReactNode, useId } from 'react';

import classes from './SettingsSection.module.css';

type SettingsSectionProps = {
    title: string,
    // id заголовка, коли ним треба підписати ще й групу всередині (звуки)
    titleId?: string,
    children: ReactNode
};

// Розділ панелі налаштувань (артборди Settings, MobileSettings): заголовок 14 / 700 великими літерами кольору акценту
const SettingsSection: FC<SettingsSectionProps> = ({ title, titleId, children }) => {
    const ownId = useId();
    const id = titleId ?? ownId;

    return (
        <section
            aria-labelledby={ id }
            className={ classes.section }
        >
            <h3
                id={ id }
                className={ classes.title }
            >
                { title }
            </h3>
            { children }
        </section>
    );
};

export default SettingsSection;
