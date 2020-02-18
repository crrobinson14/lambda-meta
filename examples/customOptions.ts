import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Illustrates the use of the timeout and memorySize parameters. Units are MB and seconds.
 */

export const handler: LMHandler = {
    name: 'customOptions',
    description: 'Overrides some serverless.js global settings.',
    timeout: 30,
    memorySize: 256,

    async process(event: any, context: LMContext) {
        return true;
    },
};

export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);
