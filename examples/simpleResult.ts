import { LMHandler, LMContext, processRequest } from '../src';

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'simpleResult',
    events: [{
        http: {
            path: 'simple-result',
            method: 'get',
            cors: true,
        }
    }],

    async process(event: any, context: LMContext) {
        return 'test';
    },
};

module.exports = handler;