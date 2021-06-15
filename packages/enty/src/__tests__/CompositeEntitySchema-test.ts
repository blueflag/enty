import EntitySchema from '../EntitySchema';
import CompositeEntitySchema from '../CompositeEntitySchema';
import ObjectSchema from '../ObjectSchema';

var course = new EntitySchema('course');
course.shape = new ObjectSchema({});

var participant = new CompositeEntitySchema('participant', {
    shape: new ObjectSchema({}),
    compositeKeys: {
        course
    }
});

var dog = new CompositeEntitySchema('dog', {
    shape: new ObjectSchema({}),
    compositeKeys: {
        participant
    }
});

const derek = {
    id: '123',
    name: 'Derek Tibbs',
    course: {
        id: 'spk456',
        courseName: 'Learn All The Things!'
    }
};

test('denormalize is the inverse of normalize', () => {
    expect(participant.denormalize(participant.normalize(derek))).toEqual(derek);
});

test('throw without a definition', () => {
    expect(() => new CompositeEntitySchema('foo').normalize(derek, {})).toThrow();
    // $FlowFixMe - deliberate missuse of types
    expect(() => new CompositeEntitySchema('foo', {shape: null}).normalize(derek, {})).toThrow();
});

test('can hold CompositeEntitySchemas', () => {
    const aa = {
        id: 'lassie',
        participant: {
            id: '123',
            name: 'Derek Tibbs',
            course: {
                id: 'spk456',
                courseName: 'Learn All The Things!'
            }
        }
    };

    const {entities, result} = dog.normalize(aa);
    expect(entities.course).toBeTruthy();
    expect(entities.participant).toBeTruthy();
    expect(entities.dog).toBeTruthy();
    expect(entities.dog).toBeTruthy();
    expect(entities.participant).toBeTruthy();
    expect(result).toBe('lassie-123-spk456');
});

test('can defer their definition', () => {
    var lateCourseParticipant = new CompositeEntitySchema('participant');
    lateCourseParticipant.shape = new ObjectSchema({});
    lateCourseParticipant.compositeKeys = {course};
    expect(() => lateCourseParticipant.normalize(derek)).not.toThrow();
});

test('compositeKeys will override defintion keys ', () => {
    const owl = new EntitySchema('owl', {
        shape: new ObjectSchema({})
    });

    var cat = new CompositeEntitySchema('cat', {
        shape: new ObjectSchema({friend: dog}),
        compositeKeys: {
            friend: owl
        }
    });

    const {entities} = cat.normalize({
        id: 'sparky',
        friend: {
            id: 'hedwig'
        }
    });

    expect(entities.cat['sparky-hedwig']).toBeTruthy();
    expect(entities.dog).toBeFalsy();
});

test('will not try to normalize null compositeKeys', () => {
    expect(() => participant.normalize({id: 'rad'})).not.toThrow();
});

test('will not try to denormalize null compositeKeys', () => {
    const data = {id: 'rad'};
    expect(() => participant.denormalize(participant.normalize(data))).not.toThrow();
});

it('will throw if compositeKey is structural', () => {
    var badSchema = new CompositeEntitySchema('participant', {
        shape: new ObjectSchema({}),
        compositeKeys: {
            course: new ObjectSchema({})
        }
    });
    const data = {
        id: 'steve',
        course: {id: 'electronics101'}
    };
    expect(() => badSchema.normalize(data, {})).toThrow(/participant/);
});

it('can normalize the entity without any compositeKeys', () => {
    const data = {
        id: 'steve'
    };
    expect(() => participant.normalize(data, {})).not.toThrow();
});
