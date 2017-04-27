import DS from 'ember-data';
import Ember from 'ember';
import PatientVisits from 'hospitalrun/mixins/patient-visits';
import SelectValues from 'hospitalrun/utils/select-values';

const { get, isEmpty } = Ember;

export default Ember.Mixin.create(PatientVisits, {
  findPatientVisits: true, // Override to false if visits shouldn't be set when patient is selected.
  needToUpdateVisit: false,
  patientList: null,
  selectedPatient: null,
  newVisitAdded: null,

  actions: {
    showPatient(patient) {
      this.transitionToRoute('patients.edit', patient);
    },

    returnToAllItems() {
      this._cancelUpdate();
      this.send('allItems');
    },
    returnToPatient() {
      this._cancelUpdate();
      this.transitionToRoute('patients.edit', this.get('model.returnToPatient'));
    },
    returnToVisit() {
      this._cancelUpdate();
      this.transitionToRoute('visits.edit', this.get('model.returnToVisit'));
    },

    selectedPatientChanged(selectedPatient) {
      if (!Ember.isEmpty(selectedPatient)) {
        this.store.find('patient', selectedPatient.id).then((item) =>{
          this.set('model.patient', item);
          this.patientSelected(item);
          Ember.run.once(this, function() {
            this.get('model').validate().catch(Ember.K);
          });
        });
      } else {
        this.set('model.patient', null);
        this.patientSelected();
      }
    }
  },

  /**
   * Add the specified child to the current visit and then save the visit.  If a visit
   * has not been selected, create a new visit and add it to the selected patient.
   * @param {Object} objectToAdd the object to add.
   * @param {string} childName the name of the child object on the visit to add to.
   * @param {string} newVisitType if a new visit needs to be created, what type of visit
   * should be created.
   * @returns {Promise} promise that will resolve or reject depending on whether or
   * not the add and subsequent saves were successful.
   */
  addChildToVisit(objectToAdd, childName, newVisitType) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let visit = this.get('model.visit');
      if (Ember.isEmpty(visit)) {
        visit = this.createNewVisit(newVisitType).then(function(savedVisit) {
          this._finishAddChildToVisit(objectToAdd, childName, savedVisit, resolve, reject);
        }.bind(this), reject);
      } else {
        this._finishAddChildToVisit(objectToAdd, childName, visit, resolve, reject);
      }
    }.bind(this));
  },

  addDiagnosisToModelAndPatient(newDiagnosis) {
    let diagnoses = this.get('model.diagnoses');
    diagnoses.addObject(newDiagnosis);
    let patientDiagnoses = this.get('model.patient.diagnoses');
    let diagnosisExists = patientDiagnoses.any((diagnosis) => {
      return diagnosis.get('active') === true
          && diagnosis.get('diagnosis') === newDiagnosis.get('diagnosis')
          && diagnosis.get('secondaryDiagnosis') === newDiagnosis.get('secondaryDiagnosis');
    });
    if (!diagnosisExists) {
      let newPatientDiagnosis = this._copyDiagnosis(newDiagnosis);
      newPatientDiagnosis.save().then(() => {
        patientDiagnoses.addObject(newPatientDiagnosis);
        let patient = this.get('model.patient');
        patient.save().then(() => {
          this.silentUpdate('closeModal');
        });
      });
    } else {
      this.silentUpdate('closeModal');
    }
  },

  _finishAddChildToVisit(objectToAdd, childName, visit, resolve, reject) {
    visit.get(childName).then(function(visitChildren) {
      visitChildren.addObject(objectToAdd);
      this.set('needToUpdateVisit', true);
      resolve(visit);
    }.bind(this), reject);
  },

  cancelAction: function() {
    let returnToPatient = this.get('model.returnToPatient');
    let returnToVisit = this.get('model.returnToVisit');
    if (!isEmpty(returnToVisit)) {
      return 'returnToVisit';
    } else if (!isEmpty(returnToPatient)) {
      return 'returnToPatient';
    } else {
      return 'returnToAllItems';
    }
  }.property('model.returnToPatient', 'model.returnToVisit'),

  createNewVisit(newVisitType) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let model = this.get('model');
      let patient = model.get('patient');
      let visit = this.get('store').createRecord('visit', {
        startDate: new Date(),
        endDate: new Date(),
        outPatient: true,
        patient,
        visitType: newVisitType
      });
      model.set('visit', visit);
      visit.save().then(function() {
        visit.reload().then(function(updatedVisit) {
          this.set('newVisitAdded', updatedVisit);
          model.set('visit', updatedVisit);
          resolve(updatedVisit);
        }.bind(this), reject);
      }.bind(this), reject).catch(function(err) {
        console.log('Error creating new visit');
        reject(err);
      }.bind(this));
    }.bind(this));
  },

  deleteChildFromVisit(childName) {
    let recordToDelete = this.get('model');
    recordToDelete.set('archived', true);
    this.removeChildFromVisit(recordToDelete, childName).then(() => {
      recordToDelete.save().then(() => {
        recordToDelete.unloadRecord();
        this.send('closeModal');
      });
    });
  },

  getPatientDiagnoses(patient, model) {
    let diagnoses = patient.get('diagnoses');
    let activeDiagnoses;
    if (!isEmpty(diagnoses)) {
      activeDiagnoses = diagnoses.filterBy('active', true).map((diagnosis) => {
        return this._copyDiagnosis(diagnosis);
      });
    }
    let currentDiagnoses = get(model, 'diagnoses');
    currentDiagnoses.clear();
    if (!isEmpty(activeDiagnoses)) {
      currentDiagnoses.addObjects(activeDiagnoses);
    }
  },

  patientId: Ember.computed.alias('model.patient.id'),

  patientSelected(/* patient */) {},

  patientVisits: function() {
    let patient = this.get('model.patient');
    let visitPromise;

    if (!Ember.isEmpty(patient) && this.get('findPatientVisits')) {
      visitPromise = this.getPatientVisits(patient);
    } else {
      visitPromise = Ember.RSVP.resolve([]);
    }
    return DS.PromiseArray.create({
      promise: visitPromise
    });
  }.property('model.patient.id', 'newVisitAdded'),

  patientProcedures: Ember.computed('patientVisits.[]', function() {
    let patient = get(this, 'model.patient');
    return DS.PromiseArray.create({
      promise: get(this, 'patientVisits').then((patientVisits) => {
        return get(patient, 'operationReports').then((operationReports) => {
          return this._getPatientProcedures(operationReports, patientVisits);
        });
      })
    });
  }),

  patientVisitsForSelect: function() {
    return DS.PromiseArray.create({
      promise: this.get('patientVisits').then(function(patientVisits) {
        return patientVisits.map(SelectValues.selectObjectMap);
      })
    });
  }.property('patientVisits.[]'),

  /**
   * Removes the specified child from the current visit object and then saves the visit.
   * @param {Object} objectToRemove the object to remove.
   * @param {string} childName the name of the child object on the visit to remove from.
   * @returns {Promise} promise that will resolve or reject depending on whether or
   * not the remove and subsequent save were successful.
   */
  removeChildFromVisit(objectToRemove, childName) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let childPromises = [];
      let visit = this.get('model.visit');
      childPromises.addObjects(this.resolveVisitChildren());
      Ember.RSVP.all(childPromises, `Resolved visit children before removing ${childName}`).then(function() {
        visit.get(childName).then(function(visitChildren) {
          visitChildren.removeObject(objectToRemove);
          visit.save().then(resolve, reject);
        }.bind(this), reject);
      }.bind(this), reject);
    }.bind(this));
  },

  /**
   * Observer on visits to make sure async relationships are resolved.
   * @returns {array} of promises which can be used to ensure
   * all relationships have resolved.
   */
  resolveVisitChildren() {
    let promises = [];
    let visit = this.get('model.visit');
    if (!Ember.isEmpty(visit)) {
      // Make sure all the async relationships are resolved
      promises.push(visit.get('imaging'));
      promises.push(visit.get('labs'));
      promises.push(visit.get('medication'));
      promises.push(visit.get('procedures'));
      promises.push(visit.get('vitals'));
      promises.push(visit.get('reports'));
    }
    return promises;
  },

  saveNewDiagnoses() {
    let diagnoses = this.get('model.diagnoses');
    diagnoses = diagnoses.filterBy('isNew', true);
    if (!isEmpty(diagnoses)) {
      let savePromises = diagnoses.map((diagnoses) => {
        return diagnoses.save();
      });
      return Ember.RSVP.all(savePromises);
    } else {
      return Ember.RSVP.resolve();
    }
  },

  /**
   * If visit needs to saved, save it and then display an alert message; otherwise
   * just display the alert message.
   * @param alertTitle String the title to use on the alert.
   * @param alertMessage String the message to display in the alert.
   */
  saveVisitIfNeeded(alertTitle, alertMessage, alertAction) {
    if (this.get('needToUpdateVisit')) {
      this.get('model.visit').save().then(function() {
        this.set('needToUpdateVisit', false);
        this.displayAlert(alertTitle, alertMessage, alertAction);
      }.bind(this));
    } else {
      this.displayAlert(alertTitle, alertMessage, alertAction);
    }
  },

  visitId: Ember.computed.alias('model.visit.id'),
  visitsController: Ember.computed.alias('controllers.visits'),

  _copyDiagnosis(diagnosisToCopy) {
    let attributesToCopy = [
      'date',
      'diagnosis',
      'secondaryDiagnosis'
    ];
    return this.store.createRecord('diagnosis',
      diagnosisToCopy.getProperties(attributesToCopy)
    );
  }
});
