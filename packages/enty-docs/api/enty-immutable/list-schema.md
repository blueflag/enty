---
id: list-schema
title: List Schema
group: Enty Immutable
---

The ListSchema is identical in function to [ArraySchema] but its shape and merge functions
will cast your list to an immutable list. _This is especially useful when working with immutable 
data structures as all data creation can be handled by your schema. Just describe the shapes that 
your apis will return and Enty will automatically construct all of your maps and lists for you._


## Params

```js
new ListSchema(
    shape: StructuralSchema,
    options?: {
        create: (entity: A) => B
    }
);
```

### shape 
**type:** `StructuralSchema`  

A single structural schema that describes what is in this collection.

```js
const person = new EntitySchema('person');
const friends = new ListSchema(person);
```

### options.shape 
**type:** `(entity: A) => B`  
**default:** `(entity) => Immutable.List(entity)`


### options.merge 
**type:** `(previous: A, next: B) => C`  
**default:** `(previous, next) => previous.merge(next)`


## Methods

### .normalize()
<Normalize />

### .denormalize()
<Denormalize />

