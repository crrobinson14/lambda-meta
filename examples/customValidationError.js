const lm = require('../index');

module.exports = {
    name: 'customValidationError',
    description: 'Input validation with custom error messages.',

    inputs: {
        userId: {
            required: true,
            type: 'String',
            description: 'String user ID.',
            validate: (event, context) => context.params.userId.length === 36 || 'Must be exactly 36 characters.'
        },
    },

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

    process: () => {
        // The return result from our handler will be the result passed back to the caller.
        return true;
    }
};
