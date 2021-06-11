---
title: Id Schema
group: Enty
---

Sometimes data can exist in a partially normalized state. E.g. a user object has a friend key,
but instead of the data giving you the whole object it just returns a user id in its place.

```js
// User
{
    id: '123',
    name: 'foo',
    friend: '456'
}
```

As long as you already have the friend normalized into state, the Value schemas lets you 
denormalize `friend` as a user.


## Params
```js
new IdSchema(
    name: Schema,
    options?: {
        create: (value) => entity
    }
);
```

### shape 
**type:** `Schema`  

The Schema that this value represents.

```js
const user = new EntitySchema('user');
const friend = IdSchema(user);
user.shape = new ObjectSchema({friend});
```

## options.create
**type:** `(id: string) => *`  
**default:** `(value) => ({id: value})`  

By default the IdSchema constructs a faux entity by placing the value on the `id` key of an 
object. If your entity has a different `id` function you can replace this to match.

```js
const user = new EntitySchema('user', {
    idAtribute: user => user.email
});

const friend = IdSchema(user, {
    shape: id => ({email: id})
});
user.shape = new ObjectSchema({friend});
```



## Methods

### .normalize()
<Normalize />

### .denormalize()
<Denormalize />
