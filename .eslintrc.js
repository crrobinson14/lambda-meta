module.exports = {
    root: true,
    extends: 'airbnb-base',
    plugins: [],
    globals: {},
    rules: {
        // Our overrides
        'indent': ['error', 4, { SwitchCase: 1 }], // 4-space indents
        'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }],
        'max-len': ['error', {
            code: 120,                             // We all have big screens - use them!
            ignoreUrls: true,                      // A bunch of these things are a pain to maintain when wrapped...
            ignoreStrings: true,
            ignoreRegExpLiterals: true,
            ignoreTemplateLiterals: true,
        }],
        'arrow-parens': ['error', 'as-needed'],    // No reason to write ((a) => {..}) when (a => {..}) will do
        'no-trailing-spaces': 0,                   // Many IDEs insert these, they're invisible, and cause no harm
        'no-alert': 0,                             // These are actually pretty useful in modern browsers
        'comma-dangle': 0,                         // This seems good but ends up being painful in large nested objects
        'func-names': ['error', 'as-needed'],      // Only require function names when required.
        'no-plusplus': 0,                          // i += 1 is REALLY annoying for devs used to ++. We'll be careful.
        'space-before-function-paren': 0,          // AirBNB-base wants a space before anon but not others. Weird.

        'no-underscore-dangle': 0,
        'no-param-reassign': 0,
        'prefer-template': 0,
        'no-console': 0,
        'prefer-destructuring': 0,
        'object-curly-newline': 0,
        'arrow-body-style': 0,

        'strict': 0,
        'array-callback-return': 0,
        'global-require': 0,
        'import/prefer-default-export': 0,
    }
};
