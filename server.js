

import express from 'express';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';

import Routes from './routes.js';
import Bucket from './bucket.js';
import { checkAuthentication } from './auth.js';

/**
 * The port on which the app runs.
 */
const port = 8000;

// Create and configure the application.
const app = express();
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkAuthentication);
app.use(fileUpload());

// Top level await if finally recognised.  Yes!!!
await Bucket.ensure();

// Establish the routes.
app.get('/', Routes.mainPage);
app.post('/files/upload', Routes.uploadAction);
app.get('/files/delete/:filename', Routes.deleteAction);
app.get('/files/:filename', Routes.viewPage);

app.get('/users', Routes.loginPage);
app.post('/users', Routes.loginAction);
app.get('/users/logout', Routes.logoutAction);

// Start the application on all interfaces.
app.listen(port, () => {
  console.info(`Server started at port ${port}.`);
});
