import {configure} from 'enzyme';
import EnzymeAdapter from '@wojtekmaj/enzyme-adapter-react-17';
configure({adapter: new EnzymeAdapter()});

const mockConsoleMethod = realConsoleMethod => {
    const ignoredMessages = ['test was not wrapped in act(...)'];

    return (message, ...args) => {
        const containsIgnoredMessage = ignoredMessages.some(ignoredMessage =>
            message.includes(ignoredMessage)
        );

        if (!containsIgnoredMessage) {
            realConsoleMethod(message, ...args);
        }
    };
};

console.warn = jest.fn(mockConsoleMethod(console.warn));
console.error = jest.fn(mockConsoleMethod(console.error));
