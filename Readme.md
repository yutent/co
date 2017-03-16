![module info](https://nodei.co/npm/es.co.png?downloads=true&downloadRank=true&stars=true)


# es.co
> Generator based control flow goodness for nodejs,using promises, letting you write non-blocking code in a nice-ish way.
> It base on `tj/co`, but optimize it for `async/awit` compatibility.



## Install
```bash
    npm install es.co
```

## Usage
```javascript

let co = require('es.co'),
    fs = require('fs');

function read(file) {
    return fn => {
        fs.readFile(file, fn)
    }
}

co(function* (){

    log(yield Promise.resolve("promise"));
    log(yield function *() { return "generator" });
    log(yield {a: 234})
    log(yield [123])
    log(yield new Date());
    log(yield 123);
    log(yield "hello");
    log(yield true);
    log(yield NaN);
    log(yield undefined);
    log(yield '');
    log(yield read('test.txt'));
    log(yield null);
    log(yield 1/0);
})

```


> For more usages,  you can take a look at [tj/co](https://github.com/tj/co)