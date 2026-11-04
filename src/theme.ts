import { createTheme } from '@mantine/core';

const theme = createTheme({
    primaryColor: 'dark',
    defaultRadius: 0,
    breakpoints: {
        xs: '22.5em',
        sm: '36em',
        md: '48em',
        lg: '64em',
        xl: '90em'
    },
    components: {
        Container: {
            defaultProps: {
                size: 1440
            }
        }
    }
});

export default theme;
