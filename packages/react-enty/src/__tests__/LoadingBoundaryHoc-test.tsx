import React from 'react';
import {BaseMessage} from '../data/Message';
import LoadingBoundaryHoc from '../LoadingBoundaryHoc';
import {mount} from 'enzyme';

const TestEmpty = () => null;
const TestError = () => null;
const TestFallback = () => null;
const NullRender = () => null;

const messageInput = {
    response: 'RESPONSE',
    responseKey: 'FOO',
    reset: () => {},
    removeEntity: () => {},
    request: async () => 'FOO',
    requestError: new Error('OUCH!')
};

describe('Empty', () => {
    it('will render empty', () => {
        const Hoc = LoadingBoundaryHoc({
            name: 'foo',
            empty: TestEmpty
        })(NullRender);
        const wrapper = mount(<Hoc foo={BaseMessage.empty(messageInput)} />);
        expect(wrapper.find('TestEmpty')).toHaveLength(1);
    });
});

describe('Fetching', () => {
    it('will render fallback', () => {
        const Hoc = LoadingBoundaryHoc({
            name: 'foo',
            fallback: TestFallback
        })(NullRender);
        const wrapper = mount(<Hoc foo={BaseMessage.fetching(messageInput)} />);
        expect(wrapper.find('TestFallback')).toHaveLength(1);
    });
});

describe('Refetching', () => {
    it('will render fallback on if fallbackOnRefetch is true', () => {
        const Hoc = LoadingBoundaryHoc({
            name: 'foo',
            fallback: TestFallback,
            fallbackOnRefetch: true
        })(NullRender);
        const wrapper = mount(<Hoc foo={BaseMessage.refetching(messageInput)} />);
        expect(wrapper.find('TestFallback')).toHaveLength(1);
    });
});

describe('Success', () => {
    it('will render children with message at config.name', () => {
        const message = BaseMessage.success(messageInput);
        const Hoc = LoadingBoundaryHoc({
            name: 'foo'
        })(NullRender);
        const wrapper = mount(<Hoc foo={message} />);
        // @ts-ignore
        expect(wrapper.find('NullRender').props().foo).toBe(message);
    });

    it('will allow response to be mapped to props', () => {
        const Hoc = LoadingBoundaryHoc({
            name: 'foo',
            mapResponseToProps: response => ({baz: response})
        })(NullRender);
        const wrapper = mount(<Hoc foo={BaseMessage.success(messageInput)} />);
        // @ts-ignore
        expect(wrapper.find('NullRender').props().baz).toBe('RESPONSE');
    });
});

describe('Error', () => {
    it('will render error with requestError in props.error', () => {
        const Hoc = LoadingBoundaryHoc({
            name: 'foo',
            error: TestError
        })(NullRender);
        const wrapper = mount(<Hoc foo={BaseMessage.error(messageInput)} />);

        expect(wrapper.find('TestError')).toHaveLength(1);
        // @ts-ignore
        expect(wrapper.find('TestError').props().error).toBe('Error: OUCH!');
    });
});

describe('SafeRendering', () => {
    it('will not render anything if not provided', () => {
        const Hoc = LoadingBoundaryHoc({
            name: 'foo'
        })(NullRender);
        const empty = mount(<Hoc foo={BaseMessage.empty(messageInput)} />);
        const fetching = mount(<Hoc foo={BaseMessage.fetching(messageInput)} />);
        const error = mount(<Hoc foo={BaseMessage.error(messageInput)} />);
        expect(empty.find('NullRender')).toHaveLength(1);
        expect(fetching.find('NullRender')).toHaveLength(1);
        expect(error.find('NullRender')).toHaveLength(1);
    });
});
