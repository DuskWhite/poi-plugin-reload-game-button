# poi-plugin-reload-game-button

Adds a touch-friendly floating panel to poi for reloading only the game frame.

The button calls poi's existing `gameReload()` helper. If that helper cannot be loaded, it falls back
to the same webview JavaScript used by poi.

The panel starts on the right side of the window. Drag the top handle to move it, and drag the
bottom-right corner to resize it. Position and size are saved in `localStorage`.
