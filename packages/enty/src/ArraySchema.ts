import {NormalizeState} from './util/definitions';
import {DenormalizeState} from './util/definitions';
import {Create} from './util/definitions';
import {StructuralSchemaInterface} from './util/definitions';
import {Merge} from './util/definitions';
import {StructuralSchemaOptions} from './util/definitions';
import {Schema} from './util/definitions';
import {Entities} from './util/definitions';

import REMOVED_ENTITY from './util/RemovedEntity';

export default class ArraySchema<A extends Schema> implements StructuralSchemaInterface<A> {
    shape: A;
    create: Create;
    merge: Merge;

    constructor(shape: A, options: StructuralSchemaOptions = {}) {
        this.shape = shape;
        this.merge = options.merge || ((aa, bb) => bb);
        this.create = options.create || (aa => aa);
    }

    normalize(data: any, entities: Entities = {}): NormalizeState {
        let schemas = {};
        const result = data.map((item: any): any => {
            const {result, schemas: childSchemas} = this.shape.normalize(item, entities);
            Object.assign(schemas, childSchemas);
            return result;
        });

        return {entities, schemas, result: this.create(result)};
    }

    denormalize(denormalizeState: DenormalizeState, path: Array<any> = []): any {
        const {result, entities} = denormalizeState;

        // Filter out any deleted keys
        if (result == null) {
            return result;
        }
        // Map denormalize to our result List.
        return result
            .map((item: any): any => {
                return this.shape.denormalize({result: item, entities}, path);
            })
            .filter(ii => ii !== REMOVED_ENTITY);
    }
}
