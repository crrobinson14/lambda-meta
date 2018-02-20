const lm = require('../index');

module.exports = {
    name: 'warmUp',
    description: 'Sample method to illustrate the warmUp plugin.',
    warmup: true,

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

    process: (event, context) => {
        // NOTE: We only get here when it is NOT a warmup request.
        return true;
    }
};
