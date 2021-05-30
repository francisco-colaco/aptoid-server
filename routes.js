/** @module routes
 *
 * Routes and actions for the web application.
 *
 * @author    Francisco Miguel Colaço <francisco.colaco@gmail.com>
 *
 * @description
 * Provide routes and actions for the web application.
 */

import B from './bucket.js';
import pug from 'pug';
import fsp from 'fs/promises';


import { checkAuth } from './auth.js';


/** The main page template handler. */
const mainPageTemplate = pug.compileFile('./templates/mainPage.pug');

/** The login page template handler. */
const loginPageTemplate = pug.compileFile('./templates/loginPage.pug');


/**
 * Handle the main page.
 *
 * @param req The request.
 * @param res The response.
 */
async function mainPage(req, res) {
  const files = await B.listObjects(req.user);
  const data = {
    user: req.user,
    files: files,
    error: res.errorMessage || null,
  };

  const r = mainPageTemplate(data);
  res.send(r);
}


/**
 * Handle the document view page.
 *
 * At most browsers, the page won't be shown. Instead, the file shall be
 * downloaded.
 *
 * @param req The request.
 * @param res The response.
 */
async function viewPage(req, res) {
  const filename = req.params.filename;

  if (!filename) {
    res.redirect('/');
    return;
  }

  try {
    const data = await B.viewObject(req.user, filename);

    const dirname = 'data/' + req.user;

    await fsp.mkdir(dirname, { recursive: true });

    const fname = dirname + '/' + filename;

    // Write the file to be served.
    {
      let fh;
      try {
        fh = await fsp.open(fname, 'w');
        await fh.writeFile(data.Body);
      } catch(err) {
        console.info('Error', err);
      } finally {
        await fh?.close();
      }
    }

    const absName = `${process.cwd()}/${fname}`;
    await res.download(absName, filename,
                       {
                         headers: {
                           'content-type': 'application/pdf',
                         },
                       });

    // Do not unlink the file right away.  Seems to fail.  Wait a while
    // before doing it.
    setTimeout(() => fsp.unlink(fname), 30000);

  } catch(err) {
    console.info('About to redirect', err);
    res.redirect('/');
  }
}


/**
 * Handle the deletion of an object.
 *
 * @param req The request.
 * @param res The response.
 */
async function deleteAction(req, res) {
  const filename = req.params.filename;

  if (filename) {
    await B.deleteObject(req.user, filename);
  }
  res.redirect('/');
}


/**
 * Handle the upload of an object.
 *
 * The file is passed at the request.  The name must end in '.pdf'
 * to be accepted.  At the end of the request, a redirection to '/' is
 * triggered to reflect the new situation, regardless of the success
 * of the upload.
 *
 * A file is written at a temporary directory (prone to be a memfs mount)
 * and will remain there for a time.
 *
 * @param req The request.
 * @param res The response.
 */
async function uploadAction(req, res) {
  if (!req.files) {
    return res.redirect('/');
  }
  const file = req.files.pdf;

  if (!file || !file.name || !file.name.endsWith('.pdf')) {
    res.errorMessage = 'Invalid file when uploading.  Please retry.';
  } else {
    await B.uploadObject(req.user, file.name, file.data);
  }
  res.redirect('/');
}


/**
 * Show the login page.
 *
 * @param req The request.
 * @param res The response.
 */
async function loginPage(req, res) {
  const data = { error: null };

  const r = loginPageTemplate(data);
  res.send(r);
}


/**
 * Handle authentication.
 *
 * If good and valid credentials are supplied, a cookie is set to signal the
 * authentication and a redirection will be performed to '/'.
 *
 * If not, the login form is redisplayed.
 *
 * @param req The request.
 * @param res The response.
 */
async function loginAction(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const token = checkAuth(username, password);
  if (token) {
    res.cookie('auth', token);
    res.redirect('/');
  } else {
    const r = loginPageTemplate({
      error: true,
    });
    res.send(r);
  }
}


/**
 * Handle logout.
 *
 * The authentication cookie is deleted (max age set to the past), and
 * a redirection to the login page will be performed.
 *
 * @param req The request.
 * @param res The response.
 */
async function logoutAction(req, res) {
  res.clearCookie('auth');
  res.redirect('/users');
}


/** Export the module default object. */
export default {
  mainPage,
  viewPage,
  deleteAction,
  uploadAction,
  loginPage,
  loginAction,
  logoutAction,
};
