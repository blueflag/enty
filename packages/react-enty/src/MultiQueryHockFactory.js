//@flow
import type {HockOptionsInput} from './util/definitions';
import type {SideEffect} from './util/definitions';

import EntityQueryHockFactory from './EntityQueryHockFactory';
import {createAllRequestAction} from './EntityApi';
import Deprecated from './util/Deprecated';

/**
 * Lorem ipsum dolor sit amet, consectetur _adipisicing_ elit. Commodi at optio quos animi aut officia
 * in enim inventore quasi harum, deleniti praesentium, **sed** cumque dolor impedit necessitatibus. Nobis, blanditiis, quo!
 */
function MultiQueryHockFactory(sideEffectList: Array<SideEffect>, hockOptions?: HockOptionsInput): Function {
    const actionPrefix = 'ENTITY';
    const FETCH = `${actionPrefix}_FETCH`;
    const RECEIVE = `${actionPrefix}_RECEIVE`;
    const ERROR = `${actionPrefix}_ERROR`;

    Deprecated('MultiQueryHockFactory has been deprecated in favor of much improved MultiRequestHock. Check the docs for usage instructions.');
    return EntityQueryHockFactory(createAllRequestAction(FETCH, RECEIVE, ERROR, sideEffectList), hockOptions);
}

export default MultiQueryHockFactory;
