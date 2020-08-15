import {ComponentType} from 'react';
import Message from 'enty-state/lib/data/Message';

import React from 'react';

type Props<R> = {
    children: (response: unknown, arg1: {refetching: boolean}) => any;
    message: Message<R>;
    fallbackOnRefetch?: boolean;
    fallback?: ComponentType<any>;
    error?: ComponentType<any>;
    empty?: ComponentType<any>;
};

const NullRender = () => null;

export default function LoadingBoundary<R>(props: Props<R>) {
    // Config
    const {children} = props;
    const {message} = props;
    const {fallbackOnRefetch = false} = props;
    const {fallback: Fallback = NullRender} = props;
    const {empty: Empty = NullRender} = props;
    const {error: Error = NullRender} = props;

    // Possible States
    const emptyState = () => <Empty />;
    const errorState = () => <Error error={message.requestError} />;
    const fallbackState = () => <Fallback />;
    const renderState = () =>
        children(message.response, {
            refetching: message.requestState.isRefetching === true
        });

    // Render
    return message.requestState
        .emptyMap(emptyState)
        .fetchingMap(fallbackState)
        .refetchingMap(fallbackOnRefetch ? fallbackState : renderState)
        .successMap(renderState)
        .errorMap(errorState)
        .value();
}
