'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8')
const pkg = require('./package.json')
const plugin = require('./index')

assert.strictEqual(pkg.name, 'poi-plugin-reload-game-button')
assert.strictEqual(typeof plugin.pluginDidLoad, 'function')
assert.strictEqual(typeof plugin.pluginWillUnload, 'function')
assert.match(source, /PANEL_ID = 'poi-reload-game-panel'/)
assert.match(source, /STORAGE_KEY = 'poi-plugin-reload-game-button:panel-state'/)
assert.match(source, /function makePanelDraggable/)
assert.match(source, /function makePanelResizable/)
assert.match(source, /document\.getElementById\(PANEL_ID\)\?\.remove\(\)/)

console.log('plugin static checks ok')
