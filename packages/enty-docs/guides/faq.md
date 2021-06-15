---
id: faq
title: FAQ
group: Resources
---


### How do I handle endpoints that return arrays?
The cleanest way is to add a new service to your api and modify the data before it is given to Enty

```js
// EntityApi.js
const Api = EntityApi(ApplicationSchema, {
    userList: payload => request('/user', payload).then(data => ({userList: data}))
});
```

