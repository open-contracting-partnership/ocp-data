import neostandard from 'neostandard';

export default [
    ...neostandard({
        semi: true,
    }),
    {
        rules: {
            '@stylistic/indent': ['error', 4],
            '@stylistic/space-before-function-paren': ['error', 'never'],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
        },
    },
];
