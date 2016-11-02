import test from 'ava'
import {spy} from 'sinon'
import middleware from '../index'

const STATE = {}
const ERROR = new Error()
const VALUE_OF_NEXT = 'VALUE_OF_NEXT'
const next = () => VALUE_OF_NEXT

test.beforeEach(t => {
  t.context.next = spy(next)
  t.context.sane = middleware({
    getState () { return STATE }
  })(t.context.next)
})

test('function: noop', (t) => {
  const {sane, next} = t.context
  const noop = function () {}
  const ret = sane(noop)

  t.is(ret, VALUE_OF_NEXT)
  t.is(next.callCount, 1)
  t.is(next.args[0][0], undefined)
})

test('function: thunk', (t) => {
  const {sane, next} = t.context
  const thunk = (dispatch, getState) => {
    return dispatch(getState())
  }
  const ret = sane(thunk)

  t.is(ret, VALUE_OF_NEXT)
  t.is(next.callCount, 2)
  t.is(next.args[0][0], STATE)
  t.is(next.args[1][0], VALUE_OF_NEXT)
})

test('function: throw', (t) => {
  const {sane} = t.context
  const throwFn = () => { throw ERROR }

  t.throws(() => sane(throwFn))
})
