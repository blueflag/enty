---
id: schemas
title: Schemas
group: Tutorials
---

_This is an introductory description of what schemas are and how they work. For specific details of
their types and methods check the [Api](/docs/schemas/entity-schema)._

Schemas are a way to describe to Enty the shape of your api responses and the 
relationships between your data. With this information Enty is able to normalize any response so that
each entity is only ever stored in memory once. This means that when ever your refer to one of your 
entities you can be confident that it is up to date. 

There are two main types of schema: structural schemas and entity schemas.

## Structure
Structural schemas describe the shape of your responses and let Enty traverse your data looking for entities.
They also provide hooks to let you construct and merge data shapes.

Examples: [ObjectSchema], [ArraySchema].

### Relationships
Take the following naive data structure. 


```js
{
    peopleList: [
        {
            id: '3', 
            name: 'steve',
            mother: {
                id: '1',
                name: 'sally'
            }
            father: {
                id: '2',
                name: 'john'
            }
        },
        {
            id: '4', 
            name: 'susan',
            mother: {
                id: '1',
                name: 'sally'
            }
            father: {
                id: '2',
                name: 'john'
            }
        }
    ]
}

```

From this we can assert that:

* userList is an array of people
* people have a mother who is a person
* people have a father who is a person

So that enty can normalize the data correctly we need to define a person entity and show that they 
can exist both in an personList and as a mother or father

```js
// define our person and personList
const person = new EntitySchema('person');
const personList = new ArraySchema(person);

// lazily define the relationships between people and their parents
person.shape = new ObjectSchema({
    mother: person,
    father: person
});

// export a schema that matches the shape of our api
export default new ObjectSchema({
    personList
});
```

### Constructing
Often data is represented through models or records. Making sure to correctly construct and manage 
these models is a pain in the front-end. Because enty uses the visitor pattern it is easy for
you to define a single consructor for each structural schema and let enty do the constructing for you. 

This lets you define your models but never worry about constructing them. As new data comes in it 
is automatically constructed for you.

We can extend the previous example by adding a shape to our people structural schema.

```js
person.shape = new ObjectSchema(
    {
        mother: person, 
        father: person
    },
    {create: data => new Person(data)}
));

```

_NOTE: shapes are defined on structure schemas not their entities. This is because the entity 
schema is really just a reference to an id in state. Because an entity could be of any
shape entity schemas must have a structural shape assigned to it so that enty knows how to
correctly contruct or merge it._


### Merging
Because an entity could be of any shape, when Enty is finds an entity that already exists in state 
it simply calls the merge function on its shape. This lets enty be smart about how to merge things.
An object schema performs a shallow merge, while the array schema just replaces the old with the new.


## Entities
Entity schemas describe to enty where a unique entity can be found in your data shape.

* entities must have a unique name.
* entities must have a unique id.
* entities must have some sort of shape.

```jsx
const user = new EntitySchema('user');
const friendList = new ArraySchema(user);
user.shape = new ObjectSchema({
    friendList
});
```
In this example we have first defined a user as a type of entity, giving it the unique name of `user`.
Next we define a friendList that is made up of users.
Next we define the shape of our friend as an object. 
Finally we declare the relationship that users can have friendList's that are arrays of users.

TODO: FriendList normalizing example.

### Changing the id
By default the EntitySchema looks to the user.id property to uniquely identify each user.
This can be configured to match your own data structure.

```jsx
const user = new EntitySchema('user', {
    id: user => user.email
});
```

### Why does an entity require a structure?
Entities are really nothing more than a category and an id; they are closer to a variable than a real data structure. Because of this they need some other information to describe their shape. Enty chooses to use structural schemas to describe this information as it lets you construct entities of any shape. You can use the common Object schema define models. Or the ArraySchema to create list of notifications bound to the viewer of the app. You can even define your own schema that has unique logic for normalizing and denormalizing. 


[ObjectSchema]: /api/enty/object-schema
[ArraySchema]: /api/enty/array-schema
