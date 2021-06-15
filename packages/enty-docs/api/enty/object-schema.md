---
title: Object Schema
group: Enty
---

The ObjectSchema is a structural schema used to define relationships in objects.

## Params
```js
new ObjectSchema(
    shape: {
        [key: string]: Schema
    }
    options?: {
        shape: (entity: A) => B,
        merge: (previous: A, next: B) => C
    }
);

```
### shape 
**type:**`{[key: string]: string}`  
**default:** `{}`

A javascript object that describes the relationships to other schemas. 
_Note: you only have to define the keys that hold relationships._

```js
const person = new EntitySchema('person')

person.shape = new ObjectSchema({
    friend: person,
    enemy: person
});
```

### options.create 
<Create />

```
const person = new ObjectSchema({}, {
    create: (data) => new Person(data)
});

const user = new EntitySchema('user');
user.shape = person;
```

### options.merge 
**default:**
<Merge default="(previous, next) => ({...previous, ...next})"/>


```js
const person = new ObjectSchema({}, {
    create: item => new Person(item),
    merge: (prev, next) => prev.merge(next)
});
```


## Methods

### .normalize()
<Normalize />

### .denormalize()
<Denormalize />
