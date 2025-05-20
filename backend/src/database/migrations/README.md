# Migrations

The migrations are loaded and executed by Knex itself. It seems Knex expects CommonJS modules and does not support
TypeScript. Additionally, there were problems when importing types from TypeScript from the backend, or from the
commons package due to other (ESM-only) dependencies. Therefore, the migrations and database types use their own
CommonJS package. 
