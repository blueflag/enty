---
id: entity-flow
title: Entity Flow
group: Resources
---

1. **RequestHoc.request triggered**  
The Enty data flow begins when a RequestHoc's request is called. This either happens automatically
based on `config.auto` or as the result of user interaction.

2. **Data Request**  
The result of the payloadCreator is hashed to create a responseKey. This key is what identifies this
particular request in state. The API function is called and the view is re rendered with a Fetching 
or Refetching requestState in the `Message`.

If the promise resolves Enty moves on to normalizing. If the promise rejects the view is rerendered
with an Error requestState.

3. **Normalize**    
The successful response is passed into schema.normalize, which will in turn call schema.normalize 
recursively on its children as defined. Entities found are collected under their schema type and the 
result of their id function. These entities are passed through their shape 
function and if that entity already exists in state, the existing and new entities are passed through 
the shapes merge function.

4. **Results & Entities Stored**  
The collected entities are merged into state and the normalized response is stored under its repsonseKey.

5. **Views Updated**  
The RequestHoc now uses its responseKey to select the normalized response out of state and pass
that through the appliction schema's denormalize function. The view is re-rendered with a Success
request state and the response is now the most up to date version of the entities requested 
through the api.




