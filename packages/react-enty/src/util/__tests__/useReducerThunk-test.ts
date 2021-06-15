import useReducerThunk from '../useReducerThunk';
import {act, renderHook} from '@testing-library/react-hooks';
import {ObjectSchema} from 'enty';

const action = payload => {
    return {type: 'ENTY_RECEIVE', payload, meta: {responseKey: ''}} as const;
};
const initialState = {
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

describe('useReducerThunk', () => {
    it('will dispatch synchronously if an action returns an object', () => {
        const {result} = renderHook(() =>
            useReducerThunk((aa, bb) => {
                return {...aa, stats: {responseCount: bb.payload}};
            }, initialState)
        );
        expect(result.current[0].stats.responseCount).toBe(0);

        act(() => result.current[1](action(2)));
        expect(result.current[0].stats.responseCount).toBe(2);

        act(() => result.current[1](action(4)));
        act(() => result.current[1](action(10)));
        expect(result.current[0].stats.responseCount).toBe(10);
    });

    it('will call action with dispatch/getState if it returns a function', () => {
        const {result} = renderHook(() =>
            useReducerThunk((aa, bb) => {
                return {...aa, stats: {responseCount: bb.payload}};
            }, initialState)
        );
        act(() =>
            result.current[1]((dispatch, getState) => {
                expect(typeof dispatch).toBe('function');
                expect(typeof getState).toBe('function');
                expect(getState().stats.responseCount).toBe(0);
                dispatch(action(10));
            })
        );
        expect(result.current[0].stats.responseCount).toBe(10);
    });
});
