import {SideEffect, Dispatch, State, Action} from '../util/definitions';

type Meta = {
    responseKey: string;
    returnResponse?: boolean;
};

export default function createRequestAction(sideEffect: SideEffect) {
    return <P>(requestPayload: P, meta: Meta) => (dispatch: Dispatch, getState: () => State) => {
        const makeAction = (type: Action['type']) => (payload: P) =>
            dispatch({
                type,
                payload,
                meta
            });

        var sideEffectMeta = {
            ...meta,
            dispatch,
            getState
        };

        const fetchAction = makeAction(`ENTY_FETCH`);
        const receiveAction = makeAction(`ENTY_RECEIVE`);
        const errorAction = makeAction(`ENTY_ERROR`);
        const pending = sideEffect(requestPayload, sideEffectMeta);

        fetchAction(null);
        if ('subscribe' in pending) {
            pending.subscribe({
                next: data => receiveAction(data),
                complete: data => receiveAction(data),
                error: error => errorAction(error)
            });
        } else if ('then' in pending) {
            pending.then(receiveAction).catch(err => {
                errorAction(err);
                return meta.returnResponse ? Promise.reject(err) : undefined;
            });
        } else {
            (async () => {
                try {
                    for await (const data of pending) {
                        receiveAction(data);
                    }
                } catch (err) {
                    errorAction(err);
                }
            })();
        }

        return meta.returnResponse ? pending : undefined;
    };
}
