const lm = require('../index');

module.exports = {
    name: 'complexResult',
    description: 'Sample method that uses no parameters and returns a complex object result.',

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

    // Here we need no parameters. We simply return a canned value to the caller as our result.
    process: () => ({
        environment: process.env.NODE_ENV || 'development',
    }),
};
