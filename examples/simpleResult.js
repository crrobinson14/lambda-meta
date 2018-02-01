const lm = require('../index');

module.exports = {
    name: 'simpleResult',
    description: 'Sample method that uses no parameters and just returns a string result.',
    apiGateway: {
        path: 'simple-result',
        method: 'get',
    },

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

    // Here we need no parameters. We simply return a canned value to the caller as our result.
    process: () => ('test'),
};
