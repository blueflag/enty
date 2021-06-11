---
id: introduction
title: Introduction
group: Tutorials
---

Enty is a framework for managing data requested from APIs. Instead of you manually storing data, 
Enty uses schemas to describe relationships and stores the data as normalized entities. This has 
some nice benefits:

* Data given to views is always up to date.
* There is practically no data handling code.
* Data fetching is cleanly separated from views. 
* Everything is declarative. 
* Bad relationships in data become clear.
* Pairs wonderfully with graphql.


## Purpose

Any webapp that involves both a back and a front end will create entities.  Unique pieces of data 
that are known by an id.  The back end might call them models, the front end might call them 
application state, let's call them entities.

When the client side thinks of storing these entities in terms of endpoints and stores 
(or even actions and reducers) it's another set of hands touching the data. 
It allows more places for shady hacks to creep in. It allows more places for code to become brittle.
It allows more places for the code to break.

This endpoints and stores technique also forces the front-end to recreate 
relationships between entities. Storing data by type in isolated stores logically makes sense, 
but when a view visually combines two entities you force the front end to know how best to reconstruct 
this relationships. This is not an insurmountable problem but as the code base grows so will 
the places where the front end has to know some specific detail and so will the places where things can go wrong.

In reality the front end doesn't care where the data came from or how it is stored. It just wants 
to be able to ask for a set of them and know when its safe to render them.

Enty lets you describe the relationships of your entities through schemas. It is then able to store
them in a normalized state. This means that they are not stored by request but by the unique id that
they were given by the back-end.

