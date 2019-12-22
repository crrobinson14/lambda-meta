import { Handler, MetaContext } from '../src';

const handler: Handler = {
    name: 'simpleResult',
    events: [{
        http: {
            path: 'simple-result',
            method: 'get',
            cors: true,
        }
    }],

    async process(event: any, context: MetaContext) {
        return 'test';
    },
};

module.exports = handler;
