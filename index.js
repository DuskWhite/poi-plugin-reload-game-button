'use strict'

const PLUGIN_ID = 'poi-plugin-reload-game-button'
const PANEL_ID = 'poi-reload-game-panel'
const STYLE_ID = 'poi-reload-game-button-style'
const STORAGE_KEY = 'poi-plugin-reload-game-button:panel-state'
const CLOSED_STORAGE_KEY = 'poi-plugin-reload-game-button:panel-closed'
const SHOW_PANEL_EVENT = 'poi-plugin-reload-game-button:show-panel'
const RELOAD_GAME_EVENT = 'poi-plugin-reload-game-button:reload-game'
const RELOAD_TITLE = '重新载入游戏'

const DEFAULT_STATE = {
  width: 168,
  height: 78,
  top: null,
  left: null,
}

let observer = null
let retryTimer = null

function reloadGameFallback() {
  const { getStore } = require('views/create-store')
  getStore('layout.webview.ref')?.executeJavaScript(`
  var doc;
  if (document.getElementById('game_frame')) {
    doc = document.getElementById('game_frame').contentDocument;
  } else {
    doc = document;
  }

  var game = doc.getElementById('htmlWrap');
  if (game) {
    game.contentWindow.location.reload()
  }
  `)
}

function reloadGame() {
  try {
    const { gameReload } = require('views/services/utils')
    gameReload()
  } catch (error) {
    console.warn(`${PLUGIN_ID}: falling back to inline reload`, error)
    reloadGameFallback()
  }
}

function readPanelState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { ...DEFAULT_STATE }
    }

    const parsed = JSON.parse(raw)
    return {
      width: Number.isFinite(parsed.width) ? parsed.width : DEFAULT_STATE.width,
      height: Number.isFinite(parsed.height) ? parsed.height : DEFAULT_STATE.height,
      top: Number.isFinite(parsed.top) ? parsed.top : DEFAULT_STATE.top,
      left: Number.isFinite(parsed.left) ? parsed.left : DEFAULT_STATE.left,
    }
  } catch (error) {
    console.warn(`${PLUGIN_ID}: failed to read panel state`, error)
    return { ...DEFAULT_STATE }
  }
}

function writePanelState(panel) {
  const rect = panel.getBoundingClientRect()
  const state = {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    top: Math.round(rect.top),
    left: Math.round(rect.left),
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function isPanelClosed() {
  return window.localStorage.getItem(CLOSED_STORAGE_KEY) === 'true'
}

function setPanelClosed(closed) {
  window.localStorage.setItem(CLOSED_STORAGE_KEY, closed ? 'true' : 'false')
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function clampPanel(panel) {
  const rect = panel.getBoundingClientRect()
  const left = clamp(rect.left, 0, Math.max(0, window.innerWidth - rect.width))
  const top = clamp(rect.top, 0, Math.max(0, window.innerHeight - rect.height))
  panel.style.left = `${Math.round(left)}px`
  panel.style.top = `${Math.round(top)}px`
  panel.style.right = 'auto'
}

function applyPanelState(panel) {
  const state = readPanelState()
  const width = clamp(state.width, 120, Math.max(120, window.innerWidth))
  const height = clamp(state.height, 58, Math.max(58, window.innerHeight))

  panel.style.width = `${Math.round(width)}px`
  panel.style.height = `${Math.round(height)}px`

  if (state.left == null || state.top == null) {
    panel.style.right = '14px'
    panel.style.left = 'auto'
    panel.style.top = `${Math.round((window.innerHeight - height) / 2)}px`
  } else {
    panel.style.left = `${Math.round(state.left)}px`
    panel.style.top = `${Math.round(state.top)}px`
    panel.style.right = 'auto'
  }

  window.requestAnimationFrame(() => clampPanel(panel))
}

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    #${PANEL_ID} {
      backdrop-filter: blur(12px);
      background: rgba(35, 40, 48, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
      box-sizing: border-box;
      color: #fff;
      display: flex;
      flex-direction: column;
      min-height: 58px;
      min-width: 120px;
      overflow: hidden;
      position: fixed;
      z-index: 2147483000;
    }

    #${PANEL_ID} .poi-reload-game-panel-handle {
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      cursor: move;
      display: flex;
      flex: 0 0 22px;
      font-size: 11px;
      font-weight: 600;
      justify-content: center;
      letter-spacing: 0;
      line-height: 22px;
      touch-action: none;
      user-select: none;
    }

    #${PANEL_ID} .poi-reload-game-panel-title {
      flex: 1 1 auto;
      text-align: center;
    }

    #${PANEL_ID} .poi-reload-game-panel-close {
      align-items: center;
      background: transparent;
      border: 0;
      color: rgba(255, 255, 255, 0.86);
      cursor: pointer;
      display: flex;
      flex: 0 0 26px;
      font-size: 17px;
      height: 22px;
      justify-content: center;
      line-height: 1;
      padding: 0;
      touch-action: manipulation;
    }

    #${PANEL_ID} .poi-reload-game-panel-close:active {
      background: rgba(255, 255, 255, 0.12);
    }

    #${PANEL_ID} .poi-reload-game-panel-button {
      align-items: center;
      background: #d9822b;
      border: 0;
      color: #fff;
      cursor: pointer;
      display: flex;
      flex: 1 1 auto;
      font-size: 18px;
      font-weight: 700;
      justify-content: center;
      letter-spacing: 0;
      line-height: 1.2;
      min-height: 36px;
      padding: 8px 12px;
      text-align: center;
      touch-action: manipulation;
      user-select: none;
      width: 100%;
    }

    #${PANEL_ID} .poi-reload-game-panel-button:active {
      background: #bf7326;
    }

    #${PANEL_ID} .poi-reload-game-panel-resizer {
      border-bottom: 12px solid rgba(255, 255, 255, 0.72);
      border-left: 12px solid transparent;
      bottom: 4px;
      cursor: nwse-resize;
      height: 0;
      position: absolute;
      right: 4px;
      touch-action: none;
      width: 0;
    }
  `
  document.head.appendChild(style)
}

function createPanel() {
  const panel = document.createElement('div')
  panel.id = PANEL_ID

  const handle = document.createElement('div')
  handle.className = 'poi-reload-game-panel-handle'

  const title = document.createElement('div')
  title.className = 'poi-reload-game-panel-title'
  title.textContent = 'Reload'

  const close = document.createElement('button')
  close.type = 'button'
  close.className = 'poi-reload-game-panel-close'
  close.title = '关闭'
  close.setAttribute('aria-label', '关闭')
  close.textContent = '×'
  close.addEventListener('pointerdown', (event) => {
    event.stopPropagation()
  })
  close.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    closePanel(panel)
  })

  handle.appendChild(title)
  handle.appendChild(close)

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'poi-reload-game-panel-button'
  button.title = RELOAD_TITLE
  button.setAttribute('aria-label', RELOAD_TITLE)
  button.textContent = RELOAD_TITLE
  button.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    reloadGame()
  })

  const resizer = document.createElement('div')
  resizer.className = 'poi-reload-game-panel-resizer'

  panel.appendChild(handle)
  panel.appendChild(button)
  panel.appendChild(resizer)

  makePanelDraggable(panel, handle)
  makePanelResizable(panel, resizer)
  applyPanelState(panel)

  return panel
}

function closePanel(panel) {
  writePanelState(panel)
  setPanelClosed(true)
  panel.remove()
}

function makePanelDraggable(panel, handle) {
  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault()
    panel.setPointerCapture?.(event.pointerId)

    const rect = panel.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startLeft = rect.left
    const startTop = rect.top

    const onMove = (moveEvent) => {
      const left = startLeft + moveEvent.clientX - startX
      const top = startTop + moveEvent.clientY - startY
      panel.style.left = `${Math.round(left)}px`
      panel.style.top = `${Math.round(top)}px`
      panel.style.right = 'auto'
      clampPanel(panel)
    }

    const onEnd = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
      writePanelState(panel)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('pointercancel', onEnd)
  })
}

function makePanelResizable(panel, resizer) {
  resizer.addEventListener('pointerdown', (event) => {
    event.preventDefault()
    event.stopPropagation()
    panel.setPointerCapture?.(event.pointerId)

    const rect = panel.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startWidth = rect.width
    const startHeight = rect.height

    const onMove = (moveEvent) => {
      const width = clamp(startWidth + moveEvent.clientX - startX, 120, window.innerWidth)
      const height = clamp(startHeight + moveEvent.clientY - startY, 58, window.innerHeight)
      panel.style.width = `${Math.round(width)}px`
      panel.style.height = `${Math.round(height)}px`
      clampPanel(panel)
    }

    const onEnd = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
      writePanelState(panel)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('pointercancel', onEnd)
  })
}

function injectPanel() {
  if (!document.body) {
    return false
  }

  if (isPanelClosed()) {
    return false
  }

  if (document.getElementById(PANEL_ID)) {
    return true
  }

  ensureStyle()
  document.body.appendChild(createPanel())
  return true
}

function showPanel() {
  setPanelClosed(false)
  injectPanel()
  const panel = document.getElementById(PANEL_ID)
  if (panel) {
    clampPanel(panel)
    writePanelState(panel)
  }
}

function startObserver() {
  if (observer || !document.body) {
    return
  }

  observer = new MutationObserver(() => {
    injectPanel()
  })
  observer.observe(document.body, {
    childList: true,
  })
}

function startRetryTimer() {
  if (retryTimer) {
    return
  }

  retryTimer = window.setInterval(() => {
    if (injectPanel() && retryTimer) {
      window.clearInterval(retryTimer)
      retryTimer = null
    }
    startObserver()
  }, 1000)
}

function pluginDidLoad() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pluginDidLoad, { once: true })
    return
  }

  injectPanel()
  startObserver()
  startRetryTimer()
  window.addEventListener('resize', handleWindowResize)
  window.addEventListener(SHOW_PANEL_EVENT, showPanel)
  window.addEventListener(RELOAD_GAME_EVENT, reloadGame)
}

function handleWindowResize() {
  const panel = document.getElementById(PANEL_ID)
  if (panel) {
    clampPanel(panel)
    writePanelState(panel)
  }
}

function pluginWillUnload() {
  document.removeEventListener('DOMContentLoaded', pluginDidLoad)
  window.removeEventListener('resize', handleWindowResize)
  window.removeEventListener(SHOW_PANEL_EVENT, showPanel)
  window.removeEventListener(RELOAD_GAME_EVENT, reloadGame)
  document.getElementById(PANEL_ID)?.remove()
  document.getElementById(STYLE_ID)?.remove()

  if (observer) {
    observer.disconnect()
    observer = null
  }

  if (retryTimer) {
    window.clearInterval(retryTimer)
    retryTimer = null
  }
}

module.exports = {
  pluginDidLoad,
  pluginWillUnload,
  reactClass: (props) => require('./views').reactClass(props),
}
