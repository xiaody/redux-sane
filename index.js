/**
 * Dispatch whatever you like: functions/promises/generators.
 */
'use strict'

function noop () {}

function isFunction (x) {
  return typeof x === 'function'
}

function isPromise (x) {
  if (!x) return false
  return isFunction(x.then)
}

function isGenerator (x) {
  if (!x) return false
  return isFunction(x.next) && isFunction(x.throw)
}

module.exports = function (store) {
  var getState = store && isFunction(store.getState) ? store.getState : noop

  return function (next) {
    return function (action) {
      if (isFunction(action)) {
        action = action(next, getState)
      }

      if (isPromise(action)) {
        return action.then(next, null)
      }

      if (isGenerator(action)) {
        // loop and dispatch every value of a generator, promise awarely.
        // NOTE the return value of your generator will not be dispatched!
        return new Promise(function (resolve, reject) {
          ;(function loop ({value, done}) {
            Promise.resolve(value).then(function (v) {
              if (done) {
                resolve(v)
              } else {
                loop(action.next(next(v)))
              }
            }, function (e) {
              if (done) {
                reject(e)
              } else {
                loop(action.throw(e))
              }
            }).catch(reject)
          }(action.next()))
        })
      }

      return next(action)
    }
  }
}
