import DS from 'ember-data';
import Ember from 'ember';

const { computed, observer } = Ember;

export default Ember.Mixin.create({
  _mapContentItems() {
    let content = this.get('content');
    if (content) {
      let mapped = content.filter(function(item) {
        return !Ember.isEmpty(item);
      });
      if (content instanceof DS.RecordArray) {
        mapped = mapped.map((item) => {
          let returnObj = item.getProperties(this.get('displayKey'));
          returnObj[this.get('selectionKey')] = item;
          return returnObj;
        });
      } else {
        mapped = mapped.map((item) => {
          let returnObj = {};
          returnObj[this.get('displayKey')] = item;
          return returnObj;
        });
      }
      return mapped;
    } else {
      return [];
    }
  },

  mappedContent: computed('content', function() {
    return this._mapContentItems();
  }),

  contentChanged: observer('content.[]', function() {
    let bloodhound = this.get('bloodhound');
    if (bloodhound) {
      bloodhound.clear();
      bloodhound.add(this._mapContentItems());
    }
  }),

  bloodhound: null,
  displayKey: 'value',
  selectionKey: 'value',
  hint: true,
  highlight: true,
  lastHint: null,
  limit: 500,
  minlength: 1,
  selectedItem: false,
  inputElement: null,
  typeAhead: null,
  setOnBlur: true,
  templates: null,
  selectedAction: null,

  _getSource() {
    let typeAheadBloodhound = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace(this.get('displayKey')),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: this.get('mappedContent')
    });
    typeAheadBloodhound.initialize();
    this.set('bloodhound', typeAheadBloodhound);
    return typeAheadBloodhound.ttAdapter();
  },

  didInsertElement() {
    let $input = this.$('input');
    this.set('inputElement', $input);
    let $typeahead = $input.typeahead({
      autoselect: true,
      hint: this.get('hint'),
      highlight: this.get('highlight'),
      minLength: this.get('minlength')
    }, {
      displayKey: this.get('displayKey'),
      limit: this.get('limit'),
      source: this._getSource(),
      templates: this.get('templates')
    });
    this.set('typeAhead', $typeahead);

    $typeahead.on('typeahead:selected', (event, item) => {
      this.itemSelected(item[this.get('selectionKey')]);
    });

    $typeahead.on('typeahead:autocompleted', (event, item) => {
      this.itemSelected(item[this.get('selectionKey')]);
    });

    if (this.get('setOnBlur')) {
      $input.on('keyup', () => {
        let $hint = this.$('.tt-hint');
        let hintValue = $hint.val();
        this.set('lastHint', hintValue);
        this.set('selectedItem', false);
      });

      $input.on('blur', (event) => {
        let selection = this.get('selection');
        let targetValue = event.target.value.trim();
        if (!Ember.isEmpty(selection)) {
          if (selection.trim) {
            selection = selection.trim();
          }
          this.set('selection', selection);
        }
        if (!this.get('selectedItem')) {
          let lastHint = this.get('lastHint');
          let exactMatch = false;
          if (Ember.isEmpty(lastHint)) {
            lastHint = targetValue;
            exactMatch = true;
          }
          if (!Ember.isEmpty(targetValue) && !Ember.isEmpty(lastHint)) {
            this.get('bloodhound').search(lastHint, (suggestions) => {
              if (suggestions.length > 0) {
                if (!exactMatch || lastHint.toLowerCase() === suggestions[0][this.get('displayKey')].toLowerCase()) {
                  this.itemSelected(suggestions[0][this.get('selectionKey')]);
                  event.target.value = suggestions[0][this.get('displayKey')];
                  this.get('model').set(this.get('propertyName'), event.target.value);
                }
              } else if (targetValue !== selection) {
                this.itemSelected();
              }
            });
          } else if (Ember.isEmpty(targetValue)) {
            this.itemSelected();
          }
        }
      });
    }
  },

  itemSelected(itemSelection) {
    this.set('selection', itemSelection);
    this.set('selectedItem', true);
    let selectedAction = this.get('selectedAction');
    if (!Ember.isEmpty(selectedAction)) {
      this.sendAction('selectedAction', itemSelection);
    }
  },

  willDestroyElement() {
    this.get('inputElement').typeahead('destroy');
  }

});
