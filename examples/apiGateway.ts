import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Illustrates how API Gateway entries can be tied to a resource. See
 * [https://serverless.com/framework/docs/providers/aws/events/apigateway/] for more information. All fields are
 * passed through as-is so any option available may be specified, not just the ones here (e.g. allowCredentials).
 */

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
