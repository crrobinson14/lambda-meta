import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Illustrates accepting a parameter of a specific type. Consult the excellent Type-Check module's documentation in
 * [https://www.npmjs.com/package/type-check] for more options.
 */

export const handler: LMHandler = {
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

export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);
