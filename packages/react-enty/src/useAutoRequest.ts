import {useEffect} from 'react';

export default function useAutoRequest(fn: Function, deps: Array<unknown> = []) {
    return useEffect(() => {
        fn();
    }, deps);
}
