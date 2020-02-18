import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Illustrates the appropriate setting for making a call run on a schedule rather than an HTTP call. Note that all
 * events supported by Lambda are available, not just HTTP/Schedule. See
 * [https://serverless.com/framework/docs/providers/aws/events/] for more details (make sure you expand the left-side
 * menu in the docs, labeled "AWS Events," as this is not done automatically, making this documentation page look
 * broken!)
 *
 * All event types are technically supported but not all are useful. For example, Websocket events require you to
 * define `connectHandler` and `disconnectHandler` which are not directly supported by Lambda Meta. But this is OK -
 * they will still work and can still be mixed with HTTP/other calls in the same Lambda Meta project. This library
 * just will not provide any additional parameter or response processing.
 */

export const handler: LMHandler = {
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

export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);
