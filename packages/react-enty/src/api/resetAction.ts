import {Action} from '../util/definitions';

export default function resetAction(responseKey: string): Action {
    return {
        type: 'ENTY_RESET',
        payload: null,
        meta: {responseKey}
    };
}
