import AbstractModuleRoute from 'hospitalrun/routes/abstract-module-route';
import UserSession from 'hospitalrun/mixins/user-session';
import { translationMacro as t } from 'ember-i18n';

export default AbstractModuleRoute.extend(UserSession, {
  addCapability: 'add_appointment',
  allowSearch: false,
  currentScreenTitle: t('appointments.currentScreenTitle'),
  editTitle: t('appointments.editTitle'),
  newTitle: t('appointments.newTitle'),
  moduleName: 'appointments',
  newButtonText: t('appointments.buttons.newButton'),
  sectionTitle: t('appointments.sectionTitle'),

  actions: {
    checkIn(appointment) {
      let patient = appointment.get('patient');
      let visitProps = appointment.getProperties('startDate', 'endDate', 'location', 'patient');
      visitProps.visitType = appointment.get('appointmentType');
      visitProps.examiner = appointment.get('provider');
      visitProps.appointment = appointment;
      visitProps.hidePatientSelection = true;
      visitProps.patient = patient;
      visitProps.returnTo = 'appointments';
      this.transitionTo('visits.edit', 'checkin').then(function(newRoute) {
        newRoute.currentModel.setProperties(visitProps);
        newRoute.controller.getPatientDiagnoses(patient, newRoute.currentModel);
      }.bind(this));
    }
  },

  additionalModels: [{
    name: 'physicianList',
    findArgs: ['lookup', 'physician_list']
  }, {
    name: 'locationList',
    findArgs: ['lookup', 'visit_location_list']
  }, {
    name: 'surgeryLocationList',
    findArgs: ['lookup', 'procedure_locations']
  }, {
    name: 'visitTypesList',
    findArgs: ['lookup', 'visit_types']
  }]
});
