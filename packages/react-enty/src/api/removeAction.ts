import {Action} from '../util/definitions';

export default function removeAction(type: string, id: string): Action {
    return {
        type: 'ENTY_REMOVE',
        payload: [type, id],
        meta: {responseKey: ''}
    };
}
