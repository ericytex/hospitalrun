import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';

moduleForModel('patient', 'Unit | Model | patient', {
  needs: [
    'config:environment',
    'ember-validations@validator:local/format',
    'ember-validations@validator:local/presence',
    'locale:en/config',
    'locale:en/translations',
    'model:allergy',
    'model:diagnosis',
    'model:operation-report',
    'model:operative-plan',
    'model:payment',
    'model:price-profile',
    'service:i18n',
    'util:i18n/compile-template',
    'util:i18n/missing-message'
  ],
  beforeEach() {
    // set the locale and the config
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('locale:en/config', localeConfig);

    Ember.getOwner(this).inject('model', 'i18n', 'service:i18n');

    // register t helper
    this.registry.register('helper:t', tHelper);
  }
});

test('displayAddress', function(assert) {
  let patient = this.subject({
    address: '123 Main St.',
    address2: 'Apt #2',
    address4: 'Test'
  });

  assert.strictEqual(patient.get('displayAddress'), '123 Main St., Apt #2, Test');
});
