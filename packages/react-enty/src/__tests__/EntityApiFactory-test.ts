import EntityApiFactory from '../EntityApiFactory';
import Hash from '../util/Hash';

jest.mock('../api/createRequestAction', () => () => 'REQUEST');

describe('EntityApiFactory', () => {
    it('visits every function provided', () => {
        const visitor = jest.fn();
        const data = {
            foo: {
                bar: () => null
            },
            baz: () => null
        };
        EntityApiFactory(data, visitor);
        expect(visitor).toHaveBeenCalledTimes(2);
    });

    it('creates an action name based on the path', () => {
        const visitor = jest.fn();
        const data = {
            foo: {
                bar: () => null
            }
        };
        EntityApiFactory(data, visitor);
        expect(visitor.mock.calls[0][0].actionType).toBe('FOO_BAR');
    });

    it('creates a hash based on payload and action name', () => {
        const visitor = jest.fn();
        const data = {
            foo: {
                bar: () => null
            }
        };
        EntityApiFactory(data, visitor);
        const {generateResultKey} = visitor.mock.calls[0][0];
        expect(generateResultKey('foo')).toBe(Hash({payload: 'foo', actionType: 'FOO_BAR'}));
    });

    it('creates requestAction with the sideEffect and action name', () => {
        const visitor = jest.fn();
        const data = {
            foo: {
                bar: () => null
            }
        };
        EntityApiFactory(data, visitor);
        const {requestAction} = visitor.mock.calls[0][0];
        expect(requestAction).toBe('REQUEST');
    });
});
