/* eslint-env node */
/* eslint no-var: 0 */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'hospitalrun',
    environment: environment,
    rootURL: process.env.EMBER_CLI_ELECTRON ? null : '/',
    locationType: 'hash', // Using hash location type because it is more friendly for offline.
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  ENV.contentSecurityPolicy = {
    'connect-src': "'self'",
    'default-src': "'self'",
    'frame-src': "'self'",
    'img-src': "'self' filesystem: data: blob:",
    'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
    'style-src': "'self' 'unsafe-inline'"
  };

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  ENV.i18n = {
    defaultLocale: 'en'
  };

  ENV.manifest = {
    enabled: true,
    appcacheFile: '/manifest.appcache',
    excludePaths: ['index.html', 'tests/index.html', 'robots.txt', 'crossdomain.xml', 'testem.js'],
    showCreateDate: true
  };

  if (process.env.EMBER_CLI_ELECTRON) {
    ENV.serviceWorker = {
      enabled: false,
      includeRegistration: false
    }
  } else {
    ENV.serviceWorker = {
      enabled: true,
      debug: true,
      excludePaths: ['manifest.appcache'],
      swIncludeFiles: [
        'node_modules/pouchdb/dist/pouchdb.js'
      ]
    };
    if (environment === 'production') {
      ENV.serviceWorker.debug = false;
    }
  }
  if (environment === 'test') {
    ENV.serviceWorker.includeRegistration = false;
  }

  ENV.emberFullCalendar =  {
    includeScheduler: true,
    schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
  };

  return ENV;
};
