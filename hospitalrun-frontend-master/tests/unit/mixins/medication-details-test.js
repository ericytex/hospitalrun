import MedicationDetails from 'hospitalrun/mixins/medication-details';
import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import DS from 'ember-data';

moduleFor('mixin:medication-details', 'Unit | Mixin | medication-details', {
  needs: [
    'ember-validations@validator:local/numericality',
    'ember-validations@validator:local/presence',
    'model:inventory',
    'model:inv-purchase',
    'model:inv-location'
  ],
  subject(attrs) {
    let subject;
    Ember.run(() => {
      let Test = DS.Model.extend(MedicationDetails);
      this.register('model:test', Test);
      subject = this.store().createRecord('test', attrs);
    });

    return subject;
  },
  store() {
    return this.container.lookup('service:store');
  }
});

test('getMedicationName', function(assert) {
  let medicationDetails = this.subject({
    medicationTitle: 'Medication Title'
  });

  assert.strictEqual(medicationDetails.getMedicationName(), 'Medication Title');
});

test('getMedicationName prefer medicationTitle', function(assert) {
  let inventoryItem;
  Ember.run(() => {
    inventoryItem = this.store().createRecord('inventory', {
      name: 'Test Item'
    });
  });

  let medicationDetails = this.subject({
    medicationTitle: 'Medication Title',
    inventoryItem
  });

  assert.strictEqual(medicationDetails.getMedicationName('inventoryItem'), 'Medication Title');
});

test('getMedicationName attribute', function(assert) {
  let inventoryItem;
  Ember.run(() => {
    inventoryItem = this.store().createRecord('inventory', {
      name: 'Test Item'
    });
  });

  let medicationDetails = this.subject({ inventoryItem });
  /**
   * We run this twice because if this gets the value from
   * the attribute it does not actually return the value
   */
  Ember.run(() => medicationDetails.getMedicationName('inventoryItem'));

  assert.strictEqual(medicationDetails.getMedicationName('inventoryItem'), 'Test Item');
});

test('getMedicationPrice', function(assert) {
  let medicationDetails = this.subject({
    priceOfMedication: 15.50
  });

  assert.strictEqual(medicationDetails.getMedicationPrice(), 15.50);
});

test('getMedicationPrice prefer priceOfMedication', function(assert) {
  let inventoryItem;
  Ember.run(() => {
    inventoryItem = this.store().createRecord('inventory', {
      name: 'Test Item',
      price: 12.15
    });
  });

  let medicationDetails = this.subject({
    priceOfMedication: 15.5,
    inventoryItem
  });

  assert.strictEqual(medicationDetails.getMedicationPrice('inventoryItem'), 15.5);
});

test('getMedicationPrice attribute', function(assert) {
  let inventoryItem;
  Ember.run(() => {
    inventoryItem = this.store().createRecord('inventory', {
      name: 'Test Item',
      price: 22.33
    });
  });

  let medicationDetails = this.subject({ inventoryItem });

  /**
   * We run this twice because if this gets the value from
   * the attribute it does not actually return the value
   */
  Ember.run(() => medicationDetails.getMedicationPrice('inventoryItem'));

  assert.strictEqual(medicationDetails.getMedicationPrice('inventoryItem'), 22.33);
});

test('getMedicationDetails', function(assert) {
  let done = assert.async();

  let medicationDetails = this.subject({
    medicationTitle: 'Medication Title',
    priceOfMedication: 65.77
  });

  medicationDetails.getMedicationDetails().then((result) => {
    assert.deepEqual(result, {
      name: 'Medication Title',
      price: 65.77
    });

    done();
  });
});
