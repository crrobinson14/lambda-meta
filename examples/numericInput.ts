import { LMHandler, LMContext, processRequest } from '../src';

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'numericInput',
    description: 'Sample method that requires numeric input.',
    inputs: {
        num: {
            required: true,
            type: 'Number',
            description: 'Numeric parameter',
        },
    },

    async process(event: any, context: LMContext) {
        return {
            num: context.params.num
        };
    }
};

module.exports = handler;