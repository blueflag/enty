type RequestStateProps = {
    isEmpty?: boolean;
    isFetching?: boolean;
    isRefetching?: boolean;
    isSuccess?: boolean;
    isError?: boolean;
};

export default class RequestState {
    val: any;
    isEmpty: boolean | null | undefined;
    isFetching: boolean | null | undefined;
    isRefetching: boolean | null | undefined;
    isSuccess: boolean | null | undefined;
    isError: boolean | null | undefined;

    constructor(value: any, props: RequestStateProps) {
        this.isEmpty = props.isEmpty;
        this.isFetching = props.isFetching;
        this.isRefetching = props.isRefetching;
        this.isSuccess = props.isSuccess;
        this.isError = props.isError;
        this.val = value;
    }

    value(defaultValue: any = null) {
        return this.val == null ? defaultValue : this.val;
    }

    //
    // Empty

    static empty(value?: any): RequestState {
        return new RequestState(value, {isEmpty: true});
    }
    emptyFlatMap(fn: (arg0: any) => RequestState): RequestState {
        return this.isEmpty ? fn(this.val) : this;
    }
    emptyMap(fn: (arg0: any) => any): RequestState {
        return this.isEmpty ? RequestState.empty(fn(this.val)) : this;
    }
    toEmpty(): RequestState {
        return RequestState.empty(this.val);
    }

    //
    // Fetching

    static fetching(value?: any): RequestState {
        return new RequestState(value, {isFetching: true});
    }
    fetchingFlatMap(fn: (arg0: any) => RequestState): RequestState {
        return this.isFetching ? fn(this.val) : this;
    }
    fetchingMap(fn: (arg0: any) => any): RequestState {
        return this.isFetching ? RequestState.fetching(fn(this.val)) : this;
    }
    toFetching(): RequestState {
        return RequestState.fetching(this.val);
    }

    //
    // Refetching

    static refetching(value?: any): RequestState {
        return new RequestState(value, {isRefetching: true});
    }
    refetchingFlatMap(fn: (arg0: any) => RequestState): RequestState {
        return this.isRefetching ? fn(this.val) : this;
    }
    refetchingMap(fn: (arg0: any) => any): RequestState {
        return this.isRefetching ? RequestState.refetching(fn(this.val)) : this;
    }
    toRefetching(): RequestState {
        return RequestState.refetching(this.val);
    }

    //
    // Success

    static success(value?: any): RequestState {
        return new RequestState(value, {isSuccess: true});
    }
    successFlatMap(fn: (arg0: any) => RequestState): RequestState {
        return this.isSuccess ? fn(this.val) : this;
    }
    successMap(fn: (arg0: any) => any): RequestState {
        return this.isSuccess ? RequestState.success(fn(this.val)) : this;
    }
    toSuccess(): RequestState {
        return RequestState.success(this.val);
    }

    //
    // Error

    static error(value?: any): RequestState {
        return new RequestState(value, {isError: true});
    }
    errorFlatMap(fn: (arg0: any) => RequestState): RequestState {
        return this.isError ? fn(this.val) : this;
    }
    errorMap(fn: (arg0: any) => any): RequestState {
        return this.isError ? RequestState.error(fn(this.val)) : this;
    }
    toError(): RequestState {
        return RequestState.error(this.val);
    }
}
