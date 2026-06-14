'use strict'

const React = require('react')
const { Button, Callout, Intent } = require('@blueprintjs/core')
const { useTranslation } = require('react-i18next')

const SHOW_PANEL_EVENT = 'poi-plugin-reload-game-button:show-panel'
const RELOAD_GAME_EVENT = 'poi-plugin-reload-game-button:reload-game'
const PANEL_ID = 'poi-reload-game-panel'

function tt(t, key, fallback) {
  const translated = t(key)
  return translated === key ? fallback : translated
}

function reactClass() {
  const { t } = useTranslation('poi-plugin-reload-game-button')
  const [visible, setVisible] = React.useState(() => Boolean(document.getElementById(PANEL_ID)))

  React.useEffect(() => {
    const updateVisible = () => setVisible(Boolean(document.getElementById(PANEL_ID)))
    const timer = window.setInterval(updateVisible, 1000)
    window.addEventListener(SHOW_PANEL_EVENT, updateVisible)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener(SHOW_PANEL_EVENT, updateVisible)
    }
  }, [])

  const showPanel = () => {
    window.dispatchEvent(new Event(SHOW_PANEL_EVENT))
    window.setTimeout(() => setVisible(Boolean(document.getElementById(PANEL_ID))), 0)
  }

  const reloadGame = () => {
    window.dispatchEvent(new Event(RELOAD_GAME_EVENT))
  }

  return React.createElement(
    'div',
    { style: { padding: 12 } },
    React.createElement(
      Callout,
      {
        intent: Intent.PRIMARY,
        title: tt(t, 'title', '重新载入游戏'),
      },
      tt(t, 'description', '适合触摸屏使用的悬浮按钮，只重新载入游戏本体。'),
    ),
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          gap: 8,
          marginTop: 12,
        },
      },
      React.createElement(
        Button,
        {
          icon: 'widget',
          intent: Intent.PRIMARY,
          large: true,
          onClick: showPanel,
        },
        tt(t, 'showPanel', '显示悬浮窗'),
      ),
      React.createElement(
        Button,
        {
          icon: 'refresh',
          intent: Intent.WARNING,
          large: true,
          onClick: reloadGame,
        },
        tt(t, 'reloadGame', '重新载入游戏'),
      ),
    ),
    React.createElement(
      'div',
      { style: { marginTop: 10, opacity: 0.78 } },
      visible
        ? tt(t, 'panelVisible', '悬浮窗已显示。')
        : tt(t, 'panelHidden', '悬浮窗已隐藏。'),
    ),
  )
}

exports.reactClass = reactClass
