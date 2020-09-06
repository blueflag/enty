import React, {useEffect, useState, useCallback} from 'react';
import {EntitySchema, ArraySchema, ObjectSchema} from '../src/index';
import {State, Meta, SchemasUsed, NormalizeReturn} from '../src/util/definitions';

//
// Utils
function delay(ms, value) {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

//
// Enty State
type EntityRequestArgs = {
    schema: EntitySchema<any>;
    id: string;
    method: 'load' | 'save';
    loadVariables?: any;
    saveVariables?: any;
};

type Respond = (store: Store, args: EntityRequestArgs) => AsyncGenerator<NormalizeReturn>;

class Store {
    _events: Record<string, Function[]>;
    _respond: Respond;
    _state: State;
    _schemasUsed: SchemasUsed;
    constructor(respond: Respond, initialState: State = {}, schemasUsed: SchemasUsed = {}) {
        this._events = {};
        this._state = initialState;
        this._schemasUsed = schemasUsed;
        this._respond = respond;
    }

    _getStateTuple(schema: EntitySchema<any>, id: string): [any, Meta] {
        return this._state[schema.name]?.[id] || [null, {}];
    }

    get(schema: EntitySchema<any>, id: string) {
        const entity = schema.denormalize({
            state: this._state,
            output: id
        });
        return [entity, this._getStateTuple(schema, id)[1]];
    }

    update(schema: EntitySchema<any>, input: any, meta: Meta) {
        const value = schema.normalize({state: this._state, input, meta});
        this._state = value.state;
        this._schemasUsed = value.schemasUsed;
        return this;
    }

    async trigger(args: EntityRequestArgs) {
        const {schema, id} = args;
        for await (let value of this._respond(this, args)) {
            this._events[schema.name + id].forEach((cb) => cb(this.get(schema, id)));
        }
    }
    subscribe(args: EntityRequestArgs, callback: Function) {
        const {schema, id} = args;
        const key = schema.name + id;
        this._events[key] = this._events[key] || [];
        this._events[key].push(callback);
        this.trigger(args);
        return () => {
            this._events[key] = this._events[key].filter((i) => i !== callback);
        };
    }
}

// Requesters
async function* asyncRequest(config: {
    id: string;
    request: (config: typeof config) => Promise<any>;
    schema: EntitySchema<any>;
    store: Store;
    ttl: number;
    verb?: string;
    verbed?: string;
}) {
    const {store, schema, id, ttl, request, verb = 'loading', verbed = 'loaded'} = config;
    const [entity, meta] = store.get(schema, id);

    if (entity && Date.now() - meta.normalizeTime <= ttl * 1000) return yield;

    yield store.update(schema, {id}, {[verb]: true, [verbed]: false});
    try {
        yield store.update(schema, await request(config), {
            [verb]: false,
            [verbed]: true,
            normalizeTime: Date.now()
        });
    } catch (error) {
        yield store.update(schema, {id}, {[verb]: false, [verbed]: true, error});
    }
    return;
}

//
// React Stuff
const Context = React.createContext<Store | undefined>(undefined);
const Provider = ({store, ...rest}: {store: Store}) => <Context.Provider value={store} {...rest} />;
const useStore = () => {
    const store: Store | undefined = React.useContext(Context);
    if (!store) {
        throw new Error('No Enty Provider found');
    }
    return store;
};

function useEntity(config: {schema: EntitySchema<any>; id: string; loadVariables?: any}) {
    const {schema, id, loadVariables = {}} = config;
    const store = useStore();
    const [stateTuple, setState] = useState([null, {}]);

    const onSave = useCallback(
        (saveVariables) => {
            store.trigger({schema, id, method: 'save', saveVariables});
        },
        [schema, id]
    );

    useEffect(() => {
        return store.subscribe({schema, id, method: 'load', loadVariables}, setState);
    }, [schema, id, JSON.stringify(loadVariables)]);

    return [...stateTuple, onSave];
}

//
//
// Implementation

// Schema Definitions
const PersonSchema = new EntitySchema('person', {});
const PlanetSchema = new EntitySchema('planet', {});
const FilmSchema = new EntitySchema('film', {});

PersonSchema.shape = new ObjectSchema({
    homeworld: PlanetSchema,
    filmConnection: new ObjectSchema({
        films: new ArraySchema(FilmSchema)
    })
});

FilmSchema.shape = new ObjectSchema({
    planetConnection: new ObjectSchema({
        planets: new ArraySchema(PlanetSchema)
    })
});

const personQuery = (id) => `{
  person(id: "${id}") {
    id,
    name
    birthYear
    gender
    homeworld { id name }
    filmConnection {
      films {
        id
        title
        planetConnection {
          planets {
            id
            name
          }
        }

      }
    }
  }
}`;

const myStore = new Store(async function* (store, args: EntityRequestArgs) {
    const {method, schema, id, loadVariables, saveVariables} = args;

    const asyncRequester = (ttl, request) =>
        asyncRequest({
            request,
            ttl,
            store,
            schema,
            id
        });

    const post = async (query) => {
        const response = await fetch('https://swapi-graphql.netlify.app/.netlify/functions/index', {
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({query}),
            method: 'POST'
        });
        return (await response.json()).data;
    };

    switch (`${schema.name}.${method}`) {
        case 'person.load':
            return yield* asyncRequester(10, async () => {
                const data = await post(personQuery(id));
                return data.person;
            });

        case 'bar':
            if (method === 'save') yield store.update(schema, saveVariables, {normalizeTime: null});
            return yield* asyncRequester(10, () =>
                delay(1000 * Math.random() + 500, {id, value: Math.random()})
            );
    }
});

function Load() {
    const [id, setId] = useState('cGVvcGxlOjE=');
    const [person, meta] = useEntity({schema: PersonSchema, id});
    console.log(person);

    if (!person) return <div>empty</div>;
    if (meta.loading) return <div>loading...</div>;
    if (meta.error) return <div>{meta.error.message}</div>;

    return (
        <div>
            <table>
                <tbody>
                    <tr>
                        <td>Name</td>
                        <td>{person.name}</td>
                    </tr>
                    <tr>
                        <td>Homeworld</td>
                        <td>{person.homeworld.name}</td>
                    </tr>
                    <tr>
                        <td>Born</td>
                        <td>{person.birthYear}</td>
                    </tr>
                    <tr>
                        <td>Gender</td>
                        <td>{person.gender}</td>
                    </tr>
                </tbody>
            </table>
            <button onClick={() => setId('cGVvcGxlOjE=')}>Luke</button>
            <button onClick={() => setId('cGVvcGxlOjIy')}>Bobba Fett</button>
            <button onClick={() => setId('cGVvcGxlOjIw')}>Yoda</button>
        </div>
    );
}

function Create() {
    return null;
}

function Update({id}) {
    return null;
}

function Debug() {
    const [person, meta] = useEntity({schema: PersonSchema, id: 'cGVvcGxlOjE='});
    const store = useStore();
    return <pre>{JSON.stringify(store._state, null, 4)}</pre>;
}

/*

# Todo
- Request Hook performance
- Update entities
- Entities update each other
- subscribe to list of entities
- denormalizing cache
- EnityApi shim

*/

export default function Layout() {
    return (
        <Provider store={myStore}>
            <div style={{display: 'flex'}}>
                <Load />
                <Create />
                <Update />
            </div>
        </Provider>
    );
}
