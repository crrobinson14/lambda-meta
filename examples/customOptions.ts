import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Illustrates the use of the timeout and memorySize parameters. Units are MB and seconds.
 */

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
