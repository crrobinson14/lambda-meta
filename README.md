# Lambda Meta Handlers

[![CircleCI](https://circleci.com/gh/crrobinson14/lambda-meta.svg?style=shield)](https://circleci.com/gh/crrobinson14/lambda-meta)
[![codecov](https://codecov.io/gh/crrobinson14/lambda-meta/branch/master/graph/badge.svg)](https://codecov.io/gh/crrobinson14/lambda-meta)

This project provides some simple, mildly-opinionated wrappers for AWS Lambda request processing. Specifically:

1. Parsing parameters in Lambda requires manual work and attention to where the parameters are coming in (e.g. query
string vs. body). Parameters are handled here as in most other frameworks: parameters may appear anywhere, and are
parsed with a priority order (e.g. body overrides query string).

2. Input validation is provided via metadata defined in the methods. Simplified handlers to minimize the boilerplate
for checking required fields and field types. Developers may also provide validation functions that are called to
check each field. Validators are Promise-based and may thus be asynchronous (e.g. to make a database call).

3. Output handling is standardized and set both the HTTP status code and output format for each response.

4. AWS Xray segments are defined and processed for each handler.

## Usage

Usage is fairly simple. Install the module (`npm i -S lambda-meta`), then create each handler file as follows:

    const lm = require('lambda-meta');

    module.exports = {
        name: 'useParameters',
        description: 'Sample method that requires a parameter, with input validation.',

        inputs: {
            userId: {
                required: true,
                type: 'String',
                description: 'String user ID to retrieve.',
                validate: (event, context) => context.params.userId.length === 36
            },
        },

        entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

        process: (event, context) => {
            // Note that we can rely on context.params being defined and being an object. And context.params.userId will
            // be defined and be a string.
            console.log('Got a request for user ' + context.params.userId, event);

            // The return result from our handler will be the result passed back to the caller.
            return { userIdRequested: context.params.userId };
        }
    };

Breaking down what is happening above:

    module.exports = {
        name: 'useParameters',
        description: 'Sample method that requires a parameter, with input validation.',

Each handler is organized into a NodeJS module. This mimics what is already done for Lambda functions today, but
additional metadata fields are exported for Lambda Metadata to process. The `name` field is required for proper
logging and Xray handling (although cases where it is missing are tolerated). `description` is optional but recommended,
and helpful for other tasks like generating API documentation.

Next, one boilerplate line is added:

    entry: (event, context, callback) => lm.processRequest(module.exports, event, context, callback),

`entry` should be defined in AWS Lambda (or Serverless, etc.) as the function's entry point. This line maps the Lambda
entry point to the Lambda Meta request handling wrapper. (I looked for a way to automate this step but Lambda does not
provide the function name or context reference within the callback - if anybody knows how to do this please let me
know!)

Finally, define a `process` function that takes two parameters. `event` is the raw event received from AWS Lambda, and
`context` is the parsed context annotated with the parameters.

    process: (event, context) => {
        return { myData: 'xyz };
    }

`process` is called within a Promise context, and thus may also be asynchronous, returning a Promise that resolves to
the desired output:

    process: (event, context) => {
        return myDB.query('SELECT COUNT(*) AS cnt FROM events')
            .then(result => ({ eventCount: result[0].cnt });
    }

For methods with more complex control flows, a `preprocess` method may be defined. This is called before `process`,
and is also Promise-based. It is a good place to call session handlers and other items that may be refactored into
common libraries to reduce the boilerplate inside the `process` function. It is recomended that `preprocess` be fairly
generic. Business logic related to the function itself should be in `process`:

    preprocess: mySessionLibrary.loadSession,

Note that parameters are logged for debugging purposes, but `password` is automatically filtered for security reasons.
To add additional parameters to be filtered/omitted from logging, set `noLogParams`:

    lm.noLogParams = ['password', 'accessToken', 'bigBodyField'];

## Input Validation

By default, all parameters are considered optional, and are parsed as provided by the caller. It is up to the function
developer to decide whether to use them. The developer may optionally request validation by defining the inputs in the
metadata:

    inputs: {
        userId: {
            // If defined as true, an error will be thrown if the input is not present
            required: true,

            // The Javascript type (as returned by "Type-Check") the input value must be. If omitted, this check is
            // skipped. See https://www.npmjs.com/package/type-check for a list of available types.
            type: 'String',

            // Optional, but recommended for documentation generators. Ignored by this module.
            description: 'String user ID to retrieve.',

            // If defined, a validator to further evaluate the input. Called within a Promise context, so may be async.
            // Note:
            //  1. All validators are called in parallel (e.g. Promise.all([validators]). Resolution is
            //     non-deterministic, and although inputs other than the one being validated MAY be defined, validators
            //     should not rely on this. Use 'preprocess()' for more complex operations on multiple inputs.
            //  2. If a field is required and must be a certain type, those are checked before the validator is called.
            //     Therefore, the below is "safe" because this field is both required and must be a string. If the field
            //     is not required, the validator will not be called if it is missing, so that is also safe. But if the
            //     type check is omitted, the input may not be a string, so the below may fail. It is recommended that
            //     type checks are always included when validators are defined.
            validate: (event, context) => context.params.userId.length === 36
        },
    },

Note that if input validation fails, the `preprocess` and `process` functions are not called. Also, if inputs are
defined, parameters are filtered by the field list. Inputs that are not defined are not carried through to the
processing functions.

## Output Processing

Responses are formatted with a consistent `status` field. Additional fields will be merged in from the return result of
the `process` function. For example, `process(event, context) => ({ environment: 'test' })` would output:

    {
        status: 'OK',
        environment: 'test'
    }

If the return result is not an object (e.g. a literal string) it will be assigned to a field called `result`. For
example, `process(event, context) => ('It worked!')` would output:

    {
        status: 'OK',
        result: 'It worked!'
    }

If an error is thrown by the processor (or preprocessor), it will be logged to the Lambda logs and the message (but not
the call stack, for security reasons) will be output to the caller:

example, `process(event, context) => (new Error('It failed!'))` would output:

    {
        status: 'ERROR',
        error: 'It failed!'
    }

## Function Discovery

Lambda-Meta exports a function that may be useful within `serverless.com` environments. If called during a build process
it can be used to build a definition of known functions based on their metadata:

```
// serverless.js:
const lm = require('lambda-meta);
module.exports = {
    service: 'xyz',
    // ...
    functions: lm.enumerateFunctions('functions/**/*.js'),
};
```

## NOTES

1. Be careful with parameter validation for URL parameters in GET requests. In Lambda, all of these arrive as strings.
Lambda-Meta includes a special case handler if your requested type is 'Number': an incoming string will be checked to
see if it can be converted to a Number, and if so, this will be done silently. But this is just a helper for the most
common use-case. Complex types supported by Type-Check like arrays and objects are not supported. If you need to use
these, it is strongly recommend that you use non-URL parameters (typically body parameters via POST/etc).

## TODO

1. This module depends on `aws-xray-sdk-core`, `lodash`, `type-check`, and `uuid`. At some point we will probably move
 these to be peer dependencies but the author's projects all required these modules anyway so this was left "simple"
 for now. Feel free to submit a PR to change this. :)
2. We need to get some tests into the project. The thing is, testing requires a local Lambda emulator. The author is
 using the [Serverless](serverless.com) framework for his projects, but "SAM Local" is probably a better choice for
 testing an NPM like this. This was left for phase-2 to address.
3. Move `noLogParams` to an option field (e.g. `filterFromLogs: true`) per input field.
