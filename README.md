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

### properties validation

### value constraints

### array and items

### validation

### custom rule

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
Do not forget to install dev-dependencies. i.e. : from 'decompose' folder, type :
```
> npm install
```

then, always in 'decompose' folder simply enter :
```
> mocha
```

### In the browser

Simply serve "decompose" folder in you favorite web server then open ./index.html.

You could use the provided "gulp web server" by entering :
```
> gulp serve-test
```


## Licence

The [MIT](http://opensource.org/licenses/MIT) License

Copyright (c) 2015 Gilles Coomans <gilles.coomans@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
