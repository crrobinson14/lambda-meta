const lm = require('lambda-meta');

module.exports = {
    name: 'noParameters',
    description: 'Sample method that uses no parameters.',

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

    // Here we need no parameters. We simply return a canned value to the caller as our result.
    process: () => ({
        environment: process.env.NODE_ENV || 'development',
    }),
};
