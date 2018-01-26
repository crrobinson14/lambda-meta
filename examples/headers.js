const lm = require('../index');

module.exports = {
    name: 'headers',
    description: 'Sample method that echoes back headers.',

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

    // Here we need no parameters. We simply return a canned value to the caller as our result.
    process: (event, context) => ({
        headers: context.headers
    }),
};
