import removeAction from '../removeAction';

it('will have a type of ENTY_REMOVE', () => {
    const action = removeAction('foo', 'bar');
    expect(action.type).toBe('ENTY_REMOVE');
});

it('will have a payload of [type, id]', () => {
    const action = removeAction('foo', 'bar');
    expect(action.payload).toEqual(['foo', 'bar']);
});
