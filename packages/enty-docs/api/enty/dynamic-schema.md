---
title: Dynamic Schema
group: Enty
---

The dynamic schema lets you choose a schema based on the data that is being normalized. 
For its shape, this schema takes a function that will be called with the data. The return value of
that function will then be used to continue the normalizing. _This is useful if you have 
non-homogeneous arrays or union types._

## Params
```js
new DynamicSchema(shape: (*) => Schema);
```

### shape 
**type:** `(*) => Schema`  

A function that will be given the current data that must return a schema to 
normalize it with.

```js
const group = new EntitySchema('group');
const user = new EntitySchema('user');

const groupOrUser = new DynamicSchema((data) => {
    const schemaTypes = {group, user};
    return schemaTypes[data.type];
});
```


## Methods

### .normalize()
<Normalize />

### .denormalize()
<Denormalize />


## Examples

### Non-homogeneous Array
If you have a array that contains multiple types of object the ArraySchema alone wont quite work
because it can only handle homogeneous arrays. The dynamic schema can let you inspect each item
and choose the appropriate schema to normalize it with.

```js live=true
function NonHomogeneousArrayExample() {
    const account = new EntitySchema('account', {shape: {}});
    const group = new EntitySchema('group', {shape: {}});
    const user = new EntitySchema('user', {shape: {}});

    const thing = new DynamicSchema((data) => {
        const schemaTypes = {
            account,
            group,
            user
        };
        const schema = schemaTypes[data.type];
        if(!schema) throw `No schema found for ${data.type}`;
        return schema;
    });


    return <JSON>{new ArraySchema(thing).normalize([
        {id: '1', type: 'user', name: 'Steve'},
        {id: '2', type: 'group', name: 'Steves Group'},
        {id: '3', type: 'account', name: 'Steves Account'}
    ])}</JSON>;
}
```



### Union Type
Similar to the above example, DynamicSchemas can be used when a key in an object
contains more than one data type.

```js live=true
function UnionExample() {
    const account = new EntitySchema('account', {shape: {}});
    const group = new EntitySchema('group', {shape: {}});
    const accountOrGroup = new DynamicSchema((data) => {
        const schemaTypes = {account, group};
        return schemaTypes[data.type];
    });

    const user = new EntitySchema('user', {shape: {
        parent: accountOrGroup
    }});

    const userList = new ArraySchema(user);
    
    return <JSON>{userList.normalize([
        {id: '1', parent: {id: 'a1', type: 'account', name: 'account 1'}},
        {id: '2', parent: {id: 'g1', type: 'group', name: 'group 1'}},
        {id: '3', parent: {id: 'g2', type: 'group', name: 'group 2'}}
    ])}</JSON>;
}
```

