import { LMHandler, LMContext, processRequest } from '../src';

/**
 * This example illustrates returning a more complex result than `simpleResult`, an object. We also set `mergeResult`
 * to true. This means instead of response.result.environment we will see response.environment returned.
 */

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'complexResult',
    description: 'Sample method that uses no parameters and returns a complex object result.',
    mergeResult: true,

    async process(event: any, context: LMContext) {
        return {
            environment: process.env.NODE_ENV || 'development',
        };
    }
};

module.exports = handler;
