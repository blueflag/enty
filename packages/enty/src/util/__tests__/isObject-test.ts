import isObject from '../isObject';

it('should return `true` if the object is created by the `Object` constructor.', () => {
    expect(isObject(Object.create({}))).toBe(true);
    expect(isObject(Object.create(Object.prototype))).toBe(true);
    expect(isObject({foo: 'bar'})).toBe(true);
    expect(isObject({})).toBe(true);
});

it('should return `false` if the object is not created by the `Object` constructor.', () => {
    function Foo() {
        this.abc = {};
    }

    expect(isObject(/foo/)).toBe(false);
    expect(isObject(function() {})).toBe(false);
    expect(isObject(1)).toBe(false);
    expect(isObject(['foo', 'bar'])).toBe(false);
    expect(isObject([])).toBe(false);
    expect(isObject(new Foo())).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(Object.create(null))).toBe(false);
});
