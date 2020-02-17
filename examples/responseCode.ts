import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Custom HTTP response codes may be provided with an appropriate field in the return result. Note that custom
 * error types are also provided by Lambda Meta that set 4xx..5xx status codes automatically when thrown.
 */

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(handler, event, context, callback),
    name: 'complexResult',
    description: 'Sample method that uses no parameters and returns a complex object result.',

    async process(event: any, context: LMContext) {
        return {
            environment: process.env.NODE_ENV || 'development',
            responseHttpCode: 204,
        };
    }
};

export default handler;
