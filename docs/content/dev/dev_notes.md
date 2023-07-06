# Development Notes

This document collects notes and decisions taken during the development of HedgeDoc 2.0.
It should be converted to a properly structured documentation, but having unstructured docs
is better than having no docs.

## Supported databases

We intend to officially support and test these databases:

- SQLite (for development and smaller instances)
- PostgreSQL
- MariaDB

## Special Groups

The software provides two special groups which have no explicit users:

- `everyone` (Describing that everyone who wants to access a note can do if it is
   enabled in the config.)
- `loggedIn` (Describing all users which are logged in)

## Entity `create` methods

Because we need to have empty constructors in our entity classes for TypeORM to work, the actual
constructor is a separate `create` method. These methods should adhere to these guidelines:

- Only require the non-optional properties of the corresponding entity
- Have no optional parameters
- Have no lists which can be empty (so probably most of them)
- Should either return a complete and fully useable instance or return a Pick/Omit type.
- Exceptions to these rules are allowed, if they are mentioned in the method documentation
