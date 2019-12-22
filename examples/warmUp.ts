import { LMHandler, LMContext, processRequest } from '../src';

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'warmUp',
    description: 'Sample method to illustrate the warmUp plugin.',
    warmup: true,

    async process(event: any, context: LMContext) {
        // NOTE: We only get here when it is NOT a warmup request.
        return true;
    },
};

module.exports = handler;
