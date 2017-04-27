import AbstractEditController from 'hospitalrun/controllers/abstract-edit-controller';
import Ember from 'ember';
import UserRoles from 'hospitalrun/mixins/user-roles';
import UserSession from 'hospitalrun/mixins/user-session';

export default AbstractEditController.extend(UserRoles, UserSession, {
  currentRole: '',
  disabledAction: false,
  hideCancelButton: true,
  updateCapability: 'define_user_roles',
  filteredRoles: Ember.computed.filter('userRoles', function(userRole) {
    return (userRole.name !== 'System Administrator');
  }),

  availableCapabilities: [{
    name: 'admin',
    capabilities: [
      'admin',
      'loadDb',
      'updateConfig',
      'defineUserRoles'
    ]
  }, {
    name: 'appointments',
    capabilities: [
      'appointments',
      'addAppointment'
    ]
  }, {
    name: 'billing',
    capabilities: [
      'billing',
      'addBillingDiagnosis',
      'addCharge',
      'addPricing',
      'addPricingProfile',
      'addInvoice',
      'addPayment',
      'deleteInvoice',
      'deletePricing',
      'deletePricingProfile',
      'editInvoice',
      'invoices',
      'overrideInvoice',
      'pricing',
      'cashier',
      'listPaidInvoices'
    ]
  }, {
    name: 'patients',
    capabilities: [
      'patients',
      'addAllergy',
      'addDiagnosis',
      'addNote',
      'addOperativePlan',
      'addOperationReport',
      'addPhoto',
      'addPatient',
      'addProcedure',
      'addSocialwork',
      'addVisit',
      'addVitals',
      'admitPatient',
      'deleteNote',
      'deletePhoto',
      'deletePatient',
      'deleteAppointment',
      'deleteDiagnosis',
      'deleteProcedure',
      'deleteSocialwork',
      'deleteVitals',
      'deleteVisit',
      'dischargePatient',
      'patientReports',
      'visits'
    ]
  }, {
    name: 'medication',
    capabilities: [
      'medication',
      'addMedication',
      'deleteMedication',
      'fulfillMedication'
    ]
  }, {
    name: 'labs',
    capabilities: [
      'labs',
      'addLab',
      'completeLab',
      'deleteLab'
    ]
  }, {
    name: 'imaging',
    capabilities: [
      'imaging',
      'addImaging',
      'completeImaging',
      'deleteImaging'
    ]
  }, {
    name: 'incident',
    capabilities: [
      'incident',
      'addIncident',
      'addIncidentCategory',
      'deleteIncident',
      'deleteIncidentCategory',
      'manageIncidents',
      'generateIncidentReport'
    ]
  }, {
    name: 'inventory',
    capabilities: [
      'inventory',
      'addInventoryRequest',
      'addInventoryItem',
      'addInventoryPurchase',
      'adjustInventoryLocation',
      'deleteInventoryItem',
      'fulfillInventory'
    ]
  }],

  missingCapablities: Ember.computed('availableCapabilities', 'defaultCapabilities', function() {
    let availableCapabilities = this.get('availableCapabilities');
    let capabilityBySection = Object.keys(availableCapabilities);
    let defaultCapabilities = Object.keys(this.get('defaultCapabilities'));
    let missing = [];
    defaultCapabilities.forEach((capability) => {
      let capabilityUsed = false;
      capabilityBySection.forEach((sectionName) => {
        let section = availableCapabilities[sectionName];
        if (section.capabilities.includes(capability.camelize())) {
          capabilityUsed = true;
        }
      });
      if (!capabilityUsed) {
        missing.push(`${capability} - ${capability.camelize()}`);
      }
    });
    return missing;
  }),

  capabilitySections: Ember.computed.map('availableCapabilities', function(section) {
    let mappedCapabilities = [];
    section.capabilities.forEach((key) => {
      mappedCapabilities.push({
        key,
        name: this.get('i18n').t(`admin.roles.capability.${key}`)
      });
    });
    return {
      name: this.get('i18n').t(`admin.roles.capability.${section.name}`),
      capabilities: mappedCapabilities
    };
  }),

  actions: {
    selectRole(role) {
      let roleToUpdate = this.get('model').findBy('id', role.dasherize());
      this.set('currentRole', role);
      this.set('roleToUpdate', roleToUpdate);
      try {
        if (roleToUpdate) {
          let capabilities = roleToUpdate.get('capabilities');
          this.get('availableCapabilities').forEach((section) => {
            section.capabilities.forEach((capability) => {
              if (capabilities.includes(capability)) {
                this.set(capability, true);
              } else {
                this.set(capability, false);
              }
            });
          });
        } else {
          let defaultCapabilities = this.get('defaultCapabilities');
          Object.keys(defaultCapabilities).forEach((capability) => {
            let capabilityRoles = defaultCapabilities[capability];
            if (capabilityRoles.includes(role)) {
              this.set(capability.camelize(), true);
            } else {
              this.set(capability.camelize(), false);
            }
          });
        }
      } catch(ex) {
        console.log('ex setting role:', ex);
      }
    },

    update() {
      let currentRole = this.get('currentRole');
      let roleToUpdate = this.get('roleToUpdate');
      if (Ember.isEmpty(roleToUpdate)) {
        roleToUpdate = this.get('store').createRecord('user-role', {
          id: currentRole.dasherize(),
          name: currentRole
        });
      }
      let capabilitiesToSave = [];
      this.get('availableCapabilities').forEach((section) => {
        section.capabilities.forEach((capability) => {
          if (this.get(capability) === true) {
            capabilitiesToSave.push(capability);
          }
        });
      });
      roleToUpdate.set('capabilities', capabilitiesToSave);
      roleToUpdate.save().then(() => {
        this.displayAlert(this.get('i18n').t('admin.roles.titles.roleSaved'),
          this.get('i18n').t('admin.roles.messages.roleSaved', { roleName: currentRole }));
      });
    }
  }

});
