import AbstractModuleRoute from 'hospitalrun/routes/abstract-module-route';
export default AbstractModuleRoute.extend({
  addCapability: 'add_visit',
  additionalModels: [{
    name: 'anesthesiaTypes',
    findArgs: ['lookup', 'anesthesia_types']
  }, {
    name: 'anesthesiologistList',
    findArgs: ['lookup', 'anesthesiologists']
  }, {
    name: 'diagnosisList',
    findArgs: ['lookup', 'diagnosis_list']
  }, {
    name: 'cptCodeList',
    findArgs: ['lookup', 'cpt_code_list']
  }, {
    name: 'physicianList',
    findArgs: ['lookup', 'physician_list']
  }, {
    name: 'locationList',
    findArgs: ['lookup', 'visit_location_list']
  }, {
    name: 'procedureList',
    findArgs: ['lookup', 'procedure_list']
  }, {
    name: 'procedureLocations',
    findArgs: ['lookup', 'procedure_locations']
  }, {
    name: 'procedurePricingTypes',
    findArgs: ['lookup', 'procedure_pricing_types']
  }, {
    name: 'sexList',
    findArgs: ['lookup', 'sex']
  }, {
    name: 'visitTypesList',
    findArgs: ['lookup', 'visit_types']
  }, {
    name: 'wardPricingTypes',
    findArgs: ['lookup', 'ward_pricing_types']
  }, {
    name: 'printHeader',
    findArgs: ['option', 'print_header']
  }],
  moduleName: 'visits',
  newButtonAction: null, // No new button
  sectionTitle: 'Visits',

  actions: {
    allItems() {
      this.transitionTo('patients.index');
    }
  }

});
