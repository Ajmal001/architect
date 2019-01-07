let assert = require('@smallwins/validate/assert')
let chalk = require('chalk')
let _progress = require('../../util/progress')
let progress
let update = require('./_update')
let series = require('run-series')
let shared = require('../shared')

/**
 * Update dependencies for one or many Functions
 *   - pathToCode: single Function operations may be a string
 *                 bulk Function operations must be an array
 */
module.exports = function hydrateUpdate(params, callback) {

  assert(params, {
    arc: Object,
    pathToCode: Array,
    // start: Number,
    // tick: Function,
  })

  let { arc, pathToCode, start, tick } = params

  // Normalize to array in case it's a single path passed from deploy
  if (typeof pathToCode === 'string') pathToCode = [pathToCode]

  // Progress
  // - 2 ticks for update
  // - 2 for shared
  // - 4 for shared/copy
  let total = 8
  if (!tick) {
    progress = _progress({
      name: 'Hydrating:',
      total
    })
    tick = progress.tick
  }

  const installing = false

  series([
    function _update(callback) {
      update({arc, pathToCode, tick}, callback)
    },
    function _shared(callback) {
      shared({installing, arc, pathToCode, tick}, callback)
    },
  ],
  function _done(err) {
    if (err) callback(err)
    else {
      let ts = Date.now() - start
      console.log(`${chalk.green('✓ Success!')} ${chalk.green.dim(`Updated all dependencies in ${ts}ms`)}`)
      callback()
    }
  })
}
