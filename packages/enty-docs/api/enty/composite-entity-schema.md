---
title: Composite Entity Schema
group: Enty
---

Sometimes a backend will merge two data types together and in the process create an entity that is 
not possible to normalize - Enty calls this a Tainted Entity. Consider a course page that shows
the completion state for the current user. The client makes a request to the course completion
endpoint and the server responds with a course object with an attached completion. 


```js
// /course/completion?user=derek.tibbs
{
    id: 'mf101',
    name: 'Making Friends 101'
    duration: '10 weeks',
    completion: {
        id: '456',
        grade: 'A',
        user: 'derek.tibbs',
        completedAt: "2019-02-20"
    }
}
```

This works fine for a single page, but when we try to normalize multiple course completions we 
realise that each different normalization is affecting the `mf101` course entity and whoever 
normalizes last is the winner.

The CompositeEntitySchema lets you declare which keys are tainting your entity. Enty is then 
able to extract and normalize them separately.


## Params
```flow
new CompositeEntitySchema(
    name: string,
    options?: {
        compositeKeys: {
            [key: string]: Schema
        },
        shape: StructuralSchema,
        id: (*) => string
    }
);
```

### name 
<Name />

```js
const course = CompositeEntitySchema('course');
```

### options.shape 

Defines the main shape of the composite entity.

```js
const course = CompositeEntitySchema('course', {
    shape: course
});
```


### options.compositeKeys
**type:** `{[key: string]: Schema}`  

An object mapping of the keys that are tainting this entity and the schema that they belong to.

```js
const completion = new EntitySchema('completion', {shape: new ObjectSchema({}));
const course = CompositeEntitySchema('course', {
   shape: course,
   compositeKeys: {
        completion
   }
});
```


### options.id
<Id/>

```js
const course = new CompositeEntitySchema('course', {
    id: (course) => course.id
});
```

## Methods

### .normalize()
<Normalize />

### .denormalize()
<Denormalize />
