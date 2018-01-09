const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const AWSXRay = require('aws-xray-sdk-core');
const TypeCheck = require('type-check').typeCheck;

const isTest = process.env.NODE_ENV === 'test';

AWSXRay.enableManualMode();

class LambdaEvent {
    constructor() {
        this.queryStringParameters = {};
        this.pathParameters = {};
        this.body = '';
    }
}

class LambdaModule {
    constructor() {
        this.name = 'Test';
        this.inputs = 'Test';
        this.preprocess = (event, context) => { };
        this.process = (event, context) => { };
    }
}

module.exports = {
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

        const segment = new AWSXRay.Segment(module.name || 'Unknown');

        /* istanbul ignore next */
        if (Object.prototype.toString.call(context) !== '[object Object]') {
            context = {};
        }

        /* istanbul ignore next */
        if (!context.awsRequestId) {
            context.awsRequestId = uuidv4();
        }

        console.log((module.name || 'Unknown') + '(): Processing request ' + (context.awsRequestId || ''));

        return this.parseParameters(module, event, context)
            .then(() => this.validateParameters(module, event, context))
            .then(() => module.preprocess ? module.preprocess(event, context) : true)
            .then(() => module.process(event, context))
            .then(result => {
                segment.close();
                this.respondWithSuccess(callback, result);
            })
            .catch(e => {
                segment.close(e);
                this.respondWithError(callback, e);
            });
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
     * @returns {Promise}
     */
    parseParameters(module, event, context) {
        context.params = {};

        this.parsePathParameters(context, event);
        this.parseQueryString(context, event);
        this.parseBody(context, event);

        console.log('Parsed parameters', _.omit(context.params, ['password', 'idToken', 'accessToken']));

        // For future expansion, we made this promise-based.
        return Promise.resolve(true);
    },

    // HTTP calls (may) get a query string with decoded parameters
    parseQueryString(context, event) {
        if (_.has(event, 'queryStringParameters')) {
            Object.assign(context.params, event.queryStringParameters);
        }
    },

    // HTTP calls (may) get a query string with decoded parameters
    parsePathParameters(context, event) {
        if (_.has(event, 'pathParameters')) {
            Object.assign(context.params, event.pathParameters);
        }
    },

    // POST HTTP calls (may) get a body with decoded parameters
    parseBody(context, event) {
        if (_.has(event, 'body')) {
            try {
                Object.assign(context.params, JSON.parse(event.body));
            } catch (e) {
                // NOP
            }
        }
    },

    validateParameter(fieldName, field, event, context) {
        return Promise.resolve(field.validate(event, context))
            .then(result => ((result === true) ? true : Promise.reject(new Error('Invalid ' + fieldName))));
    },

    validateParameters(module, event, context) {
        // First, sanitize unwanted inputs
        const inputFields = Object.keys(module.inputs || {});
        context.params = _.pick(context.params, inputFields);

        // Now validate each one
        const promises = inputFields.map(fieldName => {
            const field = module.inputs[fieldName];

            // Shortcut further evaluations if the field is required and is missing
            if (field.required && !_.has(context.params, fieldName)) {
                return Promise.reject(new Error('Missing required field ' + fieldName));
            }

            // The remaining checks apply only if the input was provided.
            if (fieldName in context.params) {
                // If the field type is specified, check for it directly
                if (field.type && TypeCheck(field.type, context.params[fieldName])) {
                    return Promise.reject(new Error('Invalid field, "' + fieldName + '" must be "' + field.type) + '"');
                }

                // If a validator is specified, call it
                if (_.isFunction(field.validate)) {
                    return this.validateParameter(fieldName, field, event, context);
                }
            }

            return true;
        });

        return Promise.all(promises);
    },

    /**
     * End the request with an error result.
     *
     * @param {Function} callback - The callback function provided to the Lambda.
     * @param {Error} err - The error that occurred.
     */
    respondWithError(callback, err) {
        /* istanbul ignore next */
        if (!isTest) {
            console.error(err);
        }

        callback(null, {
            statusCode: 500,
            body: JSON.stringify({ status: 'ERROR', error: err.message }),
        });
    },

    /**
     * End the request with a success result.
     *
     * @param {Function} callback - The callback function provided to the Lambda.
     * @param {Object} [result] - Optional. The result to pass back to the caller.
     */
    respondWithSuccess(callback, result) {
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
            body: JSON.stringify(body),
        });
    }
};
