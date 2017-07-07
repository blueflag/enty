// @flow

import {DELETED_ENTITY} from './SchemaConstant';

export class ArraySchema {
    type: string;
    childSchema: Object;
    options: Object;
    constructor(schema: Object, options: Object = {}) {
        this.type = 'array';
        this.childSchema = schema;
        this.options = {
            ...options
        };
    }
    normalize(data: Object, entities: Object = {}) {
        const {childSchema} = this;
        const idAttribute = childSchema.options.idAttribute;
        const result = data.map(item => {
            return (childSchema.type === 'entity')
                ? idAttribute(item).toString()
                : childSchema.normalize(item, entities).result;
        });

        data.forEach(item => childSchema.normalize(item, entities));
        return {entities, result};
    }
    denormalize(result: Object, entities: Object, path: string[] = []) {
        const {childSchema} = this;
        // Filter out any deleted keys
        if(result == null) {
            return result;
        }
        // Map denormalize to our result List.
        return result
            .map((item) => {
                return childSchema.denormalize(item, entities, path);
            })
            .filter(ii => ii !== DELETED_ENTITY);
    }
}

export default function ArraySchemaFactory(...args: any[]): ArraySchema {
    return new ArraySchema(...args);
}