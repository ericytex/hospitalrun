import Ember from 'ember';

const { get } = Ember;

export const ACTIVE =  'Active';
export const CLOSED = 'Closed';
export const FOLLOW_UP = 'Followup';
export const REPORTED = 'Reported';

export default Ember.Mixin.create({
  statusList: [ACTIVE, CLOSED, FOLLOW_UP, REPORTED],
  getLocalizedStatus(status) {
    let i18n = get(this, 'i18n');
    return i18n.t(`incident.labels.status${status}`);
  }
});
