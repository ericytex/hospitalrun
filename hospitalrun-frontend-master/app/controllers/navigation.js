import Ember from 'ember';
import HospitalRunVersion from 'hospitalrun/mixins/hospitalrun-version';
import ModalHelper from 'hospitalrun/mixins/modal-helper';
import ProgressDialog from 'hospitalrun/mixins/progress-dialog';
import UserSession from 'hospitalrun/mixins/user-session';
import Navigation from 'hospitalrun/mixins/navigation';
export default Ember.Controller.extend(HospitalRunVersion, ModalHelper, ProgressDialog, UserSession, Navigation, {
  ajax: Ember.inject.service(),
  application: Ember.inject.controller(),
  allowSearch: false,
  config: Ember.inject.service(),
  currentSearchText: null,
  currentRouteName: Ember.computed.alias('application.currentRouteName'),
  progressTitle: 'Searching',
  searchRoute: null,
  session: Ember.inject.service(),
  syncStatus: '',
  currentOpenNav: null,

  actions: {
    about() {
      let version = this.get('version');
      this.get('ajax').request('/serverinfo').then((siteInfo) => {
        let message = `Version: ${version}`;
        if (!Ember.isEmpty(siteInfo)) {
          message += ` Site Info: ${siteInfo}`;
        }
        this.displayAlert(this.get('i18n').t('navigation.about'), message);
      });
    },

    invalidateSession() {
      let session = this.get('session');
      if (session.get('isAuthenticated')) {
        session.invalidate();
      }
    },

    search() {
      if (this.allowSearch && this.searchRoute) {
        let currentRouteName = this.get('currentRouteName');
        let currentSearchText = this.get('currentSearchText');
        let textToFind = this.get('searchText');
        if (currentSearchText !== textToFind || currentRouteName.indexOf('.search') === -1) {
          this.set('searchText', '');
          this.set('progressMessage', `Searching for ${textToFind}. Please wait...`);
          this.showProgressModal();
          this.transitionToRoute(`${this.searchRoute}/${textToFind}`);
        }
      }
    },

    navAction(nav) {
      if (this.currentOpenNav && this.currentOpenNav.route !== nav.route) {
        this.currentOpenNav.closeSubnav();
      }
      this.set('currentOpenNav', nav);
      this.transitionToRoute(nav.route);
      this.set('isShowingSettings', false);
    },

    toggleSettings() {
      this.toggleProperty('isShowingSettings');
    },

    closeSettings() {
      this.set('isShowingSettings', false);
    }

  }
});
