import {Schema} from 'enty';
import {State, Action} from './util/definitions';
import {REMOVED_ENTITY} from 'enty';
import RequestState from './data/RequestState';

export default function EntityReducerFactory(config: {schema?: Schema}) {
    const {schema} = config;

    return function EntityReducer(
        previousState: State | null,
        {type, payload, meta = {responseKey: ''}}: Action
    ): State {
        let state = previousState || {
            baseSchema: schema,
            schemas: {},
            response: {},
            error: {},
            requestState: {},
            entities: {},
            stats: {
                responseCount: 0
            }
        };

        const {responseKey} = meta;
        const nextStats = {...state.stats, responseCount: state.stats.responseCount + 1};

        function update(key: keyof State, subKey: string, value: any) {
            return {...state, [key]: {...state[key], [subKey]: value}};
        }

        switch (type) {
            case 'ENTY_FETCH': {
                const requestState = state.requestState[responseKey];
                const hasResponse = responseKey in state.response;

                if (requestState && hasResponse) {
                    state = update('requestState', responseKey, RequestState.refetching());
                } else {
                    state = update('requestState', responseKey, RequestState.fetching());
                }
                return state;
            }

            case 'ENTY_ERROR':
                return {
                    ...state,
                    requestState: {
                        ...state.requestState,
                        [responseKey]: RequestState.error(payload)
                    },
                    error: {
                        ...state.error,
                        [responseKey]: payload
                    }
                };

            case 'ENTY_RECEIVE':
                // set success action before payload tests
                // to make sure the request state is still updated even if there is no payload
                state = update('requestState', responseKey, RequestState.success());

                if (payload) {
                    if (schema) {
                        const {result, entities, schemas} = schema.normalize(payload, {
                            ...state.entities
                        });

                        return {
                            ...state,
                            entities,
                            response: {...state.response, [responseKey]: result},
                            schemas: {...state.schemas, ...schemas},
                            stats: nextStats
                        };
                    } else {
                        return {
                            ...state,
                            response: {...state.response, [responseKey]: payload},
                            stats: nextStats
                        };
                    }
                }

                return state;

            case 'ENTY_REMOVE':
                const [type, id] = payload;
                return {
                    ...state,
                    entities: {
                        ...state.entities,
                        [type]: {
                            ...state.entities[type],
                            [id]: REMOVED_ENTITY
                        }
                    },
                    stats: nextStats
                };

            case 'ENTY_RESET':
                return {
                    ...state,
                    stats: nextStats,
                    requestState: {...state.requestState, [responseKey]: RequestState.empty()},
                    response: {...state.response, [responseKey]: undefined}
                };

            default:
                return state;
        }
    };
}
