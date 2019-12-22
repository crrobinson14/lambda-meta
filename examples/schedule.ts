import { LMHandler, LMContext, processRequest } from '../src';

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'schedule',
    description: 'Illustrates how to run a function on a schedule.',
    events: [{
        schedule: 'cron(*/5 * * * ? *)',
    }],

    async process(event: any, context: LMContext) {
        console.log('I was called on a schedule.');
        return true;
    },
};

module.exports = handler;
