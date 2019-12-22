import { LMHandler, LMContext, processRequest } from '../src';

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'customOptions',
    description: 'Overrides some serverless.js global settings.',
    timeout: 30,
    memorySize: 256,

    async process(event: any, context: LMContext) {
        return true;
    },
};

module.exports = handler;
