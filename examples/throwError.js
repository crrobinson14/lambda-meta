const lm = require('../index');

module.exports = {
    name: 'throwError',
    description: 'Illustrates error handling.',

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

    // Here we need no parameters. We simply return a canned value to the caller as our result.
    process: () => {
        throw new Error('Invalid XYZ.');
    },
};
