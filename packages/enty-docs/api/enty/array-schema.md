---
title: Array Schema
group: Enty
---

The ArraySchema is a structural schema used to define relationships in homogeneous arrays.

## Params

```js
new ArraySchema(
    shape: StructuralSchema,
    options?: {
        create?: (entity: A) => B,
        merge?: (previous: A, next: B) => C
    }
);
```

### shape 
**type:** `StructuralSchema`  

A single structural schema that describes what is in this collection.

```jsx 
const person = new EntitySchema('person');
const friends = new ArraySchema(person);
```

### options.create 
<Create/>

```js
const friends = new ArraySchema(person, {
    create: (entity) => new List(entity)
});
```

### options.merge 
<Merge default="(previous, next) => next" />

_Note: The default merge for an array is to just accept the new one. But you can
create some interesting funcitonality with custom merge function. E.g. if your merge functions concats
the two arrays, you would create an append only list._

```js
const person = new ArraySchema({}, {
    merge: (prev, next) => prev.concat(next)
});
```


## Methods

### .normalize()
<Normalize />

### .denormalize()
<Denormalize />

