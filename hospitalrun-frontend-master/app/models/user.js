import DS from 'ember-data';
import EmailValidation from 'hospitalrun/utils/email-validation';
import Ember from 'ember';
import EmberValidations from 'ember-validations';

const { computed } = Ember;

let User = DS.Model.extend(EmberValidations, {
  // Attributes
  derived_key: DS.attr('string'),
  deleted: DS.attr('boolean'),
  displayName: DS.attr('string'),
  email: DS.attr('string'),
  iterations: DS.attr(),
  name: DS.attr('string'),
  password: DS.attr('string'),
  password_scheme: DS.attr('string'),
  password_sha: DS.attr('string'),
  rev: DS.attr('string'),
  roles: DS.attr(),
  salt: DS.attr('string'),
  userPrefix: DS.attr('string'),

  displayRole: computed('roles', function() {
    let roles = this.get('roles');
    if (!Ember.isEmpty(roles)) {
      return roles[0];
    }
  }),

  validations: {
    email: {
      format: {
        with: EmailValidation.emailRegex,
        message: 'Please, enter a valid email address'
      }
    }
  }
});

export default User;
