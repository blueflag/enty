import useAutoRequest from '../useAutoRequest';
import {renderHook} from '@testing-library/react-hooks';

it('should immediately fire the callback', () => {
    const callback = jest.fn();
    renderHook(() => useAutoRequest(callback));
    expect(callback).toHaveBeenCalledTimes(1);
});

it('should refire if any dependencies change', () => {
    const callback = jest.fn();
    let foo = 1;
    const {rerender} = renderHook(() => useAutoRequest(callback, [foo]));
    expect(callback).toHaveBeenCalledTimes(1);
    rerender();
    expect(callback).toHaveBeenCalledTimes(1);
    foo = 2;
    rerender();
    expect(callback).toHaveBeenCalledTimes(2);
});

it('should accept multiple dependencies', async () => {
    const callback = jest.fn();
    let foo = 1;
    let bar = 1;
    const {rerender} = renderHook(() => useAutoRequest(callback, [foo, bar]));
    expect(callback).toHaveBeenCalledTimes(1);
    foo = 2;
    rerender();
    expect(callback).toHaveBeenCalledTimes(2);
    bar = 2;
    rerender();
    expect(callback).toHaveBeenCalledTimes(3);
});
