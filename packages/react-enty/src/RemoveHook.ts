import removeAction from './api/removeAction';
import {useContext, useMemo, Context} from 'react';
import {ProviderContextType} from './util/definitions';

export default function RemoveHookFactory(context: Context<ProviderContextType>) {
    return () => {
        const store = useContext<ProviderContextType | null>(context);
        if (!store) throw 'useRemove must be called in a provider';
        const [state, dispatch] = store;

        return useMemo(
            () => (type: string, id: string) => {
                dispatch(removeAction(type, id));
            },
            [state]
        );
    };
}
