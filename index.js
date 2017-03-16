/**
 * 
 * @authors yutent (yutent@doui.cc)
 * @date    2017-03-16 19:10:09
 *
 */

"use strict";

const aps = Array.prototype.slice;

function co(gen) {

    let args = aps.call(arguments, 1);

    return new Promise((yes, no) => {

        if(typeof gen === 'function'){
            gen = gen.apply(this, args);
        }

        if(!gen || typeof gen.next !== 'function'){
            return yes(gen)
        }

        function onFullfilled(res) {
            let result;
            try {
                result = gen.next(res);
            } catch(err) {
                return no(err)
            }
            next(result)
        }



        function onRejected(err) {
            let result;
            try {
                result = gen.throw(err);
            } catch(err) {
                return no(err)
            }
            next(result)
        }


        function next(result) {
            if(result.done){
                return yes(result.value)
            }
            let value = toPromise.call(this, result.value);
            if(value && isPromise(value)) {
                return value.then(onFullfilled, onRejected);
            }

            return onRejected(new Error('uncaught exception'))
        }


        onFullfilled()

    })


}

co.wrap = function(fn){
    return function cp() {
        co.call(this, fn.apply(this, arguments))
    }.__generatorFunction__ = fn
}



function toPromise(obj) {

    if(!obj)
        return Promise.resolve(obj)

    if(isPromise(obj)) {
        return obj
    }

    if(isGenerator(obj) || isGeneratorFunction(obj)) {
        return co.call(this, obj)
    }

    if(typeof obj === 'function') {
        return thunk2Promise.call(this, obj)
    }

    if(Array.isArray(obj)) {
        return array2Promise.call(this, obj)
    }

    if(isObject(obj)) {
        return object2Promise.call(this, obj);
    }

    return Promise.resolve(obj);

}




/*-------------------------*/


function thunk2Promise(fn) {

    return new Promise((yes, no) => {
        fn.call(this, function(err, res){

            if(err){
                return no(err)
            }

            if(arguments.length > 2) {
                res = aps.call(arguments, 1)
            }
            yes(res)
        })
    })
}




function array2Promise(obj) {
    return Promise.all(obj.map(toPromise, this))
}


function object2Promise(obj) {
    let result = new obj.constructor(),
        keys = Object.keys(obj),
        promises = [],
        defer = function(p, k){
            result[k] = undefined;
            promises.push(p.then(res => {
                result[k] = res
            }))
        };

    for(let i = 0, key; key = keys[i++];) {
        let promise = toPromise.call(this, obj[key]);
        if(promise && isPromise(promise)) {
            defer(promise, key)
        } else {
            result[key] = obj[key]
        }
    }

    return Promise.all(promises)
                .then(function(){
                    return result
                })


}




function isPromise(obj) {
    return typeof obj === 'object' && obj.toString() === '[object Promise]'
}


function isGenerator(obj) {
    return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}



function isGeneratorFunction(obj) {
    let constructor = obj.constructor;
    if (!constructor) {
        return false;
    }
    if ('GeneratorFunction' === constructor.name
        || 'GeneratorFunction' === constructor.displayName) {
        return true;
    }
    return isGenerator(constructor.prototype);
}

function isObject(val) {
    return val !== undefined && (Object === val.constructor || Date === val.constructor);
}


module.exports = co