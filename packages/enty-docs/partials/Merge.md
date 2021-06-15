**type:** `(previous: A, next: B) => C`  
**default:** <inlineCode children={props.default} />

When an EntitySchema finds an entity, before storing it in state it checks to see if it has already
been normalized. If it finds an existing entity it will use the merge function on its shape to 
combine the two. 
