import Ember from 'ember';
export default {
  patientTypeAhead: {
    acceptance: {
      accept: true,
      if(object) {
        if (!object.get('selectPatient')) {
          return false;
        }
        if (!object.get('hasDirtyAttributes')) {
          return false;
        }
        let patientName = object.get('patient.displayName');
        let patientTypeAhead = object.get('patientTypeAhead');
        if (Ember.isEmpty(patientName) || Ember.isEmpty(patientTypeAhead)) {
          // force validation to fail
          return true;
        } else {
          let typeAheadName = patientTypeAhead.substr(0, patientName.length).toLowerCase();
          if (patientName.toLowerCase().indexOf(typeAheadName) !== 0) {
            return true;
          }
        }
        // patient is properly selected; don't do any further validation
        return false;
      },
      message: 'Please select a patient'
    }
  }
};
