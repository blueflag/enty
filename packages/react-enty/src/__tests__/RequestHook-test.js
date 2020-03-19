// @flow
import React from 'react';
import {useEffect} from 'react';
import Message from 'enty-state/lib/data/Message';

import {fetchOnLoad} from './RequestSuite';
import {errorOnLoad} from './RequestSuite';
import {nothing} from './RequestSuite';
import {refetch} from './RequestSuite';
import {reset} from './RequestSuite';
import {fetchOnPropChange} from './RequestSuite';
import {fetchOnCallback} from './RequestSuite';
import {fetchSeries} from './RequestSuite';
import {fetchParallel} from './RequestSuite';
import {removeEntity} from './RequestSuite';
import {mountWithProvider, foo, fooError, bar, obs, entity} from './RequestSuite';



describe('config', () => {

    it('will return a message', () => {
        expect.assertions(1);
        mountWithProvider(() => () => {
            const message = foo.useRequest();
            expect(message).toBeInstanceOf(Message);
            return null;
        });
    });

    it('will throw if not in a provider', () => {
        const Child = () => {
            foo.useRequest();
            return null;
        };

        expect(() => mount(<Child/>)).toThrow();
    });

});

describe('usage', () => {

    it('can fetch on load', async () => {
        return fetchOnLoad((ExpectsMessage) => () => {
            const message = foo.useRequest();
            useEffect(() => {
                message.request();
            }, []);

            return <ExpectsMessage message={message} />;
        });
    });

    it('can catch rejected requests', async () => {
        return errorOnLoad((ExpectsMessage) => () => {
            const message = fooError.useRequest();
            useEffect(() => {
                message.request();
            }, []);
            return <ExpectsMessage message={message} />;
        });
    });

    it('can do nothing', async () => {
        return nothing((ExpectsMessage) => () => {
            const message = foo.useRequest();
            return <ExpectsMessage message={message} />;
        });
    });

    it('can refetch content', async () => {
        return refetch((ExpectsMessage) => () => {
            const message = foo.useRequest();
            return <ExpectsMessage message={message} />;
        });
    });

    it('can fetch if props change', async () => {
        return fetchOnPropChange((ExpectsMessage) => (props: {id: string}) => {
            const message = foo.useRequest();
            useEffect(() => {
                message.request(props.id);
            }, [props.id]);
            return <ExpectsMessage message={message} />;
        });
    });

    it('can fetch from a callback', async () => {
        return fetchOnCallback((ExpectsMessage) => () => {
            const message = foo.useRequest();
            return <ExpectsMessage message={message} />;
        });
    });

    it('can fetch multiples in series', async () => {
        return fetchSeries((ExpectsMessage) => () => {
            const aa = foo.useRequest();
            const bb = bar.useRequest();
            useEffect(() => {
                aa.request('first', {returnResponse: true}).then(() => bb.request('second'));
            }, []);

            return <div>
                <ExpectsMessage message={aa} />
                <ExpectsMessage message={bb} />
            </div>;
        });
    });

    it('can fetch multiples in parallel', async () => {
        return fetchParallel((ExpectsMessage) => () => {
            const aa = foo.useRequest();
            const bb = bar.useRequest();
            useEffect(() => {
                aa.request('first');
                bb.request('second');
            }, []);

            return <div>
                <ExpectsMessage message={aa} />
                <ExpectsMessage message={bb} />
            </div>;
        });
    });


});

describe('Message.reset', () => {

    it('can reset a request', () => {
        return reset((ExpectsMessage) => () => {
            const message = foo.useRequest();
            return <ExpectsMessage message={message} />;
        });
    });

});

describe('Message.removeEntity', () => {

    it('can remove entities', () => {
        return removeEntity((ExpectsMessage) => () => {
            const message = entity.useRequest();
            return <ExpectsMessage message={message} removeEntityPayload={['foo', '123']} />;
        });
    });

});

describe('config.returnResponse', () => {
    it('request will return undefined for promises', async () => {
        expect.assertions(1);
        mountWithProvider(() => () => {
            const message = foo.useRequest();
            useEffect(() => {
                var pending = message.request('first');
                expect(pending).toBeUndefined();
            }, []);

            return null;
        });
    });
    it('request will return undefined for observables', async () => {
        expect.assertions(1);
        mountWithProvider(() => () => {
            const message = obs.useRequest();
            useEffect(() => {
                var pending = message.request('first');
                expect(pending).toBeUndefined();
            }, []);

            return null;
        });
    });

    it('request will return response for promises if config.returnResponse is true', async () => {
        expect.assertions(1);
        mountWithProvider(() => () => {
            const message = foo.useRequest();
            useEffect(() => {
                var pending = message.request('first', {returnResponse: true});
                expect(pending).resolves.toEqual({data: 'first'});
            }, []);

            return null;
        });
    });

    it('request will return response for observables if config.returnResponse is true', async () => {
        // HOW?
    });

    it('rejected promises will can be caught if config.returnResponse is true', async () => {
        expect.assertions(1);

        mountWithProvider(() => () => {
            const message = fooError.useRequest();
            useEffect(() => {
                message.request('first', {returnResponse: true}).catch((e) => {
                    expect(e).toBe('ouch!');
                });
            }, []);

            return null;
        });
    });


});