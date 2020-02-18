# Lambda Meta Handlers

*NOTE: Version 3.x includes several breaking changes! This package was rewritten with full TypeScript support, and I
took the opportunity to address several shortcomings of the previous versions. If you are not ready to upgrade, use
version 2.1.2 as the latest version of the last major release.*

[![CircleCI](https://circleci.com/gh/crrobinson14/lambda-meta.svg?style=shield)](https://circleci.com/gh/crrobinson14/lambda-meta)
[![codecov](https://codecov.io/gh/crrobinson14/lambda-meta/branch/master/graph/badge.svg)](https://codecov.io/gh/crrobinson14/lambda-meta)

This project provides some simple, mildly-opinionated wrappers for AWS Lambda request processing. Specifically:

1. Parsing parameters in Lambda requires a lot of manual, repetitive work, as well as attention to where the parameters
are coming in. For example, if you normally expect to parse a POST request via `JSON.parse(event.body)` you may be
surprised at what happens if you call the function via `sls invoke`! In that case, (depending on how you call it) the
data you pass may not need to be parsed and your call may fail. 

    Lambda Meta handles these and a variety of other conditions to make your life easier.

2. Over time, `serverless.yml` file can grow out of control and be hard to maintain, particularly in the `functions`
definitions. If your needs are complex, such as using tuning memory, timeout, and other settings per function, you may
find that this file grows to hundreds of even thousands of lines long, and hard to visually "scan" for inconsistencies.

    Lambda Meta simplifies this job by moving operating parameters, input validation, API Gateway settings, and more
    into documentation blocks within the function files themselves. These will feel very familiar to VueJS/React
    developers because all of the logic and code related to a function is kept together in a single file.

3. Output handling is also standardized. Lambda Meta will set HTTP status codes and output formats consistently for
every function response, eliminating additional boilerplate from many handlers. If/where required, you can still take
manual control over the output handling.

## Usage

Usage is fairly simple. Install the module (`npm i -S lambda-meta` or `yarn add lambda-meta`), then create each handler
file with one of these templates:

    import { LMHandler, LMContext, processRequest } from 'lambda-meta';

    export const handler: LMHandler = {
        // Your processing function. See below for details.
        async process(event: any, context: LMContext) {
            console.log('Parameters received:', context.params);
            return true;
        }
    };
    
    // Bind the standard AWS Lambda "entry point" to the additional request-processing "smarts" in Lambda-Meta.
    export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);

ES5 is also supported:

    const { LMContext, processRequest } = require('lambda-meta');

    const handler = {
        // Your processing function. See below for details, but TL;DR context.params will have your parameters.
        async process(event: any, context: LMContext) {
            return true;
        }
    };
    
    module.exports = {
        handler,
        entry: (event, context, callback) => processRequest(handler, event, context, callback),
    };
    
Lambda-Meta will take care of a number of request processing tasks for you, including parsing parameters from all
possible methods (path, query, body, and even directly injected via `sls invoke` calls or other sources). A full list
of all possible options and their defaults is below.
    
    import { LMHandler, LMContext, processRequest } from 'lambda-meta';
    
    export const handler: LMHandler = {
        // By default, return results from process() are set as { result: { ...dataReturnedByProcess } }. If set true,
        // and an object is returned, it will be merged at the root level of the result, e.g.
        // { ...dataReturnedByProcess }
        mergeResult: true,

        // Inputs requiring validation. This is optional: if it is not provided, inputs will be simply parsed and passed
        // to preprocess()/process() with no further evaluation.         
        inputs: {
            userId: {
                required: true,
                type: 'String',
                description: 'String user ID to retrieve.',
                validate: userId => userId.length === 36
            },
        },
            
        // Optional request pre-processor. May be used for common sync/async checks such as session validation. This is
        // also a good place to check for required resources during cold-starts, such as database connections. 
        async preprocess(event: any, context: MetaContext) {
            context: 
        }
            
        // Required request processor
        async process(event: any, context: MetaContext) {
            return {
                environment: process.env.NODE_ENV || 'development',
            };
        }
    };
    
    export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);

Usage examples are included in the [Examples](https://github.com/crrobinson14/lambda-meta/tree/master/examples) folder.
Please review them to get a sense of what is possible. Lambda Meta is very flexible! 

## Input Validation

Lambda Meta will correctly handle parameters from a variety of sources. You can even mix and match sources at the same
time, e.g. processing path, query string, AND body parameters in a single call. When there are name conflicts, the
following priority order will be obeyed, with LATER parameters OVERWRITING earlier ones:

1. Raw events (typically via a direct Invoke call, CloudWatch alarms, etc.)
2. Path parameters (e.g. /users/123 where 123 is the userId).
3. Query string parameters.
4. The request body.

That is if `userId` is present in both the path and the query string, the query string value will be used.

Inputs are specified via a dictionary in the function definition. The key for each entry is the parameter name:

    inputs: {
        userId: {
            // If defined as true, an error will be thrown if the input is not present
            required: true,

            // The type (as validated by "Type-Check") the input value must be. If omitted, this check is skipped. 
            // See https://www.npmjs.com/package/type-check for a list of available types.
            // Note that some parameter sources (e.g. query strings) provide all values as strings. Do not attempt
            // to use sophisticated type checks on these. However, as a convenience, Number types will be converted
            // where they are found (and set to a type of 'Number').  
            type: 'String',

            // Optional, but recommended for documentation generators. Ignored by this module.
            description: 'String user ID to retrieve.',

            // If defined, a validator to further evaluate the input. May be async.
            validate: (userId, allParams) => userId.length === 36 || 'Must be exactly 36 characters.'
        },
    },

Types are validated using [Type-Check](https://www.npmjs.com/package/type-check). See that module's documentation for
available types (it is very sophisticated). If the type option is omitted, type checking is skipped. Note that some
parameter sources (e.g. path and query string) always pass parameters in as strings. Complex types are not supported
here, but if you specify `type: 'Number'`, for your convenience, Lambda Meta will attempt to convert them during
validation. 

Required fields are type-checked first, and the validator will not be called if the type is wrong or the parameter was
not provided at all. Non-required fields will not call their validators if the parameters were not supplied in the call.
This means it is not necessary in most cases to check for `undefined` and/or invalid-type parameters. (`preprocess`
and `process` will not be called either. Good input validation is a great way to keep your actual business-logic
processing routines clean and short!) 

Validators are given the value to check and also `allParams`, to support more complex validations. This can be useful
for simple multi-field checks such as
 
    validate: (contactType, allParams) => (contactType === 'phone' ? validPhoneNumber(allParams.phone) : true)
    
Be careful to keep these cases simple. Validators are called in parallel (inside a `Promise.all()`) and order is not
guaranteed. Use 'preprocess()' for more complex operations that must be checked in a specific sequence.

Validators should return `true` to indicate success, `false` to generate a generic "Invalid field" error,
or a string to generate a custom error response.

## Output Processing

Responses are formatted with one of two consistent formats. Successful calls will return:

    {
        status: 'OK',
        result: ..., // Return value from the process() call.
    }
    
For functions that require more control, several options are available. `mergeResults` will move `result` data into
the root of the response obhect. `skipResponse` will allow the called function to handle output processing all on
its own. You can also set custom HTTP response codes and other options. See
[Examples](https://github.com/crrobinson14/lambda-meta/tree/master/examples) for specific usage examples.

To comment on the challenge new users of this module are most likely to search for, Cognito User Pool Triggers expect
the function to return the exact parameters passed in, with no modification, on success. When writing a User Pool
Trigger just set `skipResponse: true`, then make sure you call the callback function manually:
  
    import { LMHandler, LMContext, processRequest } from 'lambda-meta';

    export const handler: LMHandler = {
        name: 'handleUserSignup',
        skipResponse: true,
        
        async process(event: any, context: LMContext) {
            // event.request.userAttributes will contain the attributes for the new user, e.g. sub and email
            callback(null, event);
        }
    };
    
    export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);

## Error Handling

If the `process()` call throws an Error, the call will return:

    {
        status: 'ERROR',
        error: error.message, // From the thrown error
    }

Lambda Meta provides a set of custom error types that may be used to include a custom HTTP status code without an
additional line of code to set it. These custom types can also take an optional message (string) and extra data
to include in the error object (to be logged):

    throw new NotFoundError('Invalid Product Code');

## Roadmap

* Adding TypeScript support created a huge headache for enumerating functions. I played with a number of different
options for implementing this and every problem I resolved uncovered one more. For the time being I've disabled this
functionality, but may revisit it in the future.

* This module depends on `type-check`, and `uuid`. At some point we will probably move these to be peer dependencies
but my projects all required these modules anyway so this was left "simple" for now. Feel free to submit a PR to 
change this. :)
