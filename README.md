# poi-plugin-reload-game-button

## 中文

适用于 poi 的触摸友好悬浮按钮插件，用来只重新载入游戏本体。

这个按钮调用 poi 现有的 `gameReload()` 逻辑。如果该逻辑无法加载，会回退到与 poi 相同的
webview JavaScript 重新载入方式。

悬浮窗默认显示在窗口右侧。拖动顶部标题栏可以移动，拖动右下角可以调整大小，位置和尺寸会
保存到 `localStorage`。

点击悬浮窗右上角关闭按钮可以隐藏它。隐藏后，在 poi 的插件主页打开本插件，点击“显示悬浮窗”
即可重新打开。

仓库地址：https://github.com/DuskWhite/poi-plugin-reload-game-button

## English

A touch-friendly floating panel plugin for poi that reloads only the game frame.

The button calls poi's existing `gameReload()` helper. If that helper cannot be loaded, it falls back
to the same webview JavaScript used by poi.

The panel starts on the right side of the window. Drag the top handle to move it, and drag the
bottom-right corner to resize it. Position and size are saved in `localStorage`.

Use the close button in the panel header to hide it. Open the plugin page from poi's plugin list and
click "Show floating panel" to bring it back.

Repository: https://github.com/DuskWhite/poi-plugin-reload-game-button
