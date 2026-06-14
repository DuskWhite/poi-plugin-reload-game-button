'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8')
const pkg = require('./package.json')
const plugin = require('./index')

assert.strictEqual(pkg.name, 'poi-plugin-reload-game-button')
assert.strictEqual(pkg.author, 'DuskWhite')
assert.strictEqual(
  pkg.repository.url,
  'git+https://github.com/DuskWhite/poi-plugin-reload-game-button.git',
)
assert.strictEqual(pkg.poiPlugin.i18nDir, 'i18n')
assert.strictEqual(typeof plugin.pluginDidLoad, 'function')
assert.strictEqual(typeof plugin.pluginWillUnload, 'function')
assert.strictEqual(typeof plugin.reactClass, 'function')
assert.match(source, /PANEL_ID = 'poi-reload-game-panel'/)
assert.match(source, /STORAGE_KEY = 'poi-plugin-reload-game-button:panel-state'/)
assert.match(source, /CLOSED_STORAGE_KEY = 'poi-plugin-reload-game-button:panel-closed'/)
assert.match(source, /SHOW_PANEL_EVENT = 'poi-plugin-reload-game-button:show-panel'/)
assert.match(source, /function makePanelDraggable/)
assert.match(source, /function makePanelResizable/)
assert.match(source, /function closePanel/)
assert.match(source, /document\.getElementById\(PANEL_ID\)\?\.remove\(\)/)

const viewSource = fs.readFileSync(path.join(__dirname, 'views', 'index.js'), 'utf8')
assert.doesNotMatch(viewSource, /https:\/\/github\.com\/DuskWhite\/poi-plugin-reload-game-button/)

const en = require('./i18n/en-US.json')
const zh = require('./i18n/zh-CN.json')
assert.strictEqual(en.title, 'Reload Game Button')
assert.strictEqual(zh.title, '重新载入游戏')

console.log('plugin static checks ok')
