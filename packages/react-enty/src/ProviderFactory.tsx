import {ComponentType} from 'react';
import {ReactNode} from 'react';

import React, {createContext, useMemo, Context} from 'react';
import useReducerThunk from './util/useReducerThunk';
import EntityReducerFactory from './EntityReducerFactory';
import LoggingReducer from './util/LoggingReducer';
import {State, Action, ProviderContextType} from './util/definitions';
import {Schema} from 'enty';

export type ProviderConfig = {
    schema?: Schema;
    results?: Array<{
        responseKey: string;
        payload: any;
        type?: 'ENTY_RECEIVE' | 'ENTY_ERROR' | 'ENTY_FETCH';
    }>;
};

type ProviderFactoryReturn = {
    Context: Context<ProviderContextType>;
    Provider: ComponentType<any>;
    ProviderHoc: Function;
};

type ProviderProps = {
    children: ReactNode;
    debug?: string;
    initialState?: {};
    meta?: {};
};

export default function ProviderFactory(config: ProviderConfig): ProviderFactoryReturn {
    const {schema, results = []} = config;
    const entityReducer = EntityReducerFactory({schema});
    const Context = createContext<ProviderContextType | null>(null);

    function Provider({children, initialState, debug, meta}: ProviderProps) {
        const firstState = {
            baseSchema: schema,
            schemas: {},
            response: {},
            error: {},
            requestState: {},
            entities: {},
            stats: {
                responseCount: 0
            },
            ...initialState
        };

        const {reducer, intialValue} = useMemo(() => {
            const reducer = debug
                ? (state: State, action: Action) =>
                      LoggingReducer(entityReducer(state, action), action, debug)
                : entityReducer;

            const intialValue = [
                {
                    type: 'ENTY_INIT',
                    payload: null,
                    meta: {...meta, responseKey: 'Unknown'}
                },
                ...results.map<Action>(({responseKey, payload, type = 'ENTY_RECEIVE'}) => ({
                    type,
                    payload,
                    meta: {...meta, responseKey}
                }))
            ].reduce(reducer, firstState);

            return {
                reducer,
                intialValue
            };
        }, [debug, initialState, meta]);

        const storeValue = useReducerThunk(reducer, intialValue, meta);

        return <Context.Provider value={storeValue} children={children} />;
    }

    const ProviderHoc = () => (Component: ComponentType<any>) => ({
        initialState,
        ...rest
    }: ProviderProps) => (
        <Provider initialState={initialState}>
            <Component {...rest} />
        </Provider>
    );

    return {
        Provider,
        ProviderHoc,
        Context
    };
}
