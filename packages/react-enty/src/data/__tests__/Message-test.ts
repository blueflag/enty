import Message, {BaseMessage} from '../Message';

const response = {name: 'foo'};
const responseKey = 'FOO';
const request = async () => response;
const requestError = new Error('ERROR!');
const reset = () => {};
const removeEntity = () => {};

const messageInput = {
    response,
    responseKey,
    request,
    requestError,
    reset,
    removeEntity
};

it('will let you set responseKey, response, requestState, requestError, request', () => {
    const message = BaseMessage.success({
        reset,
        responseKey: 'foo',
        response: 'bar',
        requestError: new Error('qux'),
        removeEntity,
        request: () => Promise.resolve('quux')
    });

    expect(message.responseKey).toBe('foo');
    expect(message.response).toBe('bar');
    expect(message.requestError).toEqual(new Error('qux'));
    expect(message.request()).resolves.toBe('quux');
});

it('will default requestState to Empty', () => {
    const message = BaseMessage.empty({
        reset,
        removeEntity,
        response: null,
        responseKey: 'foo',
        request: Promise.resolve,
        requestError: null
    });
    expect(message.requestState.isEmpty).toBe(true);
});

it('will let you update the message', () => {
    const newMessage = BaseMessage.empty(messageInput).update(message => ({
        ...message,
        response: 'bar'
    }));

    expect(newMessage.response).toBe('bar');
});

describe('Message response methods', () => {
    const message = BaseMessage.success({
        ...messageInput,
        response: {
            foo: 'bar',
            bar: {
                baz: 'qux'
            }
        }
    });

    it('will select a value from the response', () => {
        expect(message.get('foo')).toBe('bar');
        expect(message.getIn(['bar', 'baz'])).toBe('qux');
    });

    it('will use not found value if nothing is found', () => {
        // @ts-ignore intentional type breaking
        expect(message.get('blah', '!')).toBe('!');
        // @ts-ignore intentional type breaking
        expect(message.getIn(['bar', 'blah'], '!')).toBe('!');
    });

    it('will not break on empty responses', () => {
        // @ts-ignore intentional type breaking
        expect(BaseMessage.empty(messageInput).get('blah', '!')).toBe('!');
        // @ts-ignore intentional type breaking
        expect(BaseMessage.empty(messageInput).getIn(['bar', 'blah'], '!')).toBe('!');
    });
});

describe('Message requestState methods', () => {
    it('will change requestState with .to functions', () => {
        expect(BaseMessage.fetching().toEmpty().requestState.isEmpty).toBe(true);
        expect(BaseMessage.empty(messageInput).toFetching().requestState.isFetching).toBe(true);
        expect(BaseMessage.empty(messageInput).toRefetching().requestState.isRefetching).toBe(true);
        expect(BaseMessage.empty(messageInput).toSuccess().requestState.isSuccess).toBe(true);
        expect(BaseMessage.empty(messageInput).toError().requestState.isError).toBe(true);
    });

    it('will provide getters for the requestState', () => {
        expect(BaseMessage.empty(messageInput).isEmpty).toBe(true);
        expect(BaseMessage.fetching().isFetching).toBe(true);
        expect(BaseMessage.refetching().isRefetching).toBe(true);
        expect(BaseMessage.success().isSuccess).toBe(true);
        expect(BaseMessage.error().isError).toBe(true);

        expect(BaseMessage.empty(messageInput).isFetching).toBe(false);
        expect(BaseMessage.empty(messageInput).isRefetching).toBe(false);
        expect(BaseMessage.empty(messageInput).isSuccess).toBe(false);
        expect(BaseMessage.empty(messageInput).isError).toBe(false);
    });
});

describe('Message Constructors', () => {
    test('Message.empty will create a empty message without a response', () => {
        const message = BaseMessage.empty(messageInput);
        expect(message.response).toBeUndefined();
        expect(message.requestState.isEmpty).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.fetching will create a fetching message without a response', () => {
        const message = BaseMessage.fetching(messageInput);
        expect(message.response).toBeUndefined();
        expect(message.requestState.isFetching).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.refetching will create a refetching message with a response', () => {
        const message = BaseMessage.refetching(messageInput);
        expect(message.response).toBe(response);
        expect(message.requestState.isRefetching).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.success will create a success message with a response', () => {
        const message = BaseMessage.success(messageInput);
        expect(message.response).toBe(response);
        expect(message.requestState.isSuccess).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.error will create a error message with requestError', () => {
        const message = BaseMessage.error(messageInput);
        expect(message.requestError).toBe(requestError);
        expect(message.requestState.isError).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    it('will not break if nothing is passed to each constructor', () => {
        expect(BaseMessage.empty).not.toThrow();
        expect(BaseMessage.fetching).not.toThrow();
        expect(BaseMessage.refetching).not.toThrow();
        expect(BaseMessage.success).not.toThrow();
        expect(BaseMessage.error).not.toThrow();
    });
});
