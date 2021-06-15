---
id: map-schema
title: Map Schema
group: Enty Immutable
---

The MapSchema is identical in function to [ObjectSchema] but its shape and merge functions
will cast your object to an immutable map. _This is especially useful when working with immutable 
data structures as all data creation can be handled by your schema. Just describe the shapes that 
your apis will return and Enty will automatically construct all of your maps and lists for you._

## Params
```js
new MapSchema(shape: {[key: string]: Schema});

```
### shape 
**type:**`{[key: string]: StructuralSchema}`  
**default:** `{}`

A javascript object that describes the relationships to other schemas. 
_Note: you only have to define the keys that hold relationships._

```js
const person = new EntitySchema('person')
person.shape = new MapSchema({
    friend: person,
    enemy: person
});
```

## Methods
### .normalize()
<Normalize />

### .denormalize()
<Denormalize />

