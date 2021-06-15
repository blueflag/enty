---
title: useRemove
group: React Enty
---

The useRemove hook provides a way to remove entities from state.

It returns a functon that when invoked with a name and id will remove that entity from all responses.

```flow
useRemove(): (name: string, id: string) => void
```

## Examples

```jsx
import api from './api';

export default function RemovePet({id}) {
    const onRemove = api.useRemove();
    return <button onClick={() => onRemove({id})}>Remove {id}</button>
}
```
