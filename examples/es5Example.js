const { processRequest } = require('../src');

module.exports = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'es5Example',

    async process(event, context) {
        return 'It works';
    },
};
