import Hash from './util/Hash';
import visitActionMap from './api/visitActionMap';
import createRequestAction from './api/createRequestAction';
import resetAction from './api/resetAction';
import removeEntityAction from './api/removeAction';

type ActionMap = {
    [key: string]: any;
};

type Visitor = (arg0: {
    actionType: string;
    requestAction: Function;
    resetAction: Function;
    removeEntityAction: Function;
    generateResultKey: Function;
}) => any;

export default function EntityApiFactory(actionMap: ActionMap, visitor: Visitor) {
    return visitActionMap(actionMap, (sideEffect, path) => {
        const actionType = path.join('_').toUpperCase();
        const requestAction = createRequestAction(sideEffect);

        return visitor({
            actionType,
            requestAction,
            resetAction,
            removeEntityAction,
            generateResultKey: (payload) => Hash({payload, actionType})
        });
    });
}
