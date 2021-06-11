import {Dispatch, State, GetState, Action} from './definitions';
import {useRef, useState} from 'react';

export default function useThunkReducer<T extends State, M>(
    reducer: (state: T, action: Action) => T,
    initialState: T,
    meta?: M
): [State, Dispatch, M] {
    const [hookState, setHookState] = useState<T>(initialState);

    // State management.
    const state = useRef<T>(hookState);
    const getState = () => state.current;
    const setState = (newState: T) => {
        state.current = newState;
        setHookState(newState);
    };

    // Reducer and augmented dispatcher.
    const reduce = (action: Action) => reducer(getState(), action);
    const dispatch: Dispatch = action =>
        typeof action === 'function' ? action(dispatch, getState) : setState(reduce(action));
    return [hookState, dispatch, meta];
}
