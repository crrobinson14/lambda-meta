import { Handler, MetaContext } from '../src';

const handler: Handler = {
    name: 'numericInput',
    description: 'Sample method that requires numeric input.',
    inputs: {
        num: {
            required: true,
            type: 'Number',
            description: 'Numeric parameter',
        },
    },

    async process(event: any, context: MetaContext) {
        return {
            num: context.params.num
        };
    }
};

module.exports = handler;
