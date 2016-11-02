import test from 'ava'
import {spy} from 'sinon'
import middleware from '../index'

const VALUE_OF_NEXT = 'VALUE_OF_NEXT'
const next = () => VALUE_OF_NEXT

test.beforeEach(t => {
  t.context.next = spy(next)
  t.context.sane = middleware()(t.context.next)
})

test('default: pass through', (t) => {
  const {sane, next} = t.context
  const action = {type: 'whatever'}

  t.is(sane(action), VALUE_OF_NEXT)
  t.is(next.callCount, 1)
  t.is(next.args[0][0], action)
})
