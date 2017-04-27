import DateFormat from 'hospitalrun/mixins/date-format';
import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

moduleFor('mixin:date-format', 'Unit | Mixin | date-format');

test('dateToTime', function(assert) {
  let dateFormat = Ember.Object.extend(DateFormat).create();

  assert.strictEqual(
    dateFormat.dateToTime(new Date(1481665085175)),
    1481665085175,
    'Should return correct time'
  );

  assert.strictEqual(
    dateFormat.dateToTime(),
    undefined,
    'Should return undefined for no argument'
  );

  assert.strictEqual(
    dateFormat.dateToTime(1481665085175),
    undefined,
    'Should return undefined for non Date object'
  );
});
