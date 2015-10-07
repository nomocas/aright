(function() {
	'use strict';

	function error(errors, rule, parent, key, path) {
		if (path && key)
			path += '.';
		path = key ? (path + key) : path;

		if (!path)
			path = '.';

		errors.valid = false;
		(errors[path] = errors[path] || []).push({
			msg: i18n(rule) || 'missing error message',
			value: key ? parent[key] : parent
		});
		return false;
	}

	var i18n = function(rule, language) {
		var space = i18n.languages[language || i18n.currentLanguage];
		return space[rule];
	}

	i18n.currentLanguage = 'fr';
	i18n.languages = {
		fr: {
			string: "ceci n'est pas une string.",
			object: "ceci n'est pas un objet.",
			array: "ceci n'est pas une array.",
			'boolean': "ceci n'est pas un bool.",
			number: "ceci n'est pas un nombre.",
			'enum': "enumerable non respecté.",
			'null': "devrait être null.",
			email: "email invalide.",
			phone: "téléphone invalide.",
			unvalidated: "propriété non prévue.",
			missing: "propriété manquante.",
			minLength: "trop court",
			maxLength: "trop long",
			minimum: "trop petit",
			maximum: "trop grand"
		}
	};

	var formats = {
		email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/gi,
		phone: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/gi
	};

	var Validator = function() {
		this._rules = {};
	};

	function is(type) {
		return function() {
			return this.exec('this', function(input, path) {
				// console.log("is : ", type, input, path);
				if (typeof input !== type)
					return error(this, type, input, null, path);
				return true;
			});
		};
	}

	function prop(type) {
		return function(name, rule) {
			return this.exec(name, function(input, path) {
				if (typeof input[name] === 'undefined') {
					if (!rule || rule.required !== false)
						return error(this, 'missing', input, name, path);
					return true;
				}
				if (typeof input[name] !== type)
					return error(this, type, input, name, path);
				if (!rule)
					return true;
				return rule.call(this, input[name], path ? (path + '.' + name) : name);
			});
		};
	}

	//_______________________________ VALIDATOR

	Validator.prototype = {
		validate: function(input) {
			var errors = {
				valid: true
			};
			this.call(errors, input, '');
			if (errors.valid)
				return true;
			return errors;
		},
		call: function(errors, entry, path) {
			var ok = true;

			if (this.required !== false && typeof entry === 'undefined')
				return error(errors, 'missing', entry, null, path);

			if (this._rules['this'])
				this._rules['this'].forEach(function(rule) {
					ok = ok && rule.call(errors, entry, path);
				});

			if (!ok)
				return false;

			if (typeof entry !== 'object' || entry.forEach)
				return ok;

			var keys = {},
				i;
			for (i in entry)
				keys[i] = true;

			for (i in this._rules)
				if (i === 'this')
					continue;
				else {
					var k = this._rules[i].call(errors, entry, path);
					keys[i] = false;
					ok = ok && k;
				}

			for (i in keys)
				if (keys[i])
					ok = error(errors, 'unvalidated', entry, i, path);
			return ok;
		},
		exec: function(key, rule) {
			if (typeof rule === 'string')
				rule = rules[rule];
			if (key === 'this')
				(this._rules[key] = this._rules[key] || []).push(rule);
			else
				this._rules[key] = rule;
			return this;
		},
		rule: function(key, rule) {
			if (!rule) {
				rule = key;
				key = null;
			}
			if (typeof rule === 'string')
				rule = rules[rule];
			return this.exec(key || 'this', function(input, path) {
				input = key ? input[key] : input;
				if (key)
					path = path ? (path + '.' + key) : key;
				return rule.call(this, input, path);
			});
		},
		// ___________________________________ base
		required: function(yes) {
			this.required = yes;
			return this;
		},
		minLength: function(min) {
			return this.exec('this', function(input, path) {
				if (input.length < min)
					return error(this, 'minLength', input, null, path);
				return true;
			});
		},
		maxLength: function(max) {
			return this.exec('this', function(input, path) {
				if (input.length > max)
					return error(this, 'maxLength', input, null, path);
				return true;
			});
		},
		minimum: function(min) {
			return this.exec('this', function(input, path) {
				if (input < min)
					return error(this, 'minimum', input, null, path);
				return true;
			});
		},
		maximum: function(max) {
			return this.exec('this', function(input, path) {
				if (input > max)
					return error(this, 'maximum', input, null, path);
				return true;
			});
		},
		format: function(exp) {
			if (typeof exp === 'string')
				exp = formats[exp];
			return this.exec('this', function(input, path) {
				if (!exp.test(input))
					return error(this, 'format', input, null, path);
				return true;
			});
		},
		enumerable: function(values) {
			return this.exec('this', function(input, path) {
				if (values.indexOf(input) === -1)
					return error(this, 'enum', input, null, path);
				return true;
			});
		},

		isObject: is('object'),
		object: prop('object'),
		isString: is('string'),
		string: prop('string'),
		func: prop('function'),
		bool: prop('boolean'),
		number: prop('number'),

		isArray: function() {
			return this.exec('this', function(input, path) {
				if (typeof input !== 'object' && !input.forEach)
					return error(this, 'array', input, null, path);
				return true;
			});
		},
		isNull: function() {
			return this.exec('this', function(input, path) {
				if (input !== null)
					return error(this, 'null', input, null, path);
				return true;
			});
		},
		'null': function(name) {
			return this.exec(name, function(input, path) {
				if (input[name] !== null)
					return error(this, 'null', input, name, path);
				return true;
			});
		},
		array: function(name, rule) {
			return this.exec(name, function(input, path) {
				if (typeof input[name] === 'undefined') {
					if (!rule || rule.required !== false)
						return error(this, 'missing', input, name, path);
					return true;
				}
				if (typeof input[name] !== 'object' && !input[name].forEach)
					return error(this, 'array', input, name, path);
				if (!rule)
					return true;
				return rule.call(this, input[name], path ? (path + '.' + name) : name);
			});
		},
		item: function(rule) {
			return this.exec('this', function(input, path) {
				var self = this,
					index = 0,
					ok = true;
				input.forEach(function(item) {
					ok = ok && rule.call(self, item, path + '.' + (index++));
				});
				return ok;
			});
		}
	};

	var v = function() {
		return new Validator();
	};

	var rules = {
		email: v().isString().format('email').minLength(6),
		phone: v().isString().format('phone').minLength(8),
		address: v().isObject().string('street').string('city')
	};

	var aright = {
		v: v,
		Validator: Validator,
		rules: rules,
		i18n: i18n,
		formats: formats
	};

	if (typeof module !== 'undefined' && module.exports)
		module.exports = aright;
	else
		this.aright = aright;
})();
