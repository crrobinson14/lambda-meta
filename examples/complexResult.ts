import { Handler, MetaContext } from '../src';

const handler: Handler = {
    name: 'complexResult',
    description: 'Sample method that uses no parameters and returns a complex object result.',

    events: [{
        http: {
            path: 'complex-result',
            method: 'get',
            cors: true,
        }
    }],

    async process(event: any, context: MetaContext) {
        return {
            environment: process.env.NODE_ENV || 'development',
        };
    }
};

module.exports = handler;
