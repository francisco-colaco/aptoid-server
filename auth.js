/** @module auth
 *
 * Provide middleware to check the authentication (through a cookie).  Provide
 * also a method to check the user credentials when an user logs in.
 *
 * This module is SCHEMATIC and basically, while not inherently insecure, a stub
 * for better implementations. The ancillary authentication method herein does
 * not use a database nor establishes separate sessions.
 *
 * To incorporate a database or any backend authentication method, please see
 * the methods @see authToken and @see checkAuth.
 *
 * @todo Scaffold module, to be replaced.
 * @author Francisco Miguel Colaço
 */

import crypto from 'crypto';


const Auth = {
  users: ['user1', 'user2', 'user3'],
  password: 'user123',
};


/**
 * Return the authentication token.
 *
 * @param {string} username - The name of the user.
 * @return {string} The user token.
 */
function authToken(username) {
  const password = Auth.password;
  const tk = crypto.createHash('md5').update(`${username}:${password}`).digest('hex');
  return `${username} ${tk}`;
}


/**
 * Check if the token is a valid token for an user.
 *
 * @param {string} token - The token to be checked.
 * @return {boolean} True if the token is valid, false otherwise.
 */
function checkToken(token) {
  const username = token.split(' ')[0];
  return token === authToken(username);
}


/**
 * Check the authentication.
 *
 * @param {string} username - The name of the user.
 * @param {string} password - The password.
 * @return {string,null} The user token or null.
 */
export function checkAuth(username, password) {
  let token = null;

  if (Auth.users.includes(username) && (password === Auth.password)) {
    token = authToken(username);
  }
  return token;
}


/**
 * Middleware to assert the authentication.
 *
 * On public routes, the authentication cookie is not checked at all.
 *
 * On every other route, private, if the cookie is missing or invalid, the
 * response is redirected to the login page. If the user token is valid, then
 * the response is normal. The login page is a public route, as necessarily
 * needs to be.
 *
 * When a user is authenticated, then the request will have a field named 'user'
 * with the user name. This field is available to all routes, proving a
 * successful autentication.
 *
 * @param {string} username - The name of the user.
 * @param {string} password - The password.
 * @return {string,null} The user token or null.
 */
export function checkAuthentication(req, res, next) {
  if (!(/^\/users/.test(req.path))) {
    const token = req.cookies.auth;

    if (token && checkToken(token)) {
      req.user = token.split(' ')[0];
      return next();
    } else {
      return res.redirect('/users');
    }
  }
  return next();
}


/** Export the module default object.
 *
 * Some of the default object exports are also module exports.
 */
export default {
  checkAuth,
  checkAuthentication,
};
