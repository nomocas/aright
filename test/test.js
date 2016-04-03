/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
if (typeof require !== 'undefined')
	var chai = require("./chai"),
		aright = require("../index"),
		v = aright.v;
else
	var v = aright.v;

var expect = chai.expect;



describe("string success", function() {
	var result = v().isString().validate('abcdef'); // return true
	it("should", function() {
		expect(result).to.equals(true);
	});
});
describe("string fail", function() {
	var result = v().isString().validate(12); // return true
	it("should", function() {
		expect(result).to.not.equals(true);
	});
});

describe("number success", function() {
	var result = v().isNumber().validate(12); // return true
	it("should", function() {
		expect(result).to.equals(true);
	});
});
describe("number fail", function() {
	var result = v().isNumber().validate(true); // return true
	it("should", function() {
		expect(result).to.not.equals(true);
	});
});

describe("bool success", function() {
	var result = v().isBool().validate(true); // return true
	it("should", function() {
		expect(result).to.equals(true);
	});
});
describe("bool fail", function() {
	var result = v().isBool().validate(1); // return true
	it("should", function() {
		expect(result).to.not.equals(true);
	});
});


describe("func success", function() {
	var result = v().isFunction().validate(function() {}); // return true
	it("should", function() {
		expect(result).to.equals(true);
	});
});
describe("func fail", function() {
	var result = v().isFunction().validate(1); // return true
	it("should", function() {
		expect(result).to.not.equals(true);
	});
});

describe("isArray success", function() {
	var result = v().isArray().validate([]); // return true
	it("should", function() {
		expect(result).to.equals(true);
	});
});
describe("isArray fail", function() {
	var result = v().isArray().validate({}); // return true
	it("should", function() {
		expect(result).to.not.equals(true);
	});
});

describe("isObject success", function() {
	var result = v().isObject().validate({}); // return true
	it("should", function() {
		expect(result).to.equals(true);
	});
});
describe("isObject fail", function() {
	var result = v().isObject().validate(true); // return true
	it("should", function() {
		expect(result).to.not.equals(true);
	});
});


describe("string + format + minLength", function() {
	var result = v().isString().format(/abc/).minLength(6).validate('abcdef'); // return true
	it("should", function() {
		expect(result).to.equals(true);
	});
});


describe("enumerable fail", function() {
	var result = v().enumerable(['bloupi', 'foo']).validate('bloup');
	it("should", function() {
		expect(result).to.not.equals(true);
	});
});

describe("enumerable success", function() {
	var result = v().enumerable(['bloupi', 'foo']).validate('bloupi');
	it("should", function() {
		expect(result).to.equals(true);
	});
});


describe("full rule", function() {
	var rule = v()
		.isObject()
		.string('email', v().format('email').required(false))
		.number('index', v().equal(24))
		.bool('flag')
		.array('collection',
			v().item(
				v().isString()
			)
		)
		.object('child',
			v().string('title')
		)
		.bool('test');

	var result = rule.validate({
		email: 'aaa@bbb.com',
		index: 24,
		flag: true,
		collection: ['hello'],
		child: {
			title: 'hello'
		},
		test: true
	});

	it("should", function() {
		expect(result).to.equals(true);
	});
});

describe("email fail", function() {
	var result = aright.rules.email.validate('abcdef');
	it("should", function() {
		expect(result).to.not.equals(true);
	});
});

describe("email success", function() {
	var result = aright.rules.email.validate('john@doe.com');
	it("should", function() {
		expect(result).to.equals(true);
	});
});
