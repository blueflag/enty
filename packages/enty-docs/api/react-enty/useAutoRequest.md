---
title: useAutoRequest
group: React Enty
---

useAutoRequest is a thin wrapper around useEffect that makes it easy to request
data when a component mounts or when props change.

The request function will be fired once when the component mounts and will refire any time one of the dependencies changes.



```flow
useAutoRequest(requestFn: Function, dependencies: Array<any>)
```

### Request on mount
```js
import {useAutoRequest} from 'react-enty';

function PetList() {
    const message = api.petList.useRequest();
    useAutoRequest(() => message.request());
    //...
}
```


### Request when props change
```js
import {useAutoRequest} from 'react-enty';

function UserProfile() {
    const {id} = props;
    const message = api.userProfile.useRequest();
    useAutoRequest(() => message.request({id}), [id]);
    // ...
}
```

