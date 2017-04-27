import AppointmentIndexRoute from 'hospitalrun/appointments/index/route';
import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';

const {
  get,
  isEmpty
} = Ember;

export default AppointmentIndexRoute.extend({
  dateIntervalEnd: null,
  dateIntervalStart: null,
  editReturn: 'appointments.calendar',
  filterParams: ['appointmentType', 'provider', 'status', 'location'],
  modelName: 'appointment',
  pageTitle: t('appointments.calendarTitle'),

  queryParams: {
    appointmentType: { refreshModel: true },
    endDate: { refreshModel: true },
    provider: { refreshModel: true },
    status: { refreshModel: true },
    startDate: { refreshModel: true },
    location: { refreshModel: true },
    viewType: { refreshModel: false }
  },

  model(params) {
    return this._super(params)
      .then(this._createCalendarEvents.bind(this))
      .then(function(calendarEvents) {
        calendarEvents.selectedAppointmentType = params.appointmentType;
        calendarEvents.selectedProvider = params.provider;
        calendarEvents.selectedStatus = params.status;
        calendarEvents.selectedLocation = params.location;
        return calendarEvents;
      });
  },

  _createCalendarEvent(appointment) {
    let title = get(appointment, 'patient.displayName');
    let provider = get(appointment, 'provider');
    if (!isEmpty(provider)) {
      title = `${title}\n${provider}`;
    }
    let event = {
      allDay: get(appointment, 'allDay'),
      title,
      start: get(appointment, 'startDate'),
      end: get(appointment, 'endDate'),
      referencedAppointment: appointment
    };
    let location =  get(appointment, 'location');
    if (isEmpty(location)) {
      let i18n = get(this, 'i18n');
      location = i18n.t('appointments.labels.noLocation').toString();
    }
    event.resourceId = location.toLowerCase();
    return event;
  },

  _createCalendarEvents(appointments) {
    let events = [];
    let resources = [];
    appointments.forEach((appointment) => {
      let event = this._createCalendarEvent(appointment);
      events.push(event);
      let resourceId = get(event, 'resourceId');
      if (!resources.findBy('id', resourceId)) {
        resources.push({
          id: resourceId,
          title: get(event, 'referencedAppointment.location')
        });
      }
    });
    return {
      events,
      resources
    };
  },

  _modelQueryParams(params) {
    let { endDate, startDate } = params;

    if (endDate === null || startDate === null) {
      return this._super(params);
    }
    let searchOptions = {
      startkey: [parseInt(startDate), parseInt(startDate), this._getMinPouchId()],
      endkey: [parseInt(endDate), parseInt(endDate), this._getMaxPouchId()]
    };

    return {
      options: searchOptions,
      mapReduce: 'appointments_by_date'
    };
  }
});
