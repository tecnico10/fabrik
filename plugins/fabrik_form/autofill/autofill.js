/**
 * @author Robert
 */

var Autofill = new Class({
	
	Implements: [Events, Options],
	
	options: {
		'observe': '',
		'trigger': '',
		cnn: 0,
		table: 0,
		map: '',
		editOrig: false,
		fillOnLoad: false,
		confirm: true
	},
	
	initialize: function (options) {
		this.setOptions(options);
		this.attached = [];
		this.eventSetUp = [];
		Fabrik.addEvent('fabrik.form.elements.added', function (form) {
			this.setUp(form);	
		}.bind(this));
	},
	
	/**
	 * get the observable elements
	 * @return array element object
	 */
	getElement: function () {
		var testE = false;
		var e = this.form.formElements.get(this.options.observe);
		// if its a joined element
		if (!e) {
			var k = Object.keys(this.form.formElements);
			var ii = k.each(function (i) {
				if (i.contains(this.options.observe)) {
					testE = this.form.formElements.get(i);
					if (!this.attached.contains(testE.options.element)) {
						// we havent previously observed this element, add it to this.attached
						// so that in the future we don't re-add it.
						this.attached.push(testE.options.element);
						e = testE;
					}
				}
			}.bind(this));
		} else {
			if (!this.attached.contains(this.options.observe)) {
				this.attached.push(this.options.observe);
			}
		}
		// return e;
		return this.attached;
	},
	
	setUp: function (form) {
		try {
			this.form = form;
		} catch (err) {
			// form_x not found (detailed view perhaps)
			return;
		}
		var e = this.getElement();
		if (!e) {
			return false;
		}
		var evnt = this.lookUp.bind(this);
		
		for (var i = 0; i < this.attached.length; i++) {
			var attached = this.attached[i];
			if (this.eventSetUp.contains(attached)) {
				continue;
			}
			this.eventSetUp.push(attached);
			var element = this.form.formElements.get(attached);
			if (this.options.trigger === '') {
				if (!element) {
					fconsole('autofill - couldnt find element to observe');
				} else {
					var elEvnt = element.getBlurEvent();
					var evnt = this.lookUp.bind(this, attached);
					element.element.removeEvents(elEvnt);
					this.form.dispatchEvent('', attached, elEvnt, evnt);
				}
			} else {
				// @todo trigger in repeat groups to test!
				this.form.dispatchEvent('', this.options.trigger, 'click', evnt);
			}
		}
		
		if (this.options.fillOnLoad && form.options.rowid === '0') {
			var t = this.options.trigger === '' ? this.element.strElement : this.options.trigger;
			this.form.dispatchEvent('', t, 'load', evnt);
		}
	},
	
	// perform ajax lookup when the observer element is blurred
	
	lookUp: function (attached) {
		console.log('lookup', attached);
		var element = this.form.formElements.get(attached);
		if (this.options.confirm === true) {
			if (!confirm(Joomla.JText._('PLG_FORM_AUTOFILL_DO_UPDATE'))) {
				return;
			}
		}
		Fabrik.loader.start('form_' + this.options.formid, Joomla.JText._('PLG_FORM_AUTOFILL_SEARCHING'));
		
		var v = element.getValue();
		var formid = this.options.formid;
		var observe = this.options.observe;
		
		var myAjax = new Request.JSON({ 
			'evalScripts': true,
			'data': {
				'option': 'com_fabrik',
				'format': 'json',
				'task': 'plugin.pluginAjax',
				'plugin': 'autofill',
				'method': 'ajax_getAutoFill',
				'g': 'form',
				'v': v, 
				'formid': formid,
				'observe': observe,
				'cnn': this.options.cnn,
				'table': this.options.table,
				'map': this.options.map
			},
			onCancel: function () {
				Fabrik.loader.stop('form_' + this.options.formid);
			}.bind(this),
			
			onFailure: function (xhr) {
				Fabrik.loader.stop('form_' + this.options.formid);
				alert(this.getHeader('Status'));
			},
			onError: function (text, error) {
				Fabrik.loader.stop('form_' + this.options.formid);
				fconsole(text + ' ' + error);
			}.bind(this),
			onSuccess: function (json, responseText) {
				Fabrik.loader.stop('form_' + this.options.formid);
				this.updateForm(json, element);
			}.bind(this)
		}).send();
	},
	
	// Update the form from the ajax request returned data
	updateForm: function (json, element) {
		var repeatNum = element.getRepeatNum();
		json = $H(json);
		if (json.length === 0) {
			alert(Joomla.JText._('PLG_FORM_AUTOFILL_NORECORDS_FOUND'));
		}
		
		json.each(function (val, key) {
			var k2 = key.substr(key.length - 4, 4);
			if (k2 === '_raw') {
				key = key.replace('_raw', '');
				if (!this.tryUpdate(key, val)) {
					if (repeatNum) {
						key += '_' + repeatNum;
						if (!this.tryUpdate(key, val)) {
							// See if the user has used simply the full element name rather than the full element name with
							// the join string
							key = 'join___' + element.options.joinid + '___' + key;
							this.tryUpdate(key, val);
						}
					}
				}
			}
		}.bind(this));
		if (this.options.editOrig === true) {
			this.form.getForm().getElement('input[name=rowid]').value = json.__pk_val;
		}
	},
	
	tryUpdate: function (key, val) {
		var el = this.form.formElements.get(key);
		if (typeOf(el) !== 'null') {
			el.update(val);
			return true;
		}
		return false;
	}
	
});