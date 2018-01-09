const lm = require('../index');

module.exports = {
    // name: 'noName',
    description: 'Sample method with no name.',

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

    // Here we need no parameters. We simply return a canned value to the caller as our result.
    process: () => ('test'),
};
