---
id: value-schema
title: Value Schema
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
IdSchema(
    shape: Schema,
    options?: {
        shape: (value) => entity
    }
);
```

### shape 
**type:** `Schema`  

The Schema that this value represents.

```js
const user = new EntitySchema('user');
const friend = IdSchema(user);
user.set({friend});
```

### options.shape
**type:** `(id: string) => *`  
**default:** `(value) => ({id: value})`  

By defualt the IdSchema constructs a faux entity by placing the value on the `id` key of an 
object. If your shape has a differnt idAtribute function you can replace this to match.

```
const user = new EntitySchema('user', {
    idAtribute: user => user.email
});

const friend = IdSchema(user, {
    shape: value => ({email: value})
});
user.set({friend});
```



## Methods

### .normalize()
<Normalize />

### .denormalize()
<Denormalize />
