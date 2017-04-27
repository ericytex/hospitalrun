import AbstractIndexRoute from 'hospitalrun/routes/abstract-index-route';
import { translationMacro as t } from 'ember-i18n';
export default AbstractIndexRoute.extend({
  hideNewButton: true,
  pageTitle: t('admin.lookup.pageTitle'),
  model() {
    return this.store.findAll('lookup').catch((error) => this.send('error', error));
  },

  afterModel(model) {
    model.set('lookupType', 'anesthesia_types');
  },

  actions: {
    deleteValue(value) {
      this.controller.send('deleteValue', value);
    }
  }
});
