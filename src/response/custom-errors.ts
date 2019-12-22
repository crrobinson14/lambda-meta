export class BadRequestError extends Error {
    responseHttpCode = 400;

    constructor(message?: string, extraFields?: any) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = 'BadRequestError';
        this.message = message || '400: Bad Request';
        Object.assign(this, extraFields || {});
    }
}

export class AuthRequiredError extends Error {
    responseHttpCode = 401;

    constructor(message?: string, extraFields?: any) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = 'AuthRequiredError';
        this.message = message || '401: Authorization Required';
        Object.assign(this, extraFields || {});
    }
}

export class AccessDeniedError extends Error {
    responseHttpCode = 403;

    constructor(message?: string, extraFields?: any) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = 'AccessDeniedError';
        this.message = message || '403: Access Denied';
        Object.assign(this, extraFields || {});
    }
}

export class NotFoundError extends Error {
    responseHttpCode = 404;

    constructor(message?: string, extraFields?: any) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = 'NotFoundError';
        this.message = message || '404: Not Found';
        Object.assign(this, extraFields || {});
    }
}

export class TooManyRequestsError extends Error {
    responseHttpCode = 429;

    constructor(message?: string, extraFields?: any) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = 'TooManyRequestsError';
        this.message = message || '429: Too Many Requests';
        Object.assign(this, extraFields || {});
    }
}

export class ServerError extends Error {
    responseHttpCode = 500;

    constructor(message?: string, extraFields?: any) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = 'ServerError';
        this.message = message || '500: Server Error';
        Object.assign(this, extraFields || {});
    }
}
