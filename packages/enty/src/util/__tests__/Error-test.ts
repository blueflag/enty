import {CompositeKeysMustBeEntitiesError} from '../Error';
import {UndefinedIdError} from '../Error';

test('CompositeKeysMustBeEntitiesError', () => {
    expect(() => {
        throw CompositeKeysMustBeEntitiesError('foo', 'bar');
    }).toThrow(/foo.*bar/);
});

test('UndefinedIdError', () => {
    expect(() => {
        throw UndefinedIdError('foo', 'bar');
    }).toThrow(/foo.*bar/);
});
