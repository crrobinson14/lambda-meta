# Lambda Meta Handlers

*NOTE: Version 3.x includes several breaking changes! This package was rewritten with full TypeScript support, and I
took the opportunity to address several shortcomings of the previous versions. If you are not ready to upgrade, use
version 2.1.2 as the latest version of the last major release.*

[![CircleCI](https://circleci.com/gh/crrobinson14/lambda-meta.svg?style=shield)](https://circleci.com/gh/crrobinson14/lambda-meta)
[![codecov](https://codecov.io/gh/crrobinson14/lambda-meta/branch/master/graph/badge.svg)](https://codecov.io/gh/crrobinson14/lambda-meta)

This project provides some simple, mildly-opinionated wrappers for AWS Lambda request processing. Specifically:

1. Parsing parameters in Lambda requires a lot of manual, repetitive work, and attention paid to where the parameters
are coming in (e.g. query string vs. body). For example, if you normally expect to parse a POST request via
`JSON.parse(event.body)` you may be surprised at what happens if you call the function via `sls invoke`! In that case,
(depending on how you call it) the data you pass may not need to be parsed and your call may fail! 

    Lambda Meta handles these and a variety of other conditions to make your life easier.

2. `serverless.com` is a great stack but it's common to find over time that your `serverless.yml` file gets quickly out
of control and hard to manage. And as a YML file, syntax can be prickly - siomple indentation errors can break your
entire stack in bad ways. Even worse, in an API with dozens of functions, it can be a real pain to do things like
refactoring (adding CORS support to a group of functions - get ready for a lot of boilerplate pasting, and be careful
not to miss one!) or even just double-checking a function's settings.

    Lambda Meta makes this job MUCH easier. Changing your `serverless.yml` to a `serverless.js` file allows you to
    include custom logic in its generation. Lambda Meta provides a convenient helper that scans a directory you specify,
    finds all the functions defined there, and, using metadata in each file, outputs a fully formatted `functions:` 
    block to Serverless! This is a huge time-saver and lets you immediately see a function's inputs, HTTP settings,
    and more all in a single file while editing it.

3. Output handling is standardized, and set both the HTTP status code and output format for each response.

## Usage

Usage is fairly simple. Install the module (`npm i -S lambda-meta`), then create each handler file with this template:

    import { LMHandler, LMContext, processRequest } from 'lambda-meta';

    const handler: LMHandler = {
        // The only boilerplate. Name must be unique!
        entry: (event, context, callback) => processRequest(handler, event, context, callback),
        name: 'myFunction',
        
        // Your processing function. See below for details, but TL;DR context.params will have your parameters.
        async process(event: any, context: LMContext) {
            return true;
        }
    };
    
    export default handler;

ES5 is also supported:

    const { LMContext, processRequest } = require('lambda-meta');

    const handler = {
        // The only boilerplate. Name must be unique!
        entry: (event, context, callback) => processRequest(handler, event, context, callback),
        name: 'myFunction',

        // Your processing function. See below for details, but TL;DR context.params will have your parameters.
        async process(event: any, context: LMContext) {
            return true;
        }
    };
    
    module.exports = handler;
    
Lambda-Meta will take care of a number of request processing tasks for you, including parsing parameters from all
possible methods (path, query, body, and even directly injected via `sls invoke` calls or other sources). LM's
behavior is controlled by setting additional options. A full list of all possible options and their defaults is below:  
    
    import { LMHandler, LMContext, processRequest } from 'lambda-meta';
    
    const handler: LMHandler = {
        // Required boilerplate
        entry: (event, context, callback) => processRequest(handler, event, context, callback),
        
        // Required name and optional description. Useful for documentation purposes. Name must be unique or definitions
        // will be overwritten when they are loaded!
        name: 'allOptions',
        description: 'Sample method illustrating the use of all possible options',
        
        // Additional options.
        timeout: 10000,
        memorySize: 512,
        warmup: true,
        mergeResult: true,
        responseHeaders: {
            'Cache-Control': 'max-age: 10',
        },
        events: [{
            http: {
                path: 'get/my/env',
                method: 'get',
                cors: true,
            }
        }, {
            schedule: 'cron(*/5 * * * ? *)',
        }],
        inputs: {
            userId: {
                required: true,
                type: 'String',
                description: 'String user ID to retrieve.',
                validate: userId => userId.length === 36
            },
        },
            
        // Optional request pre-processor
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
    
    export default handler;

This README would be very long if every option was described here. Usage examples for every option are included in the
[Examples](https://github.com/crrobinson14/lambda-meta/tree/master/examples) folder. Please review them to get a sense
of what is possible. Lambda Meta is very flexible! 

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

    const handler: LMHandler = {
        entry: (event, context, callback) => processRequest(handler, event, context, callback),
        name: 'handleUserSignup',
        skipResponse: true,
        
        async process(event: any, context: LMContext) {
            // event.request.userAttributes will contain the attributes for the new user, e.g. sub and email
            callback(null, event);
        }
    };
    
    export default handler;

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

## Function Discovery and Enumeration

Maintaining `serverless.yml` becomes a real drag as your API grows, with a lot of repeated boilerplatefor each of your
functions. To streamline this maintenance chore, Lambda Meta can "discover" and list out your functions, using the 
options you specify when defining them to tell Serverless how to treat them. Unfortunately, out of the box, this is
unavoidable in Serverless because its configuration file is a static YML that can't include custom logic.

But wait, you can! It turns out that you can provide your configuration in a `serverless.js` instead of the usual YML
file! This is poorly documented (but definitely supported) functionality that has been available since 
[Serverless Release v1.26.0](https://github.com/serverless/serverless/blob/master/CHANGELOG.md#1260-2018-01-29).
The options and format of this file are exactly the same as the YML structure. Just `module.exports = {` the same
structure, adding `{ ... },` wrappers around indented blocks as necessary to convert the YML to JS.

Unfortunately, for the time being serverless does NOT directly read `serverless.ts` files. There is a plugin to read
TypeScript handlers during a build, but not for the config file itself (thumb up and follow
[this Github issue](https://github.com/serverless/serverless/issues/6335) for updates!) This means we cannot use the
technique in Lambda Meta 2.x of providing an `enumerateHandlers()` function called directly inside the main config.
Instead, we need a helper script to generate something more manageable.

For now, a simple hack works. In your serverless.js file include the following module:

    const child_process = require('child_process');
    
    const enumerateHandlers = path => 
        JSON.parse(child_process.execSync(`npx ts-node --skip-ignore ./scripts/preprocess.ts "${path}"`).toString('utf8'));
    
Then when exporting your functions:

    module.exports = {
        service: 'xyz',
        app: 'myApp',
        // ... other serverless.com options as needed
    
        functions: enumerateHandlers('functions/**/*.ts'),
        
        // enumerateHandlers uses glob() so any valid glob syntax works. e.g. to find both TS and JS files:
        // functions: enumerateHandlers('functions/**/*.@(js|ts)'),
    };

## Roadmap

This module depends on `type-check`, and `uuid`. At some point we will probably move these to be peer dependencies
but the author's projects all required these modules anyway so this was left "simple" for now. Feel free
to submit a PR to change this. :)

I will also soon add support for outputting documentation blocks in 
[Serverless.com OpenAPI Format](https://www.npmjs.com/package/serverless-openapi-documentation).
