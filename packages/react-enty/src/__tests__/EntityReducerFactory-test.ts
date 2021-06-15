import EntityReducerFactory from '../EntityReducerFactory';
import RequestState from '../data/RequestState';
import {State} from '../util/definitions';
import {EntitySchema, ObjectSchema, ArraySchema} from 'enty';
import {REMOVED_ENTITY} from 'enty';
import resetAction from '../api/resetAction';

//
// Schemas
//

const baseState = {
    baseSchema: new ObjectSchema({}),
    schemas: {},
    response: {},
    error: {},
    requestState: {},
    entities: {},
    stats: {
        responseCount: 0
    }
};

var author = new EntitySchema('author', {
    id: ii => ii?.fullnameId,
    shape: new ObjectSchema({})
});

var topListings = new EntitySchema('topListings', {
    id: ii => ii?.fullnameId,
    shape: new ObjectSchema({author})
});

var subreddit = new EntitySchema('subreddit', {
    id: ii => ii?.fullnameId,
    shape: new ObjectSchema({
        topListings: new ArraySchema(topListings)
    })
});

const schema = new ObjectSchema({
    subreddit
});

const EntityReducer = EntityReducerFactory({schema});

// Mock data

const INITIAL_STATE = {
    ...baseState,
    thing: {
        abc: '123'
    }
};

test('EntityReducerFactory normalizes a reuslt', () => {
    const examplePayload = {
        subreddit: {
            name: 'MechanicalKeyboards',
            fullnameId: 'MK',
            topListings: [
                {fullnameId: 'CT', title: 'Cool title'},
                {fullnameId: 'NT', title: 'Nice title'}
            ]
        }
    };

    const exampleReceiveAction = {
        type: 'ENTY_RECEIVE' as const,
        meta: {responseKey: 'TEST'},
        payload: examplePayload
    };

    const state = EntityReducer(undefined, exampleReceiveAction);
    expect(state.entities.subreddit.MK.fullnameId).toBe(examplePayload.subreddit.fullnameId);
});

describe('EntityReducer requestState', () => {
    test('requestState is Fetching when action is _FETCH', () => {
        const data = EntityReducer(undefined, {
            type: 'ENTY_FETCH' as const,
            payload: null,
            meta: {responseKey: 'TEST'}
        }).requestState.TEST;
        expect(data.isFetching).toBe(true);
    });

    test('requestState is Refetching when action is _FETCH and requestState and response already exists', () => {
        const data = EntityReducer(
            {
                ...baseState,
                requestState: {TEST: RequestState.fetching()},
                response: {TEST: {}}
            },
            {type: 'ENTY_FETCH' as const, payload: null, meta: {responseKey: 'TEST'}}
        ).requestState.TEST;
        expect(data.isRefetching).toBe(true);
    });

    test('requestState will not be refecthing if two fetching fire in a row', () => {
        let stateA = EntityReducer(null, {
            type: 'ENTY_FETCH' as const,
            payload: null,
            meta: {responseKey: 'foo'}
        });
        let stateB = EntityReducer(stateA, {
            type: 'ENTY_FETCH' as const,
            payload: null,
            meta: {responseKey: 'foo'}
        });
        expect(stateB.requestState.foo.isRefetching).toBe(undefined);
        expect(stateB.requestState.foo.isFetching).toBe(true);
    });

    test('will not be set if action type does not match _(FETCH|ERROR|RECIEVE)', () => {
        return expect(
            EntityReducer(undefined, {
                // @ts-ignore - intentionally bad types
                type: 'nothing',
                payload: null,
                meta: {responseKey: 'nothing'}
            }).requestState.nothing
        ).toBeUndefined();
    });

    // @FIXME: this is testing silly behaviour in the reducer.
    // The reducer should not infer result keys from the action type
    test('will be set to payload if the action matches  _ERROR', () => {
        return expect(
            EntityReducer(undefined, {
                type: 'ENTY_ERROR',
                payload: 'errorPayload',
                meta: {responseKey: 'TEST'}
            }).requestState.TEST.value()
        ).toBe('errorPayload');
    });
});

describe('EntityReducer Config', () => {
    const action = type => ({type, payload: null, meta: {responseKey: type}} as const);
    test('the supplied schema is not mutated when reducing', () => {
        // @ts-ignore - intentionally bad types
        expect(EntityReducer(undefined, action('nothing')).baseSchema).toBe(schema);
    });

    test('response starts with an empty object', () => {
        // @ts-ignore - intentionally bad types
        expect(EntityReducer(undefined, action('nothing')).response).toEqual({});
    });

    test('will not change state if actions do not match _(FETCH|RECIEVE|ERROR)', () => {
        // @ts-ignore - intentionally bad types
        const reducedState = EntityReducer(baseState, action('nothing'));
        expect(reducedState).toBe(baseState);

        expect(EntityReducer(INITIAL_STATE as State, action('FOO'))).toBe(INITIAL_STATE);
        expect(EntityReducer(INITIAL_STATE as State, action('FOO_FETCH_BLAH'))).toBe(INITIAL_STATE);

        // check the reverse
        expect(EntityReducer(INITIAL_STATE as State, action('ENTY_FETCH'))).not.toBe(INITIAL_STATE);
        expect(EntityReducer(INITIAL_STATE as State, action('ENTY_ERROR'))).not.toBe(INITIAL_STATE);
        expect(EntityReducer(INITIAL_STATE as State, action('ENTY_RECEIVE'))).not.toBe(
            INITIAL_STATE
        );
    });

    test('does not have to be called with meta', () => {
        // @ts-ignore - initially bad types
        expect(() => EntityReducer(undefined, {})).not.toThrow();
    });
});

describe('EntityReducer Normalizing', () => {
    test('it will store normalized results on _result.responseKey', () => {
        const action = {
            type: 'ENTY_RECEIVE',
            meta: {responseKey: 'TEST'},
            payload: {
                subreddit: {
                    fullnameId: 'MK',
                    other: 'foo'
                }
            }
        } as const;

        return expect(EntityReducer(undefined, action).response.TEST.subreddit).toBe('MK');
    });

    test('it will store normalized data on _entities.type.id', () => {
        const action = {
            type: 'ENTY_RECEIVE',
            meta: {responseKey: 'TEST'},
            payload: {
                subreddit: {
                    fullnameId: 'MK',
                    other: 'foo'
                }
            }
        } as const;

        return expect(EntityReducer(undefined, action).entities.subreddit.MK).toEqual(
            action.payload.subreddit
        );
    });

    test('it will store deep entities', () => {
        const action = {
            type: 'ENTY_RECEIVE',
            meta: {responseKey: 'TEST'},
            payload: {
                subreddit: {
                    fullnameId: 'MK',
                    topListings: [{fullnameId: 'FOO'}, {fullnameId: 'BAR'}]
                }
            }
        } as const;

        return expect(EntityReducer(undefined, action).entities.topListings.FOO).toEqual({
            fullnameId: 'FOO'
        });
    });

    test('it can merge two normalizations correctly', () => {
        const action = payload =>
            ({
                type: 'ENTY_RECEIVE',
                meta: {responseKey: 'TEST'},
                payload
            } as const);

        const payloadA = {
            subreddit: {
                name: 'MechanicalKeyboards',
                code: '123',
                fullnameId: 'MK',
                topListings: [
                    {
                        fullnameId: 'CT',
                        title: 'Cool title'
                    },
                    {
                        fullnameId: 'NT',
                        title: 'Nice title'
                    }
                ],
                tags: ['A', 'B']
            }
        };

        const payloadB = {
            subreddit: {
                name: 'MechanicalKeyboards!',
                fullnameId: 'MK',
                topListings: [
                    {
                        fullnameId: 'NT',
                        title: 'Nice title!'
                    },
                    {
                        fullnameId: 'GL',
                        title: 'Good luck'
                    }
                ],
                tags: ['C', 'D']
            }
        };

        const mergeStateOne = EntityReducer(undefined, action(payloadA));
        const mergeStateTwo = EntityReducer(mergeStateOne, action(payloadB));

        expect(mergeStateTwo.entities.subreddit.MK.name).toBe(payloadB.subreddit.name);
        expect(mergeStateTwo.entities.subreddit.MK.tags).toEqual(payloadB.subreddit.tags);
        expect(mergeStateTwo.entities.subreddit.MK.code).toBe(payloadA.subreddit.code);
        expect(mergeStateTwo.entities.topListings.NT).toEqual(payloadB.subreddit.topListings[0]);
        expect(mergeStateTwo.entities.topListings.CT).toEqual(payloadA.subreddit.topListings[0]);
        expect(mergeStateTwo.entities.topListings.GL).toEqual(payloadB.subreddit.topListings[1]);
    });
});

describe('no schema reducer', () => {
    it('will not normalize if a schema is not provided', () => {
        const reducer = EntityReducerFactory({});
        const stateA = reducer(undefined, {
            type: 'ENTY_RECEIVE',
            payload: 'FOO',
            meta: {responseKey: '123'}
        });

        expect(stateA.entities).toEqual({});
        expect(stateA.response['123']).toBe('FOO');
        expect(stateA.response['456']).toBeUndefined();
        expect(stateA.stats.responseCount).toBe(1);

        const stateB = reducer(stateA, {
            type: 'ENTY_RECEIVE',
            payload: 'BAR',
            meta: {responseKey: '456'}
        });
        expect(stateB.response['123']).toBe('FOO');
        expect(stateB.response['456']).toBe('BAR');
        expect(stateB.stats.responseCount).toBe(2);
    });
});

describe('remove entity', () => {
    it('will replace a removed entity with REMOVED_ENTITY sentinel', () => {
        const initialState = {
            ...baseState,
            entities: {
                foo: {bar: 'ENTITY'},
                baz: {qux: 'ENTITY'}
            }
        };
        const reducer = EntityReducerFactory({});
        const state = reducer(initialState, {
            type: 'ENTY_REMOVE' as const,
            payload: ['foo', 'bar'],
            meta: {responseKey: ''}
        });
        expect(state.entities.foo.bar).toBe(REMOVED_ENTITY);
        expect(state.entities.baz.qux).not.toBe(REMOVED_ENTITY);
    });
});

describe('ENTY_RESET', () => {
    it('will delete response and set requestState to empty', () => {
        const reducer = EntityReducerFactory({});

        const stateA = reducer(undefined, {
            type: 'ENTY_RECEIVE',
            payload: 'FOO',
            meta: {responseKey: '123'}
        });
        expect(stateA.response['123']).toBe('FOO');
        expect(stateA.requestState['123'].isSuccess).toBe(true);
        expect(stateA.stats.responseCount).toBe(1);

        const stateB = reducer(stateA, resetAction('123'));
        expect(stateB.response['123']).toBeUndefined();
        expect(stateB.requestState['123'].isSuccess).toBeUndefined();
        expect(stateB.requestState['123'].isEmpty).toBe(true);
        expect(stateB.stats.responseCount).toBe(2);
    });
});
