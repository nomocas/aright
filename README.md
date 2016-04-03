# aright

Small and really fast js objects and types validation (browser or server side).

Allow to describe validation rules with compact chained API.

Easy i18n.

Really fast because it doesn't need schema parsing and interpretation. Rules holds directly an array of nested functions that do the job as fast as possible.

Pure vanilla js, no dependencies.

Small size (4.0 Ko minified, 1.4 Ko min/gzip).

## Install

```shell
npm i aright
# or
bower i aright
# or
git clone https://github.com/nomocas/aright.git
```

## Examples

```javascript
var v = aright.v;

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

rule.validate({
  email:'aaa@bbb.com',
  index:24,
  flag:true,
  collection:['hello'],
  child:{
    title:'hello'
  },
  test:true
});
// => return true
```

```javascript
aright.rules.email.validate('abcdef'); // return error report
// equivalent to :
v().rule('email').validate('abcdef'); // return error report
```

```javascript
v().isString().format(/abc/).minLength(6).validate('abcdef');   // return true
v().isString().enumerable(['bloupi', 'foo']).validate('bloup'); // return error report
```

## Full API

### is* Family

.isString(), isNumber(), .isBool(), .isObject(), .isArray(), .isFunction(), .isNull()

```javascript
v().isNull().validate(null); //return true
```

### properties validation

.bool(propName), .number(propName), .string(propName), .func(propName), .null(propName), .object(propName), .array(propName) 

```javascript
v().string('title', v().required())
.bool('published', v().equal(false))
.number('count')
.validate({
  title:'hello world',
  published:false,
  count:12
}); //return true
```

### value constraints

.required(), .minLength(5), .maxLength(3), .minimum(7), .maximum(9), .enumerable(['foo', 'bar']), .equal('my value')


```javascript
v().required().validate(undefined); // return error report

v().equal(12).validate(1); // return error report

//...
```

####  value format 
Validate value against regExp

```javascript
v().format(/abc/gi).validate('abc'); // return true
```

To define custom format : 
```javascript
aright.formats.myFormat = /abc/gi;
v().format('myFormat').validate('abc'); // return true
```

As predefined format there is only email for the moment...
```javascript
v().format('email').validate('john@doe.com'); // return true
```

### array and items
Both work together :

```javascript 
var o =  {
  collection:['foo', 'bar', 'zoo']
};

v().isObject()
.array('collection',
  v().item(
    v().isString()
  )
)
.validate(o); // return true
```

### validation

any value could be validated through aright rules by calling .validate( valueToTest ).

### custom rule

To define custom rules :

```javascript 
aright.rules.myRule = v().isString().required();
v().rule('myRule').validate('hello'); // return true
```

### custom 'this' handler

```javascript
// handler that act on 'this' (as is* family)
aright.Validator.prototype.myRule = function(){
  return this.exec('this', function(input, path){
  // input is the value to test, and path is its path from root object
    if(input ...){
      //...
      return true;
    }
    else
      return aright.error('some error message...', 'myRule', null, null, path, 'should be a ...')
  });
};

v().myRule().validate(...);
```

### custom property handler

```javascript
// handler that act on choosen property
aright.Validator.prototype.myOtherRule = function(propertyName){
  return this.exec(propertyName, function(input, path){
  // input is the value to test, and path is its path from root object
    if(input[propertyName] ...){
      //...
      return true;
    }
    else
      return aright.error('some error message...', 'myOtherRule', input, null, path, 'should be a ...')
  });
};

v().myRule().validate(...);
```

## i18n

Take a look to `aright/i18n/fr.js` to have an idea on how customise
```javascript
aright.i18n.data.fr = require('aright/i18n/fr');
aright.i18n.currentLanguage = 'fr';
// aright errors messages will now be in french
```

## Tests

### Under nodejs

You need to have mocha installed globally before launching test. 
```
> npm install -g mocha
```
Do not forget to install dev-dependencies. i.e. : from 'aright' folder, type :
```
> npm install
```

then, always in 'aright' folder simply enter :
```
> mocha
```



## Licence

The [MIT](http://opensource.org/licenses/MIT) License

Copyright (c) 2015 Gilles Coomans <gilles.coomans@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
