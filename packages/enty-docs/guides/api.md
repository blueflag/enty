---
title: Entity Api
group: Tutorials
---
_This is an introductory description of the EntityApi. For specific details of
their types and methods check the [Api](/docs/data/EntityApi)._

The EntityApi provides a standard way to separate your data fetching code from your views.
It lets you declare groups of Promise or Observable returning functions that are converted to hooks.

These hooks handle when data is requested and it is normalized into state. They then provide your
views with a consistent data structure that holds both the most up to date version of your requested
data and what stage the request cycle is currently in.

This abstraction is helpful as it creates a clean barrier between your data fetching code and your views.


## Declaring an API
The EntityApi function takes your application schema and an object of promise returning functions 
Below is an example of an api that can fetch both users and jobs from a graphql server.

```js
import {EntityApi} from 'react-enty';
import ApplicationSchema from './ApplicationSchema';

const api = EntityApi({
    user: {
        item: variables => fetch('/graphql', {query: serItemQuery, variables}),
        list: variables => fetch('/graphql', {query: UserListQuery, variables}),
    },
    job: {
        item: variables => fetch('/graphql', {query: JobItemQuery, variables}),
        list: variables => fetch('/graphql', {query: JobListQuery, variables})
    }
}, ApplicationSchema);

export UserItemRequestHook = api.user.item.useRequest
export UserListRequestHook = api.user.list.useRequest
export JobItemRequestHook = api.job.item.useRequest
export JobListRequestHook = api.job.list.useRequest
```

## Sharing
Because the api is declared up front it is very easy to split your core api into smaller parts.

```js
// UserApi.js
export default {
    item: (variables) => fetch('/graphql', {query: UserItemQuery, variables}),
    list: (variables) => fetch('/graphql', {query: UserListQuery, variables}),
    create: (variables) => fetch('/graphql', {query: UserCreateMutation, variables})
}


// ApplicationApi.js
import {EntityApi} from 'react-enty';
import ApplicationSchema from './ApplicationSchema';
import user from './UserApi';
import coffee from './CoffeeApi';
import cat from './CatApi';

const Api = EntityApi({
    user,
    coffee,
    cat
}, ApplicationSchema);

```

## Non prescriptive
TODO: Because promises and observables are standard you can use any promise returning logic. 

## Api shimming
One of the benefits of declaring your api separate to your views is that it provides a space
to shim data before it enters your app. If an external api can only provide you with data in a certain 
shape you can change it to a shape that makes sense to your entities before normalizing.

Say you are integrating with a rest endpoint that returns an array of user but because your application 
schema can support multiple types it really makes sense to return an object with the key of `userList`
that contains an array of users.

```js
EntityApi(ApplicationSchema, {
    userList: (payload) => fetch('/api/users', payload)
        .then(userList => ({userList}))
});
```

