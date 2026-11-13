import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const source = readFileSync('src/App.jsx', 'utf8')
const body = source.match(/const pointerMove = e => \{([\s\S]*?)\n  \}\n  const pointerUp/)[1]
for (const pinch of [false, true]) {
  const base = { x: 0, y: 0, scale: 1, rotate: 0, flip: 1 }
  const gesture = { current: pinch ? { type: 'pinch', base, distance: 100, angle: 0 } : { type: 'move', base, start: { x: 0, y: 0 } } }
  const pointers = { current: new Map([[1, { x: 0, y: 0 }]]) }
  if (pinch) pointers.current.set(2, { x: 100, y: 0 })
  const updates = []
  const move = new Function('locked', 'pointers', 'gesture', 'setTransform', 'e', body)
  move(false, pointers, gesture, update => updates.push(update), { pointerId: 1, clientX: 20, clientY: 30 })
  gesture.current = null
  pointers.current.clear()
  assert.equal(updates.length, 1)
  const result = updates[0](base)
  for (const value of Object.values(result)) assert(Number.isFinite(value))
  if (!pinch) assert.deepEqual([result.x, result.y], [20, 30])
}
console.log('PASS: deferred drag and pinch updates survive pointer release')
