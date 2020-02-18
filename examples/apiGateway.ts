import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Illustrates how API Gateway entries can be tied to a resource. See
 * [https://serverless.com/framework/docs/providers/aws/events/apigateway/] for more information. All fields are
 * passed through as-is so any option available may be specified, not just the ones here (e.g. allowCredentials).
 */

export const handler: LMHandler = {
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

export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);
