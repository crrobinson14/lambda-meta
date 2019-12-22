import { LMHandler, LMContext, processRequest } from '../src';

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'complexResult',
    description: 'Sample method that uses no parameters and returns a complex object result.',

    async process(event: any, context: LMContext) {
        return {
            environment: process.env.NODE_ENV || 'development',
            responseHttpCode: 204,
        };
    }
};

module.exports = handler;
