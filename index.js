/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * TODO : add  validationRule.getDefault()
 */
(function(global) {
	'use strict';

	var replaceShouldBeRegExp = /%s/g;

	var i18n = function(rule, language) {
		var space = i18n.data[language || i18n.currentLanguage];
		return space[rule];
	};

	function error(errors, rule, parent, key, path, shouldBe) {
		if (path && key)
			path += '.';
		path = key ? (path + key) : path;

		if (!path)
			path = 'root';

		errors.valid = false;
		errors.map[path] = errors.map[path] || {
			value: (parent && key) ? parent[key] : parent,
			errors: []
		};
		var msg = i18n(rule);
		if (!msg)
			msg = 'missing error message for ' + rule;
		if (shouldBe)
			msg = msg.replace(replaceShouldBeRegExp, shouldBe);
		errors.map[path].errors.push(msg);
		return false;
	}

	i18n.currentLanguage = 'en';
	i18n.data = {
		en: {
			string: 'should be a string',
			object: 'should be an object',
			array: 'should be an array',
			'boolean': 'should be a boolean',
			number: 'should be a number',
			'null': 'should be null',
			'enum': 'enum failed (should be one of : %s)',
			equal: 'equality failed (should be : %s)',
			format: 'format failed',
			unmanaged: 'unmanaged property',
			missing: 'missing property',
			minLength: 'too short (length should be at least : %s)',
			maxLength: 'too long (length should be at max : %s)',
			minimum: 'too small (should be at minimum : %s)',
			maximum: 'too big (should be at max : %s)',
			instanceOf: 'should be %s',
			or: '"or" rule not satisfied',
			not: '"not" rule not satisfied'
		}
	};

	var formats = {
		email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
	};

	var rules = {};

	function is(type) {
		return function() {
			return this.enqueue('this', function(input, path) {
				if (typeof input !== type)
					return error(this, type, input, null, path, type);
				return true;
			});
		};
	}

	function prop(type) {
		return function(name, rule) {
			return this.enqueue(name, function(input, path) {
				if (!input)
					return error(this, 'missing', input, name, path);
				if (typeof input[name] === 'undefined') {
					if (!rule || rule.required !== false)
						return error(this, 'missing', input, name, path);
					return true;
				}
				if (typeof input[name] !== type)
					return error(this, type, input, name, path, type);
				if (!rule)
					return true;
				return rule.call(this, input[name], path ? (path + '.' + name) : name);
			});
		};
	}

	//_______________________________ VALIDATOR

	var Validator = function() {
		this._rules = {};
	};

	Validator.prototype = {
		validate: function(input) {
			var errors = {
				valid: true,
				map: {}
			};
			this.call(errors, input, '');
			if (errors.valid)
				return true;
			errors.value = input;
			return errors;
		},
		//______ INNER JOB METHODS
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

			if (typeof entry !== 'object' || (entry && entry.forEach))
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
					ok = error(errors, 'unmanaged', entry, i, path);
			return ok;
		},
		enqueue: function(key, rule) {
			if (typeof rule === 'string')
				rule = rules[rule];
			if (key === 'this')
				(this._rules[key] = this._rules[key] || []).push(rule);
			else
				this._rules[key] = rule;
			return this;
		},
		//__________________ RULES METHODS
		rule: function(key, rule) {
			if (!rule) {
				rule = key;
				key = null;
			}
			if (typeof rule === 'string')
				rule = rules[rule];
			return this.enqueue(key || 'this', function(input, path) {
				input = key ? input[key] : input;
				if (key)
					path = path ? (path + '.' + key) : key;
				return rule.call(this, input, path);
			});
		},
		//____________________________________
		or: function() {
			var rules = [].slice.call(arguments);
			return this.enqueue('this', function(input, path) {
				var errors = { map: {} }, // fake error object
					ok = rules.some(function(rule) {
						return rule.call(errors, input, path);
					});
				if (!ok)
					return error(this, 'or', input, null, path);
				return true;
			});
		},
		not: function(rule) {
			return this.enqueue('this', function(input, path) {
				var errors = { map: {} }; // fake error object
				if (rule.call(errors, input, path))
					return error(this, 'not', input, null, path);
				return true;
			});
		},
		// ___________________________________ 
		required: function(yes) {
			this.required = yes;
			return this;
		},
		minLength: function(min) {
			return this.enqueue('this', function(input, path) {
				if (input.length < min)
					return error(this, 'minLength', input, null, path, min);
				return true;
			});
		},
		maxLength: function(max) {
			return this.enqueue('this', function(input, path) {
				if (input.length > max)
					return error(this, 'maxLength', input, null, path, max);
				return true;
			});
		},
		minimum: function(min) {
			return this.enqueue('this', function(input, path) {
				if (input < min)
					return error(this, 'minimum', input, null, path, min);
				return true;
			});
		},
		maximum: function(max) {
			return this.enqueue('this', function(input, path) {
				if (input > max)
					return error(this, 'maximum', input, null, path, max);
				return true;
			});
		},
		between: function(min, max) {
			return this.minimum(min).maximum(max);
		},
		format: function(exp) {
			if (typeof exp === 'string')
				exp = formats[exp];
			return this.enqueue('this', function(input, path) {
				if (!exp.test(input))
					return error(this, 'format', input, null, path);
				return true;
			});
		},
		enumerable: function(values) {
			return this.enqueue('this', function(input, path) {
				if (values.indexOf(input) === -1)
					return error(this, 'enum', input, null, path, values.join(', '));
				return true;
			});
		},
		item: function(rule) {
			return this.enqueue('this', function(input, path) {
				var self = this,
					index = 0;
				return input.every(function(item) {
					return rule.call(self, item, path + '.' + (index++));
				});
			});
		},

		equal: function(value) {
			return this.enqueue('this', function(input, path) {
				if (input !== value)
					return error(this, 'equal', input, null, path, value);
				return true;
			});
		},

		instanceOf: function(cl) {
			return this.enqueue('this', function(input, path) {
				if (!(input instanceof cl))
					return error(this, 'instanceOf', input, null, path, cl);
				return true;
			});
		},

		type: function() {
			var types = [];
			for (var i = 0, len = arguments.length; i < len; ++i)
				types.push(v()['is' + arguments[i][0].toUpperCase() + arguments[i].substring(1)]());
			return this.or.apply(this, types);
		},

		isObject: is('object'),
		isString: is('string'),
		isNumber: is('number'),
		isBool: is('boolean'),
		isFunction: is('function'),
		isArray: function() {
			return this.enqueue('this', function(input, path) {
				if (typeof input !== 'object' || !input.forEach)
					return error(this, 'array', input, null, path);
				return true;
			});
		},
		isNull: function() {
			return this.enqueue('this', function(input, path) {
				if (input !== null)
					return error(this, 'null', input, null, path);
				return true;
			});
		},


		object: prop('object'),
		string: prop('string'),
		func: prop('function'),
		bool: prop('boolean'),
		number: prop('number'),
		'null': function(name) {
			return this.enqueue(name, function(input, path) {
				if (input[name] !== null)
					return error(this, 'null', input, name, path);
				return true;
			});
		},
		array: function(name, rule) {
			return this.enqueue(name, function(input, path) {
				if (typeof input[name] === 'undefined') {
					if (!rule || rule.required !== false)
						return error(this, 'missing', input, name, path);
					return true;
				}
				if (typeof input[name] !== 'object' || !input[name].forEach)
					return error(this, 'array', input, name, path);
				if (!rule)
					return true;
				return rule.call(this, input[name], path ? (path + '.' + name) : name);
			});
		}
	};

	var v = function() {
		return new Validator();
	};

	rules.email = v().isString().format('email').minLength(6);

	var aright = {
		v: v,
		Validator: Validator,
		rules: rules,
		i18n: i18n,
		formats: formats,
		error: error
	};

	if (typeof module !== 'undefined' && module.exports)
		module.exports = aright;
	else
		global.aright = aright;
})(this);
