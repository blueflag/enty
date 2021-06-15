import RequestState from '../RequestState';

describe('RequestState', () => {
    test('map functions will update values', () => {
        function value(state) {
            return state
                .emptyMap(() => 'empty')
                .fetchingMap(() => 'fetching')
                .refetchingMap(() => 'refetching')
                .errorMap(() => 'error')
                .successMap(() => 'success')
                .value();
        }
        expect(value(RequestState.empty())).toBe('empty');
        expect(value(RequestState.fetching())).toBe('fetching');
        expect(value(RequestState.refetching())).toBe('refetching');
        expect(value(RequestState.error())).toBe('error');
        expect(value(RequestState.success())).toBe('success');
    });

    test('flatMap functions will update requestState', () => {
        const {empty, fetching, refetching, success, error} = RequestState;

        // empty
        expect(empty('foo').emptyFlatMap(success).isSuccess).toBe(true);
        expect(empty('foo').emptyFlatMap(success).val).toBe('foo');
        expect(success('foo').emptyFlatMap(() => success('bar')).val).toBe('foo');

        // fetching
        expect(fetching('foo').fetchingFlatMap(success).isSuccess).toBe(true);
        expect(fetching('foo').fetchingFlatMap(success).val).toBe('foo');
        expect(success('foo').fetchingFlatMap(() => success('bar')).val).toBe('foo');

        // refetching
        expect(refetching('foo').refetchingFlatMap(success).isSuccess).toBe(true);
        expect(refetching('foo').refetchingFlatMap(success).val).toBe('foo');
        expect(success('foo').refetchingFlatMap(() => success('bar')).val).toBe('foo');

        // success
        expect(success('foo').successFlatMap(success).isSuccess).toBe(true);
        expect(success('foo').successFlatMap(success).val).toBe('foo');
        expect(empty('foo').successFlatMap(() => success('bar')).val).toBe('foo');

        // error
        expect(error('foo').errorFlatMap(success).isSuccess).toBe(true);
        expect(error('foo').errorFlatMap(success).val).toBe('foo');
        expect(success('foo').errorFlatMap(() => success('bar')).val).toBe('foo');
    });

    it('will return the value or defaultValue from .value()', () => {
        expect(RequestState.error('foo').value()).toBe('foo');
        expect(RequestState.error('foo').value('bar')).toBe('foo');
        expect(RequestState.error().value('bar')).toBe('bar');
        expect(RequestState.error(null).value('bar')).toBe('bar');
    });

    it('will cast requestState via .to functions', () => {
        expect(RequestState.fetching().toEmpty().isEmpty).toBe(true);
        expect(RequestState.empty().toFetching().isFetching).toBe(true);
        expect(RequestState.empty().toRefetching().isRefetching).toBe(true);
        expect(RequestState.empty().toSuccess().isSuccess).toBe(true);
        expect(RequestState.empty().toError().isError).toBe(true);
    });

    test('variant apis', () => {
        function instance(state) {
            expect(state).toHaveProperty('value');
            expect(state).toHaveProperty('isEmpty');
            expect(state).toHaveProperty('isFetching');
            expect(state).toHaveProperty('isRefetching');
            expect(state).toHaveProperty('isSuccess');
            expect(state).toHaveProperty('isError');
            expect(state).toHaveProperty('emptyMap');
            expect(state).toHaveProperty('emptyFlatMap');
            expect(state).toHaveProperty('fetchingMap');
            expect(state).toHaveProperty('fetchingFlatMap');
            expect(state).toHaveProperty('refetchingMap');
            expect(state).toHaveProperty('refetchingFlatMap');
            expect(state).toHaveProperty('errorMap');
            expect(state).toHaveProperty('errorFlatMap');
            expect(state).toHaveProperty('successMap');
            expect(state).toHaveProperty('successFlatMap');
        }

        // Instance
        instance(RequestState.empty());
        instance(RequestState.fetching());
        instance(RequestState.refetching());
        instance(RequestState.error());
        instance(RequestState.success());

        // Static
        expect(RequestState).toHaveProperty('empty');
        expect(RequestState).toHaveProperty('fetching');
        expect(RequestState).toHaveProperty('refetching');
        expect(RequestState).toHaveProperty('error');
        expect(RequestState).toHaveProperty('success');
    });
});
