const lm = require('lambda-meta');

module.exports = {
    name: 'useParameters',
    description: 'Sample method that requires a parameter, with input validation.',

    inputs: {
        userId: {
            required: true,
            type: 'string',
            description: 'String user ID to retrieve.',
            validate: (event, context) => context.params.userId.length === 36
        },
    },

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

    handler: (event, context) => {
        // Note that we can rely on context.params being defined and being an object. And context.params.userId will
        // be defined and be a string.
        console.log('Got a request for user ' + context.params.userId, event);

        // The return result from our handler will be the result passed back to the caller.
        return { userIdRequested: context.params.userId };
    }
};
