import React from 'react';

type Config = {
    useRemove: Function;
};

type HockConfig = {
    name: string;
};

export default function RemoveHocFactory({useRemove}: Config) {
    return (hockConfig: HockConfig) => {
        const {name = 'onRemove'} = hockConfig;

        return (Component: any) => (props: any) => {
            const onRemove = useRemove();

            const newProps = {
                ...props,
                [name]: onRemove
            };

            return <Component {...newProps} />;
        };
    };
}
