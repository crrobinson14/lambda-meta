import { LMHandler, LMContext, processRequest } from '../src';

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'mergeNothing',
    mergeResult: true,

    async process(event: any, context: LMContext) {
        // Returning nothing here to ensure mergeResult doesn't break on that condition
    },
};

module.exports = handler;
