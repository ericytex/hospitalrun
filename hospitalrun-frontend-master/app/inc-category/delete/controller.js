import AbstractDeleteController from 'hospitalrun/controllers/abstract-delete-controller';
import { translationMacro as t } from 'ember-i18n';

export default AbstractDeleteController.extend({
  title: t('incident.titles.deleteIncidentCategory')
});
