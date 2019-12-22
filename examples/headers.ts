import { Handler, MetaContext } from '../src';

const handler: Handler = {
    name: 'headers',
    description: 'Sample method that echoes back headers.',

    async process(event: any, context: MetaContext) {
        return {
            headers: context.headers,
        };
    }
};

module.exports = handler;
