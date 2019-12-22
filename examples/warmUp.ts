import { Handler, MetaContext } from '../src';

const handler: Handler = {
    name: 'warmUp',
    description: 'Sample method to illustrate the warmUp plugin.',
    warmup: true,

    async process(event: any, context: MetaContext) {
        // NOTE: We only get here when it is NOT a warmup request.
        return true;
    },
};

module.exports = handler;
