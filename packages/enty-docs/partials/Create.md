**type:** `(entity: A) => B`  
**default:** `(entity) => entity`

When an EntitySchema finds a new entity it will call the create function on its shape before
storing the data in state. _You can use this to construct custom classes for your entities._

