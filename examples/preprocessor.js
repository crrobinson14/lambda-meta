const lm = require('../index');

module.exports = {
    name: 'preprocessor',
    description: 'Example preprocessor usage.',

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

    // Here we need no parameters. We simply return a canned value to the caller as our result.
    preprocess: (event, context) => {
        context.session = {
            valid: false
        };
    },

    process: (event, context) => ({ session: context.session }),
};
