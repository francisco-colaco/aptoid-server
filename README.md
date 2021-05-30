# READ-R site.

This is a chanllenge for Aptoid (hopefully not reading the code). Built from
scratch, it offers a way to store, delete, list and retrieve objects (files) for
Amazon S3 Buckets.


## Rationale

This is an exercise on templating and server-side rendering. With more time,
some client-side rendering could be coded in to improve the user experience,
namely fetching results from a REST server and rendering the list of objects
at the client.

The server has four modules:

+ auth.js :: handles authentication and authorisation.

+ bucket.js :: lists buckets, uploads, deletes and retrieves objects.  Ensures
     the existence of the application bucket.
     
+ routes.js :: establishes routes and actions for the applicational server.

+ server.js :: controls the server life cycle.

The =pug= templates are in their own directory, =templates/=.

Some resource files live in =static/=.

test.js defines a test suite to cover some of the modules.


## Installation instructions

Use =npm= to install all dependencies:

```bash
npm install
```

## Start the server

```bash
npm start
```

## Run the test suite

```bash
npm test
```

