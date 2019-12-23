const { processRequest } = require('../src');

/**
 * If you are still using ES5, use this file as a template for your function.
 */

module.exports = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'es5Example',

    async process(event, context) {
        return 'It works';
    },
};
