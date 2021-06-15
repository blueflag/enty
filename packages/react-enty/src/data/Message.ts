import RequestState from '../data/RequestState';

type Request = (payload?: unknown, config?: {returnResponse: boolean}) => any;

type MessageInput<R, E extends Error = Error> = {
    requestError?: E;
    response?: R;
    removeEntity: (type: string, id: string) => void;
    request: Request;
    reset: () => void;
    responseKey: string;
};

//}

export abstract class BaseMessage<R = void, E extends Error = Error> {
    response?: R;
    requestError?: E;
    request: Request;
    reset: () => void;
    removeEntity: (type: string, id: string) => void;
    responseKey: string;
    abstract readonly state: string;
    abstract readonly isEmpty: boolean;
    abstract readonly isFetching: boolean;
    abstract readonly isRefetching: boolean;
    abstract readonly isPending: boolean;
    abstract readonly isSuccess: boolean;
    abstract readonly isError: boolean;
    abstract readonly requestState: RequestState;

    constructor(props: MessageInput<R, E>) {
        this.responseKey = props.responseKey;
        this.response = props.response;
        this.requestError = props.requestError;
        this.request = props.request;
        this.reset = props.reset;
        this.removeEntity = props.removeEntity;
    }

    get data() {
        return this.response;
    }

    get error() {
        return this.requestError;
    }

    //
    // Response Getters

    get<K extends keyof R, N = undefined>(key: K, notSetValue?: N): R[K] | N {
        if (!(key in (this.response || {}))) return notSetValue;
        return this.response?.[key];
    }

    getIn<K1 extends keyof R, K2 extends keyof R[K1], K3 extends keyof R[K1][K2]>(
        path: [K1, K2, K3]
    ): R[K1][K2][K3];
    getIn<K1 extends keyof R, K2 extends keyof R[K1]>(path: [K1, K2]): R[K1][K2];
    getIn<K1 extends keyof R>(path: [K1]): R[K1];
    getIn(path: string[], notSetValue?: any): any {
        return path.reduce((value, key) => {
            if (value === Object(value) && key in value) return value[key];
            return notSetValue;
        }, this.response || {});
    }

    //
    // Updating Methods

    update<B>(updater): Message<B> {
        return unknownMessage(updater({...this, requestState: this.requestState}));
    }

    //
    // empty

    static empty<R>(messageProps: MessageInput<R>) {
        return new EmptyMessage({
            ...messageProps,
            response: undefined,
            requestError: undefined
        });
    }
    toEmpty(): EmptyMessage {
        return BaseMessage.empty({...(this as MessageInput<R>)});
    }

    static fetching<R>(messageProps?: MessageInput<R>) {
        return new FetchingMessage({
            ...messageProps,
            response: undefined
        });
    }
    toFetching(): Message<R, E> {
        return BaseMessage.fetching({...(this as MessageInput<R>)});
    }

    static refetching<R>(messageProps?: MessageInput<R>) {
        return new RefetchingMessage({...messageProps});
    }
    toRefetching(): Message<R, E> {
        return BaseMessage.refetching({...(this as MessageInput<R>)});
    }

    static success<R>(messageProps?: MessageInput<R>) {
        return new SuccessMessage({...messageProps});
    }
    toSuccess(): Message<R, E> {
        return BaseMessage.success({...(this as MessageInput<R>)});
    }

    static error<R>(messageProps?: MessageInput<R>) {
        return new ErrorMessage({...messageProps});
    }
    toError() {
        return BaseMessage.error({...(this as MessageInput<R, E>)});
    }
}

export class EmptyMessage extends BaseMessage {
    readonly state = 'empty';
    readonly requestState = RequestState.empty();
    readonly isEmpty = true;
    readonly isFetching = false;
    readonly isRefetching = false;
    readonly isPending = false;
    readonly isSuccess = false;
    readonly isError = false;
}

export class FetchingMessage extends BaseMessage {
    readonly state = 'fetching';
    readonly requestState = RequestState.fetching();
    readonly isEmpty = false;
    readonly isFetching = true;
    readonly isRefetching = false;
    readonly isPending = true;
    readonly isSuccess = false;
    readonly isError = false;
}

export class RefetchingMessage<T> extends BaseMessage<T> {
    response: T;
    readonly state = 'refetching';
    readonly requestState = RequestState.refetching();
    readonly isEmpty = false;
    readonly isFetching = false;
    readonly isRefetching = true;
    readonly isPending = true;
    readonly isSuccess = false;
    readonly isError = false;
    constructor(input: MessageInput<T>) {
        super(input);
        this.response = input.response;
    }
}

export class SuccessMessage<T> extends BaseMessage<T> {
    response: T;
    readonly state = 'success';
    readonly requestState = RequestState.success();
    readonly isEmpty = false;
    readonly isFetching = false;
    readonly isRefetching = false;
    readonly isPending = false;
    readonly isSuccess = true;
    readonly isError = false;
    constructor(input: MessageInput<T>) {
        super(input);
        this.response = input.response;
    }
}

export class ErrorMessage<T, E extends Error> extends BaseMessage<T, E> {
    requestError: E;
    readonly state = 'success';
    readonly requestState = RequestState.error();
    readonly isEmpty = false;
    readonly isFetching = false;
    readonly isRefetching = false;
    readonly isPending = false;
    readonly isSuccess = false;
    readonly isError = true;
    constructor(input: MessageInput<T, E>) {
        super(input);
        this.requestError = input.requestError;
    }
}

export type Message<T, E extends Error = Error> =
    | EmptyMessage
    | FetchingMessage
    | RefetchingMessage<T>
    | SuccessMessage<T>
    | ErrorMessage<T, E>;

export function unknownMessage<T, E extends Error = Error>(input: any): Message<T, E> {
    let message;
    if (input.requestState.isEmpty) message = EmptyMessage;
    if (input.requestState.isFetching) message = FetchingMessage;
    if (input.requestState.isRefetching) message = RefetchingMessage;
    if (input.requestState.isSuccess) message = SuccessMessage;
    if (input.requestState.isError) message = ErrorMessage;

    return new message({
        removeEntity: input.removeEntity,
        request: input.request,
        requestError: input.requestError,
        reset: input.reset,
        response: input.response,
        responseKey: input.responseKey
    });
}

export default Message;
