const _ = require('lodash');
const path = require('path');
const glob = require('glob');
const uuidv4 = require('uuid/v4');
const TypeCheck = require('type-check').typeCheck;

// noinspection JSUnresolvedVariable
const isTest = process.env.NODE_ENV === 'test';

class LambdaEvent {
    /* istanbul ignore next */
    constructor() {
        this.queryStringParameters = {};
        this.pathParameters = {};
        this.body = '';
        this.source = '';
    }
}

class LambdaModule {
    /* istanbul ignore next */
    constructor() {
        this.name = 'Test';
        this.inputs = 'Test';
        this.responseHeaders = {};
        this.preprocess = (event, context) => { };
        this.process = (event, context) => { };
    }
}

module.exports = {
    noLogParams: ['password'],

    /**
     * Wrapper for processing requests.
     * @param {LambdaModule} module - The module being processed. Must contain a `name` field.
     * @param {LambdaEvent} event - The event provided by Lambda to the handler.
     * @param {Object} context - The context provided by Lambda to the handler.
     * @param {*} callback - The callback provided by Lambda to the handler.
     * @returns {Promise}
     */
    processRequest(module, event, context, callback) {
        context.callbackWaitsForEmptyEventLoop = false;

        /* istanbul ignore next */
        if (Object.prototype.toString.call(context) !== '[object Object]') {
            context = {};
        }

        /* istanbul ignore next */
        if (!context.awsRequestId) {
            context.awsRequestId = uuidv4();
        }

        /* istanbul ignore next */
        if (!isTest) {
            console.log((module.name || 'Unknown') + '(): Processing request ' + (context.awsRequestId || ''));
        }

        // @see https://github.com/FidelLimited/serverless-plugin-warmup
        if (event.source === 'serverless-plugin-warmup') {
            /* istanbul ignore next */
            if (!isTest) {
                console.log('WarmUP Plugin - Lambda is warm!');
            }

            return callback(null, 'Lambda is warm!')
        }

        return this.parseParameters(module, event, context)
            .then(() => this.validateParameters(module, event, context))
            .then(() => module.preprocess ? module.preprocess(event, context) : true)
            .then(() => module.process(event, context))
            .then(result => this.respondWithSuccess(module, callback, result))
            .catch(e => this.respondWithError(module, callback, e));
    },

    /**
     * Set up event handlers for commonly used patterns:
     *   1. Turning off wait-for-empty-loop,
     *   2. Parse query string and body parameters in order of GET -> POST -> POST (multipart).
     *   3. Log an entry with some helpful tracing metadata (e.g. the request ID)
     *
     * @param {Object} module - The exported module containing the handler and its metadata.
     * @param {Object} event - The event object provided by Lambda.
     * @param {Object} context - The context object provided by Lambda.
     * @returns {PromiseLike}
     */
    parseParameters(module, event, context) {
        context.attachments = {};
        context.params = {};
        context.headers = {};

        return this.parseHeaders(context, event)
            .then(() => this.parseRawEvent(context, event))
            .then(() => this.parsePathParameters(context, event))
            .then(() => this.parseQueryString(context, event))
            .then(() => this.parseBody(context, event))
            .then(() => {
                /* istanbul ignore next */
                if (!isTest) {
                    console.log('Parsed parameters', _.omit(context.params, this.noLogParams));
                }

                return true;
            });
    },

    // HTTP headers, if present, are just carried through. It's up to the (pre)processor to use them.
    parseHeaders(context, event) {
        if (_.has(event, 'headers')) {
            context.headers = _.mapKeys(event.headers, (v, k) => k.toLowerCase());
        }

        return Promise.resolve(true);
    },

    // HTTP calls (may) get a query string with decoded parameters
    parseRawEvent(context, event) {
        // Direct calls include the params in the "event" as a string
        if (_.isPlainObject(event) && !_.has(event, 'queryStringParameters') && !_.has(event, 'pathParameters')) {
            Object.assign(context.params, event);
        }

        // Data can also arrive as a string in some circumstances, but it may be a JSON string. Decode if we can.
        if (_.isString(event) && event[0] === '{') {
            try {
                Object.assign(context.params, JSON.parse(event));
            } catch (e) {
                // NOP
            }
        }

        return Promise.resolve(true);
    },

    // HTTP calls (may) get a query string with decoded parameters
    parseQueryString(context, event) {
        if (_.has(event, 'queryStringParameters')) {
            Object.assign(context.params, event.queryStringParameters);
        }

        return Promise.resolve(true);
    },

    // HTTP calls (may) get a query string with decoded parameters
    parsePathParameters(context, event) {
        if (_.has(event, 'pathParameters')) {
            Object.assign(context.params, event.pathParameters);
        }

        return Promise.resolve(true);
    },

    // POST HTTP calls (may) get a body with decoded parameters
    parseBody(context, event) {
        if (_.isString(event.body) && event.body[0] === '{') {
            try {
                Object.assign(context.params, JSON.parse(event.body));
            } catch (e) {
                // NOP
            }
        }

        return Promise.resolve(true);
    },

    validateParameters(module, event, context) {
        /* istanbul ignore next */
        if (!isTest) {
            console.log('Validating parameters');
        }

        // First, sanitize unwanted inputs, but only if inputs were specified
        const inputFields = Object.keys(module.inputs || {});
        if (inputFields.length > 0) {
            context.params = _.pick(context.params, inputFields);
        }

        // Now validate each one
        const promises = inputFields.map(fieldName => {
            const field = module.inputs[fieldName];

            // Shortcut further evaluations if the field is required and is missing
            if (field.required && !_.has(context.params, fieldName)) {
                return Promise.reject(new Error('Missing required field "' + fieldName + '"'));
            }

            // The remaining checks apply only if the input was provided.
            if (fieldName in context.params) {
                // Special case check for numbers arriving as strings. We get these from Lambda in GET request from
                // the URL processing - EVERYTHING is a string.
                // eslint-disable-line eqeqeq
                // noinspection EqualityComparisonWithCoercionJS
                if (field.type === 'Number' &&
                    !isNaN(context.params[fieldName]) &&
                    parseInt(context.params[fieldName], 10) == context.params[fieldName]) {
                    context.params[fieldName] = parseInt(context.params[fieldName], 10);
                }

                // If the field type is specified, check for it directly
                if (field.type && !TypeCheck(field.type, context.params[fieldName])) {
                    return Promise.reject(new Error('Invalid field "' + fieldName + '", must be of type "' +
                        field.type + '"'));
                }

                // If a validator is specified, call it in a Promise context
                if (_.isFunction(field.validate)) {
                    return Promise.resolve(field.validate(event, context)).then(result => {
                        if (typeof result === 'string') {
                            throw new Error('Invalid field "' + fieldName + '": ' + result);
                        } else if (result !== true) {
                            throw new Error('Invalid field "' + fieldName + '"');
                        }
                    });
                }
            }

            return true;
        });

        return Promise.all(promises);
    },

    /**
     * End the request with an error result.
     *
     * @param {LambdaModule} module - The module being processed. Must contain a `name` field.
     * @param {Function} callback - The callback function provided to the Lambda.
     * @param {Error} err - The error that occurred.
     */
    respondWithError(module, callback, err) {
        /* istanbul ignore next */
        if (!isTest) {
            console.error(err);
        }

        callback(null, {
            statusCode: 500,
            isBase64Encoded: false,
            headers: Object.assign({ 'Cache-Control': 'max-age: 10' }, module.responseHeaders || {}),
            body: JSON.stringify({ status: 'ERROR', error: err.message }),
        });
    },

    /**
     * End the request with a success result.
     *
     * @param {LambdaModule} module - The module being processed. Must contain a `name` field.
     * @param {Function} callback - The callback function provided to the Lambda.
     * @param {Object} [result] - Optional. The result to pass back to the caller.
     */
    respondWithSuccess(module, callback, result) {
        /* istanbul ignore next */
        if (!isTest) {
            console.log('Success!', result);
        }

        const body = { status: 'OK' };
        if (Object.prototype.toString.call(result) === '[object Object]') {
            Object.assign(body, result);
        } else {
            body.result = result;
        }

        callback(null, {
            statusCode: 200,
            isBase64Encoded: false,
            headers: Object.assign({ 'Cache-Control': 'max-age: 10' }, module.responseHeaders || {}),
            body: JSON.stringify(body),
        });
    },

    /**
     * Enumerate the functions defined in a given subdirectory and returned a formatted dictionary of metadata for the
     * functions found. The format returned is suitable for exporting from a `serverless.js` file, but may be useful
     * for other operations (e.g. documentation generation) as well.
     *
     * @param {String} subdir - The wildcard path to scan, e.g. "functions/** /*.js"
     * @returns {Object}
     */
    enumerateFunctions(subdir) {
        const functions = {};
        const files = glob.sync(path.join(process.cwd(), subdir), { nodir: true });

        files.map(file => {
            // eslint-disable-next-line import/no-dynamic-require
            const fn = require(file);

            const functionDef = {
                handler: path.relative('.', file).replace('.js', '.entry'),
                events: [],
            };

            if (fn.timeout) {
                functionDef.timeout = fn.timeout;
            }

            if (fn.memorySize) {
                functionDef.memorySize = fn.memorySize;
            }

            // @see https://github.com/FidelLimited/serverless-plugin-warmup
            if (fn.warmup) {
                functionDef.warmup = fn.warmup;
            }

            if (fn.apiGateway) {
                functionDef.events = functionDef.events || [];
                functionDef.events.push({
                    http: {
                        path: fn.apiGateway.path,
                        method: fn.apiGateway.method,
                        cors: true,
                    }
                });
            }

            if (fn.kong) {
                functionDef.events = functionDef.events || [];
                functionDef.events.push({ kong: fn.kong });
            }

            if (fn.schedule) {
                functionDef.events = functionDef.events || [];
                functionDef.events.push({
                    schedule: fn.schedule
                });
            }

            functions[fn.name] = functionDef;
        });

        return functions;
    },
};
