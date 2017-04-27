import Ember from 'ember';
import FakeServer, { stubRequest } from 'ember-cli-fake-server';
import PouchDB from 'pouchdb';
import PouchAdapterMemory from 'npm:pouchdb-adapter-memory';
import startApp from 'hospitalrun/tests/helpers/start-app';
import { PREDEFINED_USER_ROLES } from 'hospitalrun/mixins/user-roles';
import { module, test } from 'qunit';

const MOCK_USER_DATA = [{
  'id': 'org.couchdb.user:hradmin',
  'key': 'org.couchdb.user:hradmin',
  'value': { 'rev': '1-242f3d5b5eb8596144f8a6300f9f5a2f' },
  'doc': {
    '_id': 'org.couchdb.user:hradmin',
    '_rev': '1-242f3d5b5eb8596144f8a6300f9f5a2f',
    'password_scheme': 'pwdscheme',
    'iterations': 10,
    'name': 'hradmin',
    'roles': ['System Administrator', 'admin', 'user'],
    'type': 'user',
    'userPrefix': 'p',
    'derived_key': 'derivedkeyhere',
    'salt': 'saltgoeshere',
    'displayName': 'HospitalRun Administrator',
    'email': 'hradmin@hospitalrun.io'
  }
}, {
  'id': 'org.couchdb.user:joe@donuts.com',
  'key': 'org.couchdb.user:joe@donuts.com',
  'value': {
    'rev': '1-ef3d54502f2cc8e8f73d8547881f0836'
  },
  'doc': {
    '_id': 'org.couchdb.user:joe@donuts.com',
    '_rev': '1-ef3d54502f2cc8e8f73d8547881f0836',
    'password_scheme': 'pbkdf2',
    'iterations': 10,
    'displayName': 'Joe Bagadonuts',
    'email': 'joe@donuts.com',
    'name': 'joe@donuts.com',
    'roles': ['Hospital Administrator', 'user'],
    'userPrefix': 'p01',
    'type': 'user',
    'derived_key': 'derivedkeyhere',
    'salt': 'saltgoeshere'
  }
}];

const {
  RSVP
} = Ember;

function addAllUsers(assert) {
  if (window.ELECTRON) {
    return _addOfflineUsers();
  }
  stubRequest('get', '/db/_users/_all_docs', function(request) {
    let expectedQuery = {
      include_docs: 'true',
      startkey: '"org.couchdb.user"'
    };
    assert.equal(JSON.stringify(request.queryParams), JSON.stringify(expectedQuery), 'All Users request sent to the server');
    request.ok({
      'total_rows': 1,
      'offset': 1,
      'rows': MOCK_USER_DATA
    });
  });
  return RSVP.resolve();
}

function _addOfflineUsers() {
  return wait().then(() => {
    PouchDB.plugin(PouchAdapterMemory);
    let usersDB = new PouchDB('_users', {
      adapter: 'memory'
    });
    let [, joeUser] = MOCK_USER_DATA; // hradmin already added by run-with-pouch-dump
    delete joeUser.doc._rev;
    return usersDB.put(joeUser.doc);
  });
}

module('Acceptance | users', {
  beforeEach() {
    FakeServer.start();
    this.application = startApp();
  },

  afterEach() {
    FakeServer.stop();
    Ember.run(this.application, 'destroy');
  }
});

test('visiting /admin/users', function(assert) {
  runWithPouchDump('default', function() {
    let role = PREDEFINED_USER_ROLES.findBy('name', 'User Administrator');
    authenticateUser({
      roles: role.roles,
      role: role.name,
      authenticated: {
        role: role.name
      }
    });
    addAllUsers(assert);
    andThen(() => {
      visit('/'); // Default home page for User Administrator is admin/users
      andThen(function() {
        assert.equal(currentURL(), '/admin/users', 'User Administrator initial page displays');
        assert.equal(find('td.user-display-name:first').text(), 'HospitalRun Administrator');
        assert.equal(find('td.user-name:first').text(), 'hradmin');
        assert.equal(find('td.user-email:first').text(), 'hradmin@hospitalrun.io');
        assert.equal(find('td.user-role:first').text(), 'System Administrator');
      });
    });
  });
});

test('create new user', function(assert) {
  runWithPouchDump('default', function() {
    authenticateUser();
    addAllUsers(assert);
    andThen(() => {
      visit('/admin/users');
      stubRequest('put', '/db/_users/org.couchdb.user:jane@donuts.com', function(request) {
        let expectedBody = {
          _id: 'org.couchdb.user:jane@donuts.com',
          deleted: false,
          displayName: 'Jane Bagadonuts',
          email: 'jane@donuts.com',
          name: 'jane@donuts.com',
          password: 'password',
          roles: ['Hospital Administrator', 'user'],
          userPrefix: 'p02',
          type: 'user'
        };
        assert.equal(request.requestBody, JSON.stringify(expectedBody), 'New user data sent to the server');
        request.ok({
          'ok': true,
          'id': 'org.couchdb.user:jane@donuts.com',
          'rev': '1-ef3d54502f2cc8e8f73d8547881f0836'
        });
      });

      visit('/admin/users/edit/new');
      andThen(function() {
        select('.user-role', 'Hospital Administrator');
        fillIn('.user-display-name input', 'Jane Bagadonuts');
        fillIn('.user-email input', 'jane@donuts.com');
        fillIn('.user-password input', 'password');
        click('button:contains(Add)');
        waitToAppear('.modal-dialog');
        andThen(() => {
          assert.equal(find('.modal-title').text(), 'User Saved', 'User was saved successfully');
          assert.equal(find('.view-current-title').text(), 'Edit User', 'Page title changed to Edit User');
        });
        click('button:contains(Ok)');
      });
    });
  });
});

test('delete user', function(assert) {
  runWithPouchDump('default', function() {
    authenticateUser();
    addAllUsers(assert);
    andThen(() => {
      stubRequest('put', '/db/_users/org.couchdb.user:joe@donuts.com', function(request) {
        let expectedBody = {
          _id: 'org.couchdb.user:joe@donuts.com',
          derived_key: 'derivedkeyhere',
          deleted: true,
          displayName: 'Joe Bagadonuts',
          email: 'joe@donuts.com',
          iterations: 10,
          name: 'joe@donuts.com',
          password_scheme: 'pbkdf2',
          _rev: '1-ef3d54502f2cc8e8f73d8547881f0836',
          roles: ['deleted'],
          salt: 'saltgoeshere',
          userPrefix: 'p01',
          type: 'user'
        };
        assert.equal(request.requestBody, JSON.stringify(expectedBody), 'Delete user request sent to the server');
        request.ok({
          'ok': true,
          'id': 'org.couchdb.user:joe@donuts.com',
          'rev': '1-ef3d54502f2cc8e8f73d8547881f0836'
        });
      });

      visit('/admin/users');
      andThen(function() {
        click('button:contains(Delete):last');
        waitToAppear('.modal-dialog');
        andThen(() => {
          assert.equal(find('.alert').text().trim(), 'Are you sure you wish to delete ?', 'User is displayed for deletion');
        });
        click('button:contains(Delete):last');
        andThen(() => {
          assert.equal(find('.user-email:contains(joe@donuts.com)').length, 0, 'User disappears from user list');
        });
      });
    });
  });
});
