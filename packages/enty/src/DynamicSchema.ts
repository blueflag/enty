import {NormalizeState} from './util/definitions';
import {DenormalizeState} from './util/definitions';
import {DynamicShape} from './util/definitions';
import {Merge} from './util/definitions';
import {Create} from './util/definitions';
import {Entities} from './util/definitions';

export default class DynamicSchema {
    shape: DynamicShape;
    create: Create;
    merge: Merge;

    constructor(shape: DynamicShape) {
        this.shape = shape;
    }

    normalize(data: unknown, entities: Entities = {}): NormalizeState {
        const schema = this.shape(data);
        const result = schema.normalize(data, entities);

        return {
            entities,
            schemas: result.schemas,
            result: {
                resultType: 'dynamicSchemaResult',
                result,
                schema
            }
        };
    }

    denormalize(denormalizeState: DenormalizeState, path: Array<any> = []): any {
        const {schema, result} = denormalizeState.result;
        return schema.denormalize(result, path);
    }
}
