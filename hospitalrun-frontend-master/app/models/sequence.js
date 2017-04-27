import { Model } from 'ember-pouch';
import DS from 'ember-data';

export default Model.extend({
  // Attributes
  prefix: DS.attr('string'),
  value: DS.attr('number')
});
