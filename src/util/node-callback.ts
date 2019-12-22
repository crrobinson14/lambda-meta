export interface NodeCallback<T> {
    (err: any, result?: undefined | null): void;

    (err: undefined | null, result: T): void;
}

export interface NodeCallbackAny {
    (err: any, result?: undefined | null): void;

    (err: undefined | null, result: any): void;
}
