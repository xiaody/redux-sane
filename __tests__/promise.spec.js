import test from 'ava'
import {spy} from 'sinon'
import middleware from '../index'

const RESOLVED = Promise.resolve('success')
const REJECTED = Promise.reject(new Error('error'))
const VALUE_OF_NEXT = 'VALUE_OF_NEXT'
const next = () => VALUE_OF_NEXT

test.beforeEach(t => {
  t.context.next = spy(next)
  t.context.sane = middleware()(t.context.next)
})

test('promise: resolved', (t) => {
  const {sane, next} = t.context

  return sane(RESOLVED)
    .then((ret) => {
      t.is(next.callCount, 1)
      t.deepEqual(next.args[0], ['success'])
      t.is(ret, VALUE_OF_NEXT)
    })
})

test('promise: rejected', (t) => {
  const {sane, next} = t.context

  return sane(REJECTED)
    .then(() => t.fail())
    .catch((e) => {
      t.is(next.callCount, 0)
      t.is(e.message, 'error')
    })
})

test('promise: fn => resolved', (t) => {
  const {sane, next} = t.context
  const fn = () => RESOLVED

  return sane(fn)
    .then((ret) => {
      t.is(next.callCount, 1)
      t.deepEqual(next.args[0], ['success'])
      t.is(ret, VALUE_OF_NEXT)
    })
})

test('promise: fn => rejected', (t) => {
  const {sane, next} = t.context
  const fn = () => REJECTED

  return sane(fn)
    .then(() => t.fail())
    .catch((e) => {
      t.is(next.callCount, 0)
      t.is(e.message, 'error')
    })
})
