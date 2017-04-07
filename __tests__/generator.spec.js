import test from 'ava'
import {spy} from 'sinon'
import middleware from '../index'

const VALUE_OF_NEXT = 'VALUE_OF_NEXT'
const next = () => VALUE_OF_NEXT

test.beforeEach(t => {
  t.context.next = spy(next)
  t.context.sane = middleware()(t.context.next)
})

test('generator: generator or generator function', (t) => {
  const {next, sane} = t.context
  const generatorFn = function * () {
    yield 0
    yield Promise.resolve(1)
    return yield 2
  }
  return sane(generatorFn())
    .then(expect)
    .then(() => sane(generatorFn))
    .then(expect)

  function expect (v) {
    t.is(next.callCount, 3)
    t.deepEqual(next.args[0], [0])
    t.deepEqual(next.args[1], [1])
    t.deepEqual(next.args[2], [2])
    t.is(v, VALUE_OF_NEXT)
    next.reset()
  }
})

test('generator: empty', (t) => {
  const {next, sane} = t.context
  const generator = function * () {}
  return sane(generator).then((v) => {
    t.is(next.callCount, 0)
    t.is(v, undefined)
  })
})

test('generator: caught rejected promise', (t) => {
  const {next, sane} = t.context
  const generator = function * () {
    let ret = 'success'
    try {
      yield Promise.reject(new Error('caught error'))
    } catch (e) {
      ret = e.message
    }
    return yield ret
  }
  return sane(generator).then((v) => {
    t.is(next.callCount, 1)
    t.deepEqual(next.args[0], ['caught error'])
    t.is(v, VALUE_OF_NEXT)
  })
})

test('generator: uncaught rejected promise', (t) => {
  const {sane} = t.context
  const generator = function * () {
    yield Promise.reject(new Error('uncaught error'))
    return 'success'
  }
  return t.throws(sane(generator), 'uncaught error')
})

test('generator: done rejected promise', (t) => {
  const {sane} = t.context
  const generator = function * () {
    return Promise.reject(new Error('uncaught error'))
  }
  return t.throws(sane(generator), 'uncaught error')
})

test('generator: delegate', (t) => {
  const {sane, next} = t.context
  const g1 = function * () {
    yield 1; yield 2; return 'whatever'
  }
  const g2 = function * () {
    yield 0; yield * g1(); yield * [3, 4]; return 'fin'
  }
  return sane(g2).then((v) => {
    t.is(next.callCount, 5)
    t.deepEqual(next.args[0], [0])
    t.deepEqual(next.args[1], [1])
    t.deepEqual(next.args[2], [2])
    t.deepEqual(next.args[3], [3])
    t.deepEqual(next.args[4], [4])
    t.is(v, 'fin')
  })
})
