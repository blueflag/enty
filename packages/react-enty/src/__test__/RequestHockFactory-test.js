// @flow
import type {HockMeta} from '../util/definitions';

import React from 'react';
import RequestHockFactory from '../RequestHockFactory';
import RequestStateSelector from '../RequestStateSelector';
import {FetchingState} from '../RequestState';
import {EmptyState} from '../RequestState';
import {RefetchingState} from '../RequestState';
import {ErrorState} from '../RequestState';
import {SuccessState} from '../RequestState';
import Message from '../data/Message';
import {RequestHockNoNameError} from '../util/Error';
import ObjectSchema from 'enty/lib/ObjectSchema';
import EntitySchema from 'enty/lib/EntitySchema';
import identity from 'unmutable/lib/identity';

jest.mock('../RequestStateSelector');

const resolve = (x) => () => Promise.resolve(x);

const STORE = {
    subscribe: () => {},
    dispatch: (aa) => aa,
    getState: () => ({
        entity: {
            _baseSchema: ObjectSchema({
                entity: ObjectSchema({}),
                withContext: EntitySchema({
                    definition: ObjectSchema({}),
                    idAttribute: (_, context) => context.id
                })
            }),
            _result: {
                fizz: 123123,
                foo: {
                    entity: {bar: 123}
                }
            },
            _requestState: {
                foo: FetchingState()
            }
        }
    })
};

const hockMeta: HockMeta = {
    generateResultKey: props => `${props}-resultKey`,
    requestActionName: 'FooAction'
};

const RequestHock = RequestHockFactory(resolve('foo'), hockMeta);
const RequestHockApplier = RequestHock({name: 'foo'});

beforeEach(() => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReset();
});

test('will return a function', () => {
    expect(typeof RequestHock).toBe('function');
});

test('hockApplier should be a function', () => {
    expect(typeof RequestHockApplier).toBe('function');
});

test('will throw an error is config.name is not supplied', () => {
    expect(() => RequestHock({})(() => null))
        .toThrow(RequestHockNoNameError('FooAction'));
});

test('config.payloadCreator will default to an identity if config.auto is falsy', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());

    const actionCreator = jest.fn();
    const RequestHock = RequestHockFactory(actionCreator, hockMeta);
    const RequestHockApplier = RequestHock({name: 'foo'});
    const Child = RequestHockApplier((props) => {
        props.foo.onRequest('bar');
        return null;
    });
    shallow(<Child store={STORE}/>).dive().dive();
    expect(actionCreator).toHaveBeenCalledWith('bar', {resultKey: 'bar-resultKey'});
});

test('config.payloadCreator will by default return an empty object if config.auto is truthy', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());

    const actionCreator = jest.fn();
    const RequestHock = RequestHockFactory(actionCreator, hockMeta);
    const RequestHockApplier = RequestHock({name: 'foo', auto: true});
    const Child = RequestHockApplier((props) => {
        props.foo.onRequest();
        return null;
    });
    shallow(<Child store={STORE}/>).dive().dive();
    expect(actionCreator).toHaveBeenCalledWith({}, {resultKey: '[object Object]-resultKey'});
});

test('config.payloadCreator will create the payload', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());
    const actionCreator = jest.fn();
    const RequestHock = RequestHockFactory(actionCreator, hockMeta);
    const RequestHockApplier = RequestHock({name: 'foo', payloadCreator: () => 'bar'});
    const Child = RequestHockApplier((props) => {
        props.foo.onRequest();
        return null;
    });
    shallow(<Child store={STORE}/>).dive().dive();
    expect(actionCreator).toHaveBeenCalledWith('bar', {resultKey: 'bar-resultKey'});
});

test('config.updateResultKey will by default be an identity function', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());
    const actionCreator = jest.fn();
    const RequestHock = RequestHockFactory(actionCreator, {...hockMeta, generateResultKey: () => 'fooResultKey'});
    const RequestHockApplier = RequestHock({name: 'foo'});
    const Child = RequestHockApplier((props) => {
        props.foo.onRequest({});
        return null;
    });
    shallow(<Child store={STORE}/>).dive().dive();
    expect(actionCreator).toHaveBeenCalledWith({}, {resultKey: 'fooResultKey'});
});

test('config.updateResultKey will update the resultKey', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());
    const actionCreator = jest.fn();
    const RequestHock = RequestHockFactory(actionCreator, {...hockMeta, generateResultKey: () => 'fooResultKey'});
    const RequestHockApplier = RequestHock({
        name: 'foo',
        updateResultKey: (resultKey) => `${resultKey}-bar`
    });
    const Child = RequestHockApplier((props) => {
        props.foo.onRequest({});
        return null;
    });
    shallow(<Child resultKey="foo" store={STORE}/>).dive().dive();
    expect(actionCreator).toHaveBeenCalledWith({}, {resultKey: 'fooResultKey-bar'});
    expect(actionCreator).not.toHaveBeenCalledWith({}, {resultKey: 'fooResultKey'});
});

test('config.updateResultKey is called with the resultKey and props', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());
    const updateResultKey = jest.fn();
    const RequestHock = RequestHockFactory(jest.fn(), {...hockMeta, generateResultKey: () => 'fooResultKey'});
    const RequestHockApplier = RequestHock({
        name: 'foo',
        updateResultKey
    });
    const Child = RequestHockApplier((props) => {
        props.foo.onRequest();
        return null;
    });
    shallow(<Child store={STORE} extraProp="bar" />).dive().dive();
    expect(updateResultKey).toHaveBeenCalledWith('fooResultKey', {store: STORE, extraProp: 'bar'});
});

test('config.mapResponseToProps will spread the response onto the hocked components props', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());
    const RequestHock = RequestHockFactory(resolve(), {...hockMeta, generateResultKey: () => 'foo'});
    const RequestHockApplier = RequestHock({name: 'foo', mapResponseToProps: identity()});
    const Child = RequestHockApplier((props) => null);
    const component = shallow(<Child store={STORE}/>)
        .dive()
        .setProps({foo: {resultKey: 'foo'}});

    expect(component.prop('entity')).toBe(component.prop('foo').response.entity);
});

test('config.mapResponseToProps will be an identity function if given a value of "true"', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());
    const RequestHock = RequestHockFactory(resolve(), {...hockMeta, generateResultKey: () => 'foo'});
    const RequestHockApplier = RequestHock({name: 'foo', mapResponseToProps: true});
    const Child = RequestHockApplier((props) => null);
    const component = shallow(<Child store={STORE}/>)
        .dive()
        .setProps({foo: {resultKey: 'foo'}});

    expect(component.prop('entity')).toBe(component.prop('foo').response.entity);
});

test('config.mapResponseToProps will throw an error if the new props will collide with the message prop', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());
    expect(function () {
        const RequestHock = RequestHockFactory(resolve(), {...hockMeta, generateResultKey: () => 'foo'});
        const RequestHockApplier = RequestHock({
            name: 'foo',
            mapResponseToProps: response => ({foo: response.entity})
        });
        const Child = RequestHockApplier((props) => null);
        const component = shallow(<Child store={STORE}/>)
            .dive()
            .setProps({foo: {resultKey: 'foo'}})
    }).toThrow();
});

test('config.pipe will give access to props and the message', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());
    const RequestHock = RequestHockFactory(
        resolve(),
        {...hockMeta, generateResultKey: () => 'foo'}
    );
    const RequestHockApplier = RequestHock({
        name: 'foo',
        auto: true,
        pipe: (props) => (message) => {
            expect(props.parentProp).toBe('parent');
            expect(message instanceof Message).toBe(true);
            return message;
        }
    });
    const Child = RequestHockApplier((props) => null);
    const component = shallow(<Child parentProp="parent" store={STORE}/>)
        .dive()
});

test('the response will not be mapped to props if config.mapResponseToProps is undefined', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());
    const RequestHock = RequestHockFactory(resolve(), {...hockMeta, generateResultKey: () => 'foo'});
    const RequestHockApplier = RequestHock({name: 'foo'});
    const Child = RequestHockApplier((props) => null);
    const component = shallow(<Child store={STORE}/>)
        .dive()
        .setProps({foo: {resultKey: 'foo'}})

    expect(component.prop('entity')).toBe(undefined);
});


test('hocked component will be given and Message to props.[name]', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());
    const Child = RequestHockApplier((props) => {
        expect(props.foo).toBeInstanceOf(Message);
        return null;
    });

    shallow(<Child store={STORE}/>).dive().dive();
});


test('Message.onRequest will dispatch an action', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(EmptyState());

    const dispatch = jest.fn();
    const store = {
        subscribe: () => {},
        getState: STORE.getState,
        dispatch
    };

    const Child = RequestHockApplier((props) => {
        props.foo.onRequest()
        return null;
    });

    shallow(<Child store={store}/>).dive().dive();
    expect(dispatch).toHaveBeenCalled();
});


test('will only use a new response key once a request as returned', () => {
    const runTest = (state, key) => {
    // $FlowFixMe - flow cant tell that this has been mocked
        RequestStateSelector.mockReturnValue(state);
        const responseKeyMock = jest.fn();
        const RequestHock = RequestHockFactory(resolve('foo'), hockMeta);
        const RequestHockApplier = RequestHock({name: 'foo', resultKey: 'bar'});
        const Child = RequestHockApplier((props) => {
            responseKeyMock(props.foo.resultKey);
            return null;
        });
        shallow(<Child store={STORE}/>).dive()
            .setProps({
                foo: {
                    request: jest.fn(),
                    resultKey: 'foo',
                    nextResultKey: 'bar'
                }
            })
            .dive();

        expect(responseKeyMock).toHaveBeenLastCalledWith(key);
    };

    runTest(EmptyState(), 'foo');
    runTest(FetchingState(), 'foo');
    runTest(RefetchingState(), 'foo');
    runTest(ErrorState(), 'bar');
    runTest(SuccessState(), 'bar');
});


test('will strip errors out of requestStates', () => {
    // $FlowFixMe - flow cant tell that this has been mocked
    RequestStateSelector.mockReturnValue(ErrorState({message: 'error!'}));

    const RequestHock = RequestHockFactory(resolve('foo'), hockMeta);
    const RequestHockApplier = RequestHock({name: 'foo'});
    const Child = RequestHockApplier((props) => {
        props.foo.requestState.errorMap(data => {
            expect(data).toBe(null);
        });
        return null;
    });
    shallow(<Child store={STORE}/>).dive().dive();
});


test('will return existing results when refetching', () => {
    const runTest = (state, resultKey, payload) => {
        const STORE = {
            subscribe: () => {},
            dispatch: (aa) => aa,
            getState: () => ({
                entity: {
                    _baseSchema: ObjectSchema({
                        //foo: ObjectSchema({})
                    }),
                    _result: {
                        foo: {id: '123'},
                        bar: {id: '456'}

                    },
                    _requestState: {
                        foo: state
                    }
                }
            })
        }
        // $FlowFixMe - flow cant tell that this has been mocked
        RequestStateSelector.mockReturnValue(state);
        const responseKeyMock = jest.fn();
        const RequestHock = RequestHockFactory(resolve(null), hockMeta);
        const RequestHockApplier = RequestHock({name: 'foo', resultKey});
        const Child = RequestHockApplier((props) => {
            responseKeyMock(props.foo.response);
            return null;
        });
        shallow(<Child store={STORE}/>)
            .setState({resultKey})
            .dive()
            .dive();


        expect(responseKeyMock).toHaveBeenCalledWith(payload);
    };

    runTest(EmptyState(), 'foo', {id: '123'});
    runTest(EmptyState(), 'bar', {id: '456'});
    runTest(EmptyState(), 'baz', {});
    runTest(FetchingState(), 'foo', {id: '123'});
    runTest(FetchingState(), 'bar', {id: '456'});
    runTest(FetchingState(), 'baz', {});
    runTest(RefetchingState(), 'foo', {id: '123'});
    runTest(RefetchingState(), 'bar', {id: '456'});
    runTest(RefetchingState(), 'baz', {});

});


describe('context', () => {
    test('contextCreator will be called with props', () => {
        RequestStateSelector.mockReturnValue(EmptyState());
        const contextCreator = jest.fn();
        const RequestHockApplier = RequestHock({
            name: 'foo',
            auto: true,
            contextCreator
        });
        const Child = RequestHockApplier((props) => null);
        shallow(<Child contextId="foo" store={STORE}/>).dive().dive();


        expect(contextCreator.mock.calls[0][0].contextId).toBe('foo');
    });

    test('the result of contextCreator will be passed through meta', () => {
        RequestStateSelector.mockReturnValue(EmptyState());
        const actionCreator = jest.fn();
        const RequestHock = RequestHockFactory(actionCreator, hockMeta);
        const RequestHockApplier = RequestHock({
            name: 'foo',
            auto: true,
            payloadCreator: () => 'fooPayload',
            contextCreator: ({contextId}) => ({contextId})
        });
        const Child = RequestHockApplier((props) => null);
        shallow(<Child contextId="foo" store={STORE}/>).dive().dive();


        expect(actionCreator).toHaveBeenCalledWith('fooPayload', {
            context: {contextId: 'foo'},
            resultKey: 'fooPayload-resultKey'
        });
    });
});

