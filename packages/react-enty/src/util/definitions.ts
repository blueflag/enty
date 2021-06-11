import {Schema} from 'enty';

export type Observable = {
    subscribe: Function;
};

export type GetState = () => State;
export type Dispatch = (action: Action | ((dispatch: Dispatch, getState: GetState))) => State;
export type AsyncType = Promise<any> | Observable | AsyncGenerator<any, any, any>;
export type SideEffect = (arg0: any, arg1: Object) => AsyncType;
export type ProviderContextType = [State, Dispatch, Record<string, any>];

export type State = {
    baseSchema: Schema;
    schemas: Record<string, Schema>;
    response: Record<string, any>;
    error: Record<string, any>;
    requestState: Record<string, any>;
    entities: Record<string, any>;
    stats: {
        responseCount: number;
    };
};

export type Action = {
    type: 'ENTY_FETCH' | 'ENTY_ERROR' | 'ENTY_RECEIVE' | 'ENTY_REMOVE' | 'ENTY_RESET' | 'ENTY_INIT';
    payload?: any;
    meta: {
        responseKey: string;
        returnResponse?: boolean;
    };
};
