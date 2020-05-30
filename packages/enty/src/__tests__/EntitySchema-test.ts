import EntitySchema from '../EntitySchema';
import ObjectSchema from '../ObjectSchema';
import {UndefinedIdError} from '../util/Error';

const foo = new EntitySchema({name: 'foo'});
const bar = new EntitySchema({name: 'bar'});
const baz = new EntitySchema({name: 'baz'});

foo.shape = new ObjectSchema({});
baz.shape = new ObjectSchema({bar});
bar.shape = new ObjectSchema({foo});

describe('configuration', () => {
    it('can mutate its shape', () => {
        var schema = new EntitySchema({name: 'foo'});
        const shape = new ObjectSchema({});
        schema.shape = shape;
        expect(schema.shape).toBe(shape);
    });

    it('will default to a ObjectSchema shape', () => {
        let schemaB = new EntitySchema({name: 'foo'});
        expect(schemaB.shape).toBeInstanceOf(ObjectSchema);
    });
});

describe('EntitySchema.normalize', () => {
    test('can normalize entities', () => {
        const {entities, result} = foo.normalize({id: '1'});
        expect(result).toBe('1');
        expect(entities.foo['1']).toEqual({id: '1'});
    });

    test('will not mutate input objects', () => {
        const entityTest = {id: '1'};
        foo.normalize(entityTest, {});
        expect(entityTest).toEqual({id: '1'});
    });

    test('will collect schemas that were used', () => {
        const entityTest = {id: '1', bar: {id: '2', foo: {id: '3'}}};
        expect(Object.keys(baz.normalize(entityTest, {}).schemas)).toEqual(['foo', 'bar', 'baz']);
    });

    test('will throw an error if an entity doesnt have and id', () => {
        const schema = new EntitySchema({
            name: 'foo',
            shape: new ObjectSchema({}),
        });
        expect(() => schema.normalize({}, {})).toThrow(UndefinedIdError('foo', null));
    });

    test('will call merge on definition when an entity already exists', () => {
        const merge = jest.fn();
        const entities = {foo: {a: {id: 'a', name: 'first'}}};
        class MockMerge extends ObjectSchema<any> {
            merge = merge;
        }
        const schema = new EntitySchema({
            name: 'foo',
            shape: new MockMerge({}),
        });

        schema.normalize({id: 'a', name: 'second'}, entities);
        expect(merge).toHaveBeenCalledWith({id: 'a', name: 'first'}, {id: 'a', name: 'second'});
    });

    it('will treat null shapes like an Id schema', () => {
        const NullSchemaEntity = new EntitySchema({
            name: 'foo',
            shape: null,
            id: (data) => `${data}-foo`,
        });
        const state = NullSchemaEntity.normalize(2, {});
        expect(state.entities.foo['2-foo']).toBe(2);
    });

    it('will default id function to stringify if shape is null', () => {
        const NullSchemaEntity = new EntitySchema({
            name: 'foo',
            shape: null,
        });
        const state = NullSchemaEntity.normalize({}, {});
        expect(state.entities.foo['[object Object]']).toEqual({});
    });
});

describe('EntitySchema.denormalize', () => {
    it('can denormalize entities', () => {
        const entities = {
            foo: {
                '1': {id: '1'},
            },
        };

        expect(foo.denormalize({result: '1', entities})).toEqual({id: '1'});
    });

    it('will not cause an infinite recursion', () => {
        const foo = new EntitySchema({name: 'foo'});
        const bar = new EntitySchema({name: 'bar'});

        foo.shape = new ObjectSchema({bar});
        bar.shape = new ObjectSchema({foo});

        const entities = {
            bar: {'1': {id: '1', foo: '1'}},
            foo: {'1': {id: '1', bar: '1'}},
        };

        expect(bar.denormalize({result: '1', entities})).toEqual({
            id: '1',
            foo: {
                id: '1',
                bar: {
                    id: '1',
                    foo: '1',
                },
            },
        });
    });

    it('will not denormalize null entities', () => {
        const entities = {
            bar: {'1': {id: '1', foo: null}},
        };

        expect(bar.denormalize({result: '2', entities})).toEqual(undefined);
    });

    it('can denormalize null shapes', () => {
        const NullSchemaEntity = new EntitySchema({
            name: 'foo',
            shape: null,
            id: (data) => `${data}-foo`,
        });
        const state = NullSchemaEntity.normalize(2, {});
        expect(NullSchemaEntity.denormalize(state)).toBe(2);
    });
});

