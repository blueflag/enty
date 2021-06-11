import {NormalizeState} from './util/definitions';
import {DenormalizeState} from './util/definitions';
import {EntitySchemaInterface} from './util/definitions';
import {StructuralSchemaInterface} from './util/definitions';
import {Create} from './util/definitions';
import {Merge} from './util/definitions';
import {Entities} from './util/definitions';

/**
 * IdSchema
 */
export default class IdSchema<A extends EntitySchemaInterface<any>>
    implements StructuralSchemaInterface<A> {
    shape: A;
    create: Create;
    merge: Merge;

    constructor(shape: A, options: {create?: Create} = {}) {
        this.shape = shape;
        this.create = options.create || (id => ({id}));
    }

    normalize(data: unknown, entities: Entities = {}): NormalizeState {
        const {result, schemas} = this.shape.normalize(this.create(data), entities);
        return {result, schemas, entities};
    }

    denormalize(denormalizeState: DenormalizeState, path: Array<any> = []): any {
        return this.shape.denormalize(denormalizeState, path);
    }
}
