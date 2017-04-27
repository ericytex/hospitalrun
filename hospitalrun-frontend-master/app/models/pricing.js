import AbstractModel from 'hospitalrun/models/abstract';
import DS from 'ember-data';

export default AbstractModel.extend({
  // Attributes
  category: DS.attr('string'),
  expenseAccount: DS.attr('string'),
  name: DS.attr('string'),
  price: DS.attr('number'),
  pricingType: DS.attr('string'),

  // Associations
  pricingOverrides: DS.hasMany('override-price', { async: false }),

  validations: {
    category: {
      presence: true
    },
    name: {
      presence: true
    },
    price: {
      numericality: true
    }
  }
});
