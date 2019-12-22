import { LMHandler, LMContext, processRequest } from '../src';

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'apiGateway',
    description: 'Include an API gateway endpoint',
    events: [{
        http: {
            path: 'get/my/env',
            method: 'get',
            cors: true,
        }
    }],

    async process(event: any, context: LMContext) {
        return {
            environment: process.env.NODE_ENV || 'development',
        };
    }
};

module.exports = handler;
