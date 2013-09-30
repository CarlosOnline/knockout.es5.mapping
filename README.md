ko.es5.mapping
==============

knockout.es5.mapping

Knockout ES5 track nested objects
/* Knockout ES5 track nested objects: TypeScript version.
Solves the problem of ko.track not traversing into nested objects.
Calls ko.es5.track on nested objects: allowing tracking of strings, numbers, & arrays.
Use ko.es5.computed(function() ...) to mark computed functions.  ko.es5.track will call ko.defineProperty on these marked functions, after calling ko.track on the primitive members.
Excludes nested functions/objects with named constructors.  Idea is that TypeScript classes with constructors can call ko.es5.track themselves.  This exclusion can be removed.
Does not traverse into nested classes/objects with named constructors will not be traversed.  These constructors should call ko.es5.track themselves.
Does not yet handle properties.