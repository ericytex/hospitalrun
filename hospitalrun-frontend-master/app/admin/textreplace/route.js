import AbstractIndexRoute from 'hospitalrun/routes/abstract-index-route';
import { translationMacro as t } from 'ember-i18n';

export default AbstractIndexRoute.extend({
  pageTitle: t('admin.textReplacements.pageTitle'),
  hideNewButton: true,

  model() {
    let store = this.get('store');
    return store.findAll('text-expansion').then((result) => {
      return result.filter((model) => {
        let isNew = model.get('isNew');
        console.log(`${model.get('from')} ${isNew}`);
        return !isNew;
      });
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.createExpansion();
  },

  actions: {
    addExpansion(newExpansion) {
      newExpansion.save()
        .then(() => {
          this.refresh();
        })
        .catch(() => {
          this.refresh();
        });
    },

    deleteExpansion(expansion) {
      expansion.deleteRecord();
      expansion.save()
        .then(() => {
          this.refresh();
        })
        .catch(() => {
          this.refresh();
        });
    }
  }
});
