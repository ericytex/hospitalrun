import AbstractReportController from 'hospitalrun/controllers/abstract-report-controller';
import Ember from 'ember';
import NumberFormat from 'hospitalrun/mixins/number-format';
import UserSession from 'hospitalrun/mixins/user-session';
import moment from 'moment';

const { get, computed, isEmpty, RSVP } = Ember;

export default AbstractReportController.extend(UserSession, NumberFormat, {
  reportType: 'department',

  canGenerateReport: computed(function() {
    return this.currentUserCan('generate_incident_report');
  }),

  departmentReportColumns: computed(function() {
    let i18n = get(this, 'i18n');
    return {
      department: {
        label: i18n.t('incident.labels.department'),
        include: true,
        property: 'type' // property type because in _addReportRow function looks for column name with value as type
      },
      total: {
        label: i18n.t('incident.labels.total'),
        include: true,
        property: 'total',
        format: '_numberFormat'
      }
    };
  }),
  incidentCategoryReportColumns: computed(function() {
    let i18n = get(this, 'i18n');
    return {
      incidentCategory: {
        label: i18n.t('incident.labels.category'),
        include: true,
        property: 'type'
      },
      total: {
        label: i18n.t('incident.labels.total'),
        include: true,
        property: 'total',
        format: '_numberFormat'
      }
    };
  }),

  reportTypes: computed(function() {
    let i18n = get(this, 'i18n');
    return [{
      name: i18n.t('incident.titles.incidentsByDepartment'),
      value: 'department'
    }, {
      name: i18n.t('incident.titles.incidentsByCategory'),
      value: 'incidentCategory'
    }];
  }),

  /**
   * Find Incidents by the specified dates and the incidents's date.
   */
  _findIncidentsByDate() {
    let filterEndDate = get(this, 'endDate');
    let filterStartDate = get(this, 'startDate');
    let findParams = {
      options: {},
      mapReduce: 'incident_by_date'
    };
    let maxValue = get(this, 'maxValue');
    return new RSVP.Promise(function(resolve, reject) {
      if (isEmpty(filterStartDate)) {
        reject();
      }
      findParams.options.startkey =  [filterStartDate.getTime(), null];

      if (!isEmpty(filterEndDate)) {
        filterEndDate = moment(filterEndDate).endOf('day').toDate();
        findParams.options.endkey =  [filterEndDate.getTime(), maxValue];
      }
      return this.store.query('incident', findParams).then(resolve, reject);
    }.bind(this));
  },

  _generateByDepartmentOrByIncidentCategoryReport(incidents, reportType) {
    let reportColumns, reportProperty;
    if (reportType === 'department') {
      reportColumns = get(this, 'departmentReportColumns');
      reportProperty = 'department';

    }    else {
      reportColumns = get(this, 'incidentCategoryReportColumns');
      reportProperty = 'categoryName';
    }
    this._addRowsByType(incidents, reportProperty, 'Total incidents: ', reportColumns);
    this._finishReport(reportColumns);
  },

  /**
   * Given a list of records, organize and total by them by type and then add them to the report.
   * @param records {Array} list of records to total.
   * @param typeField {String} the field in the records containing the type.
   * @param totalLabel {String} the label for the grand total.
   * @param reportColumns
   */
  _addRowsByType(records, typeField, totalLabel, reportColumns) {
    let types = this._totalByType(records, typeField, totalLabel);
    types.forEach(function(type) {
      this._addReportRow(type, true, reportColumns);
    }.bind(this));
  },

  /**
   * Given a list of records, total them by type and also add a grand total.
   * @param records {Array} list of records to total.
   * @param typeField {String} the field in the records containing the type.
   * @param totalLabel {String} the label for the grand total.
   * @param reportColumns
   */
  _totalByType(records, typeField, totalLabel) {
    let total = 0;
    let types = [];
    records.forEach(function(record) {
      let type = record.get(typeField);
      let typeObject;
      if (!isEmpty(type)) {
        typeObject = types.findBy('type', type);
        if (isEmpty(typeObject)) {
          typeObject = {
            type,
            total: 0,
            records: []
          };
          types.push(typeObject);
        }
        typeObject.total++;
        typeObject.records.push(record);
        total++;
      }
    });
    types = types.sortBy('type');
    types.push({ type: totalLabel, total });
    return types;
  },

  actions: {
    generateReport() {
      let reportRows = get(this, 'reportRows');
      let reportType = get(this, 'reportType');
      reportRows.clear();
      this.showProgressModal();
      switch (reportType) {
        case 'department':
        case 'incidentCategory': {
          this._findIncidentsByDate().then((incidents) => {
            this._generateByDepartmentOrByIncidentCategoryReport(incidents, reportType);
          }).catch((ex) => {
            console.log('Error:', ex);
            this.closeProgressModal();
          });
          break;
        }
      }
    }
  }
});
