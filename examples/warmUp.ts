import { LMHandler, LMContext, processRequest } from '../src';

/**
 * This is something you probably want on most (all?) functions in your stack. If you set warmup to true, config
 * will be emitted for the warmup module to keep this function alive by pinging it every few minutes. This eliminates
 * the dreaded 500+ms (typical) "Cold Start" latency you would see otherwise on infrequently-accessed APIs.
 *
 * Note that "warmup" is only one piece of a good scaling strategy. Lambda calls made in parallel go to PARALLEL
 * instances of your function, as if you started a new Docker instance for each one while it was running. Warmup will
 * only keep ONE instance "alive". If you regularly see bursts of traffic with dead periods between, you would be
 * better off setting "concurrency" to a higher number than its default (1). See
 * [https://www.npmjs.com/package/serverless-plugin-warmup] for details. Lambda Meta does not currently support this...
 * but will soon... Feel free to file a pull request if you need this!
 */

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'warmUp',
    description: 'Sample method to illustrate the warmUp plugin.',
    warmup: true,

    async process(event: any, context: LMContext) {
        // NOTE: We only get here when it is NOT a warmup request.
        return true;
    },
};

module.exports = handler;
