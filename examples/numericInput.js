const lm = require('../index');

module.exports = {
    name: 'numericInput',
    description: 'Sample method that requires numeric input.',

    inputs: {
        num: {
            required: true,
            type: 'Number',
            description: 'Numeric parameter',
        },
    },

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

    // Here we need no parameters. We simply return a canned value to the caller as our result.
    process: (event, context) => ({
        num: context.params.num
    }),
};
