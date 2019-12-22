import { Handler, MetaContext } from '../src';

const handler: Handler = {
    name: 'throwError',
    description: 'Illustrates error handling.',
    timeout: 30,
    memorySize: 256,

    async process(event: any, context: MetaContext) {
        throw new Error('Invalid XYZ.');
    },
};

module.exports = handler;
