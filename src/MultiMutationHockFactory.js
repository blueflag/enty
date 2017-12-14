//@flow
import EntityMutationHockFactory from './EntityMutationHockFactory';
import {createAllRequestAction} from './EntityApi';
import type {SelectOptions} from './definitions';
import type {SideEffect} from './definitions';

/**
 *
 * @param {function} sideEffect
 * @returns {EntityMutationHock}
 * @memberof module:Factories
 */
export default function MultiMutationHockFactory(sideEffectList: Array<SideEffect>, selectOptions?: SelectOptions): Function {
    const actionPrefix = 'ENTITY';
    const FETCH = `${actionPrefix}_FETCH`;
    const RECEIVE = `${actionPrefix}_RECEIVE`;
    const ERROR = `${actionPrefix}_ERROR`;

    return EntityMutationHockFactory(createAllRequestAction(FETCH, RECEIVE, ERROR, sideEffectList), selectOptions);
}
