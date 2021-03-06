// @flow
import type {ComponentType} from 'react';
import type {AbstractComponent} from 'react';
import type Message from 'enty-state/lib/data/Message';

import React from 'react';
import LoadingBoundary from './LoadingBoundary';

type Config = {
    name: string,
    empty?: ComponentType<*>,
    error?: ComponentType<*>,
    fallback?: ComponentType<*>,
    fallbackOnRefetch?: boolean,
    mapResponseToProps?: (response: mixed) => Object
};

type HocProps<R, E> = {
    [name: string]: Message<R, E>
};

const returnObject: (payload?: mixed) => Object = () => ({});

export default function LoadingBoundaryHoc(config: Config) {
    const {
        mapResponseToProps = returnObject,
        name,
        ...remainingConfig
    } = config;

    return function LoadingBoundaryApplier<R, E, Props: {} & HocProps<R, E>>(Component: AbstractComponent<Props>): AbstractComponent<Props> {
        return (props) => {
            const message: Message<R, E> = props[name];
            return <LoadingBoundary
                {...remainingConfig}
                message={message}
                children={(response) => {
                    let childProps = mapResponseToProps(response);
                    childProps[name] = message;
                    return <Component {...props} {...childProps} />;
                }}
            />;
        };
    };
}


