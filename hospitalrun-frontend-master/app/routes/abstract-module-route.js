import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Ember from 'ember';
import UserSession from 'hospitalrun/mixins/user-session';
/**
 * Abstract route for top level modules (eg patients, inventory, users)
 */
export default Ember.Route.extend(UserSession, AuthenticatedRouteMixin, {
  addCapability: null,
  additionalModels: null,
  allowSearch: true,
  currentScreenTitle: null,
  moduleName: null,
  newButtonText: null,
  sectionTitle: null,
  subActions: null,

  editPath: function() {
    let module = this.get('moduleName');
    return `${module}.edit`;
  }.property('moduleName'),

  deletePath: function() {
    let module = this.get('moduleName');
    return `${module}.delete`;
  }.property('moduleName'),

  newButtonAction: function() {
    if (this.currentUserCan(this.get('addCapability'))) {
      return 'newItem';
    } else {
      return null;
    }
  }.property(),

  searchRoute: function() {
    let module = this.get('moduleName');
    return `/${module}/search`;
  }.property('moduleName'),

  actions: {
    allItems() {
      this.transitionTo(`${this.get('moduleName')}.index`);
    },
    deleteItem(item) {
      let deletePath = this.get('deletePath');
      this.send('openModal', deletePath, item);
    },
    editItem(item) {
      this.transitionTo(this.get('editPath'), item);
    },
    newItem() {
      if (this.currentUserCan(this.get('addCapability'))) {
        this.transitionTo(this.get('editPath'), 'new');
      }
    },

    /**
     * Action to set items in the section header.
     * @param details an object containing details to set on the section header.
     * The following parameters are supported:
     * - currentScreenTitle - The current screen title.
     * - newButtonText - The text to display for the "new" button.
     * - newButtonAction - The action to fire for the "new" button.
     */
    setSectionHeader(details) {
      let currentController = this.controllerFor(this.get('moduleName'));
      currentController.setProperties(details);
    }

  },

  /**
   * Make sure the user has permissions to the module; if not reroute to index.
   */
  beforeModel(transition) {
    let moduleName = this.get('moduleName');
    if (this.currentUserCan(moduleName)) {
      return this._super(transition);
    } else {
      this.transitionTo('index');
      return Ember.RSVP.reject('Not available');
    }
  },

  model() {
    if (!Ember.isEmpty(this.additionalModels)) {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        let promises = this.additionalModels.map(function(modelMap) {

          if (modelMap.queryArgs) {
            return this.store.query(...modelMap.queryArgs);
          } else if (modelMap.findArgs.length === 1) {
            return this.store.findAll(...modelMap.findArgs);
          } else {
            return this.store.find(...modelMap.findArgs);
          }
        }.bind(this));
        Ember.RSVP.allSettled(promises, `All additional Models for ${this.get('moduleName')}`).then(function(array) {
          array.forEach(function(item, index) {
            if (item.state === 'fulfilled') {
              this.set(this.additionalModels[index].name, item.value);
            }
          }.bind(this));
          resolve();
        }.bind(this), reject);
      }.bind(this), `Additional Models for ${this.get('moduleName')}`);
    } else {
      return Ember.RSVP.resolve();
    }
  },

  renderTemplate() {
    this.render('section');
  },

  setupController(controller, model) {
    let navigationController = this.controllerFor('navigation');
    if (this.get('allowSearch') === true) {
      navigationController.set('allowSearch', true);
      navigationController.set('searchRoute', this.get('searchRoute'));
    } else {
      navigationController.set('allowSearch', false);
    }
    let currentController = this.controllerFor(this.get('moduleName'));
    let propsToSet = this.getProperties('additionalButtons', 'currentScreenTitle', 'newButtonAction', 'newButtonText', 'sectionTitle', 'subActions');
    currentController.setProperties(propsToSet);
    if (!Ember.isEmpty(this.additionalModels)) {
      this.additionalModels.forEach(function(item) {
        controller.set(item.name, this.get(item.name));
      }.bind(this));
    }
    this._super(controller, model);
  }

});
