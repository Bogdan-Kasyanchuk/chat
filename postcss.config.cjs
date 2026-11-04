module.exports = {
    plugins: {
        'postcss-preset-mantine': {},
        'postcss-simple-vars': {
            variables: {
                'mantine-breakpoint-xs': '22.5em',
                'mantine-breakpoint-sm': '36em',
                'mantine-breakpoint-md': '48em',
                'mantine-breakpoint-lg': '64em',
                'mantine-breakpoint-xl': '90em'
            }
        }
    }
};
