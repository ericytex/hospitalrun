import { translationMacro as t } from 'ember-i18n';
import AbstractIndexRoute from 'hospitalrun/routes/abstract-index-route';
export default AbstractIndexRoute.extend({
  modelName: 'medication',
  pageTitle: t('medication.pageTitle'),
  searchStatus: 'Requested',

  _getStartKeyFromItem(item) {
    let prescriptionDateAsTime = item.get('prescriptionDateAsTime');
    let id = this._getPouchIdFromItem(item);
    let requestedDateAsTime = item.get('requestedDateAsTime');
    let searchStatus = this.get('searchStatus');
    return [searchStatus, requestedDateAsTime, prescriptionDateAsTime, id];
  },

  _modelQueryParams() {
    let maxId = this._getMaxPouchId();
    let maxValue = this.get('maxValue');
    let minId = this._getMinPouchId();
    let searchStatus = this.get('searchStatus');
    return {
      options: {
        startkey: [searchStatus, null, null, minId],
        endkey: [searchStatus, maxValue, maxValue, maxId]
      },
      mapReduce: 'medication_by_status'
    };
  }
});
