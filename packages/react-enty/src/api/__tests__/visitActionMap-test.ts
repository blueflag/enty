import visitActionMap from '../visitActionMap';

it('will recurse through deep object trees', () => {
    const visitor = jest.fn((value) => value);
    const data = {
        foo: {
            bar: {
                baz: 1
            },
            qux: 2
        }
    };
    visitActionMap(data, visitor);
    expect(visitor).toHaveBeenCalledTimes(2);
});

it('will visit functions & record their path', () => {
    const visitor = jest.fn();
    const func = jest.fn();
    const data = {
        foo: {
            bar: {
                baz: func
            }
        }
    };
    visitActionMap(data, visitor);
    expect(visitor).toHaveBeenCalledWith(func, ['foo', 'bar', 'baz']);
});

it('preserve the given object tree', () => {
    const visitor = jest.fn((value) => value);
    const data = {
        foo: {
            bar: {
                baz: () => null
            }
        }
    };
    const output = visitActionMap(data, visitor);
    expect(output).toEqual(data);
});
