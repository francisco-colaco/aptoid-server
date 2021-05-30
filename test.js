/** @module test
 *
 * Test suite of the READ-R site.
 */

/* global process */
import chai from 'chai';
import chaiHttp from 'chai-http';

// Configure chai
chai.use(chaiHttp);
const expect = chai.expect;
chai.should();


import Auth from './auth.js';
import B from './bucket.js';


describe('Users', () => {
  describe('User authentication', () => {
    it('will allow correct credentials.', (done) => {
      const t = Auth.checkAuth('user1', 'user123');
      t.should.be.a('string').and.match(/^user1 /);
      done();
    });
    it('will disallow incorrect user.', (done) => {
      const t = Auth.checkAuth('spy', 'user123');
      expect(t).to.not.exist;
      done();
    });
    it('will disallow incorrect password.', (done) => {
      const t = Auth.checkAuth('user2', 'invalid');
      expect(t).to.not.exist;
      done();
    });
    it('will disallow empty username.', (done) => {
      const t = Auth.checkAuth('', 'invalid');
      expect(t).to.not.exist;
      done();
    });
    it('will disallow empty password.', (done) => {
      const t = Auth.checkAuth('user1', '');
      expect(t).to.not.exist;
      done();
    });
    it('will disallow null password.', (done) => {
      const t = Auth.checkAuth('user1', null);
      expect(t).to.not.exist;
      done();
    });
  });
  describe('User bucket objects.', () => {
    it('will be correctly named', (done) => {
      const t = B.getUserObject('user1','file.pdf');
      expect(t).to.be.a('string').and.equal('user1/file.pdf');
      done();
    });
    it('will ensure the bucket existence.', (done) => {
      B.ensure().then(r => {
        setTimeout(() => {
          expect(r).to.be.true;
          done();
        });
      });
    });
    it('will be correctly listed.', (done) => {
      B.listObjects('user1').then(xs => {
        setTimeout(() => {
          expect(xs).to.be.a('array');
          done();
        });
      });
    });
    it('will return an empty list on invalid user.', (done) => {
      B.listObjects('soy').then(xs => {
        setTimeout(() => {
          expect(xs).to.be.a('array').and.to.have.length(0);
          done();
        });
      });
    });
  });
  describe('The authentication process', () => {
    it('redirects when the credentials are validated.', (done) => {
      chai.request('http://localhost:8000')
        .post('/users')
        .type('form')
        .send({ username: 'user1', password: 'user123' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.request).to.haveOwnProperty('_redirectList').with.length(2);
          expect(res.request._redirectList[0]).to.match(/^http[s]?:\/\/.*\/$/);
          expect(res.request._redirectList[1]).to.match(/^http[s]?:\/\/.*\/users$/);
          done();
        });
    });
    it('does not redirect when the credentials are invalid.', (done) => {
      chai.request('http://localhost:8000')
        .post('/users')
        .type('form')
        .send({ username: 'no-one', password: 'user123' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.request).to.haveOwnProperty('_redirectList').with.length(0);
          done();
        });
    });
    it('does not redirect when the password isn\'t supplied.', (done) => {
      chai.request('http://localhost:8000')
        .post('/users')
        .type('form')
        .send({ username: 'user1' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.request).to.haveOwnProperty('_redirectList').with.length(0);
          done();
        });
    });
    it('does not redirect on empty form.', (done) => {
      chai.request('http://localhost:8000')
        .post('/users')
        .type('form')
        .send({ })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.request).to.haveOwnProperty('_redirectList').with.length(0);
          done();
        });
    });
    it('will redirect on logout.', (done) => {
      chai.request('http://localhost:8000')
        .get('/users/logout')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.request).to.haveOwnProperty('_redirectList').with.length(1);
          expect(res.request._redirectList[0]).to.match(/^http[s]?:\/\/.*\/users$/);
          done();
        });
    });
  });
});
