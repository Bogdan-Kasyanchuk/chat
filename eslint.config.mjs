import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores([ 'dist/**', 'convex/_generated/**', '.claude/**', '.superpowers/**', 'docs/**' ]),
    js.configs.recommended,
    tsEslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite(),
    {
        files: [ '**/*.{ts,tsx}' ],
        plugins: {
            import: importPlugin
        },
        languageOptions: {
            globals: {
                ...globals.browser
            },
            parser: tsEslint.parser,
            parserOptions: {
                // Конфіги Vite/Vitest живуть у tsconfig.node.json, а не в кореневому tsconfig для src
                projectService: {
                    allowDefaultProject: [ 'vite.config.ts', 'vitest.config.ts', 'playwright.config.ts', 'e2e/*.ts' ],
                    defaultProject: 'tsconfig.node.json'
                },
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            'no-console': [ 'error' ],
            'no-alert': [ 'error' ],
            'no-debugger': [ 'error' ],
            'curly': [ 'error' ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'typeParameter',
                    prefix: [ 'T' ],
                    format: [ 'PascalCase' ]
                }
            ],
            'sort-imports': [ 'error', { ignoreDeclarationSort: true } ],
            'import/no-unresolved': 'off',
            'import/newline-after-import': [ 'error', { count: 1 } ],
            'import/order': [
                'error',
                {
                    'alphabetize': {
                        order: 'asc',
                        caseInsensitive: true
                    },
                    'newlines-between': 'always',
                    'groups': [
                        [ 'builtin', 'external' ],
                        'internal',
                        'parent',
                        [ 'sibling', 'index' ]
                    ],
                    'pathGroups': [
                        { pattern: '@/**', group: 'internal' },
                        { pattern: '@convex/**', group: 'internal' }
                    ],
                    'pathGroupsExcludedImportTypes': [ 'builtin' ]
                }
            ]
        }
    },
    {
        files: [ '**/*.cjs' ],
        languageOptions: {
            globals: {
                ...globals.node
            }
        }
    },
    {
        plugins: {
            '@stylistic': stylistic,
            perfectionist
        },

        rules: {
            '@stylistic/brace-style': [
                'error'
            ],

            '@stylistic/no-multi-spaces': [
                'error'
            ],

            '@stylistic/comma-dangle': [
                'error',
                'never'
            ],

            '@stylistic/comma-spacing': [
                'error'
            ],

            '@stylistic/semi': [
                'error',
                'always'
            ],

            '@stylistic/indent': [
                'error',
                4,
                {
                    SwitchCase: 1,
                    ignoredNodes: [
                        'PropertyDefinition[decorators]',
                        'TSUnionType',
                        'TSTypeParameterInstantiation',
                        'TSIntersectionType'
                    ]
                }
            ],

            '@stylistic/space-before-function-paren': [
                'error',
                {
                    anonymous: 'always',
                    named: 'never',
                    asyncArrow: 'always'
                }
            ],

            '@stylistic/space-infix-ops': [
                'error',
                {
                    int32Hint: false
                }
            ],

            '@stylistic/space-unary-ops': [
                'error',
                {
                    words: true,
                    nonwords: false
                }
            ],

            '@stylistic/object-curly-spacing': [
                'error',
                'always'
            ],

            '@stylistic/array-bracket-spacing': [
                'error',
                'always'
            ],

            '@stylistic/template-curly-spacing': [
                'error',
                'always'
            ],

            '@stylistic/arrow-spacing': [
                'error'
            ],

            '@stylistic/space-before-blocks': [
                'error'
            ],

            '@stylistic/keyword-spacing': [
                'error'
            ],

            '@stylistic/computed-property-spacing': [
                'error',
                'always'
            ],

            '@stylistic/quotes': [
                'error',
                'single'
            ],

            '@stylistic/jsx-quotes': [
                'error',
                'prefer-double'
            ],

            '@stylistic/quote-props': [
                'error',
                'consistent-as-needed'
            ],

            '@stylistic/key-spacing': [
                'error'
            ],

            '@stylistic/no-whitespace-before-property': [
                'error'
            ],

            '@stylistic/arrow-parens': [
                'error',
                'as-needed'
            ],

            '@stylistic/no-multiple-empty-lines': [
                'error',
                {
                    max: 1
                }
            ],

            '@stylistic/type-annotation-spacing': [
                'error'
            ],

            '@stylistic/member-delimiter-style': [
                'error',
                {
                    multiline: {
                        delimiter: 'comma',
                        requireLast: false
                    },
                    singleline: {
                        delimiter: 'comma',
                        requireLast: false
                    },
                    multilineDetection: 'brackets'
                }
            ],

            '@stylistic/jsx-self-closing-comp': [
                'error'
            ],

            '@stylistic/jsx-max-props-per-line': [
                'error',
                {
                    maximum: {
                        single: 1,
                        multi: 2
                    }
                }
            ],

            '@stylistic/jsx-curly-spacing': [
                'error',
                {
                    when: 'always',
                    children: true
                }
            ],

            '@stylistic/jsx-first-prop-new-line': [
                'error',
                'multiline'
            ],

            '@stylistic/jsx-closing-bracket-location': [
                'error',
                {
                    nonEmpty: 'line-aligned',
                    selfClosing: 'line-aligned'
                }
            ],

            '@stylistic/jsx-tag-spacing': [
                'error',
                {
                    beforeClosing: 'never'
                }
            ],

            '@stylistic/jsx-wrap-multilines': [
                'error',
                {
                    return: 'parens-new-line'
                }
            ],

            '@stylistic/jsx-curly-brace-presence': [
                'error'
            ],

            'perfectionist/sort-jsx-props': [
                'error',
                {
                    type: 'unsorted',
                    groups: [
                        'reserved',
                        [
                            'multiline-prop',
                            'unknown'
                        ],
                        'shorthand-prop',
                        'callback'
                    ],
                    customGroups: [
                        {
                            groupName: 'reserved',
                            anyOf: [
                                {
                                    elementNamePattern: '^children$'
                                },
                                {
                                    elementNamePattern: '^dangerouslySetInnerHTML$'
                                },
                                {
                                    elementNamePattern: '^key$'
                                },
                                {
                                    elementNamePattern: '^ref$'
                                }
                            ]
                        },
                        {
                            groupName: 'callback',
                            elementNamePattern: '^on'
                        }
                    ]
                }
            ]
        }
    }
]);
