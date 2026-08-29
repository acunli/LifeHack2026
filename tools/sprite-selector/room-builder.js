// Lane B Room Builder — WattWise
// Visual apartment construction tool with sprite selection and placement

const TILE_SIZE = 32;

const SHEETS = {
    interiors: {
        path: '../../Assets/InteriorElements/32x32/Interiors_free_32x32.png',
        width: 512,
        height: 2848,
        cols: 16,
        rows: 89,
        name: 'Interiors 32×32'
    },
    room_builder: {
        path: '../../Assets/InteriorElements/32x32/Room_Builder_free_32x32.png',
        width: 544,
        height: 736,
        cols: 17,
        rows: 23,
        name: 'Room Builder 32×32'
    }
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

// Sprite selection state (existing functionality)
let currentSheet = 'interiors';
let sheetZoom = 2;
let sprites = [];
let selection = null;
let isDraggingSheet = false;
let dragStart = null;

// Room building state (new functionality)
let roomConfig = { cols: 24, rows: 18 };
let placedObjects = [];
let selectedSprite = null;  // Selected from palette
let selectedObject = null;  // Selected placed object
let buildMode = 'select';   // 'select', 'place', 'paint'
let canvasZoom = 1;
let nextObjectId = 1;
let history = [];
let historyIndex = -1;
let maxHistory = 50;

// Room canvas interaction state
let isDraggingObject = false;
let dragOffset = { x: 0, y: 0 };
let isPainting = false;
let previewMode = false;

// Loaded sprite sheet images
let spriteSheetImages = {};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

// Left panel - Sprite sheet selector
const sheetSelect = document.getElementById('sheet-select');
const spriteNameInput = document.getElementById('sprite-name');
const spriteImage = document.getElementById('sprite-image');
const gridOverlay = document.getElementById('grid-overlay');
const selectionOverlay = document.getElementById('selection-overlay');
const spriteViewer = document.getElementById('sprite-viewer');
const addSpriteBtn = document.getElementById('add-sprite-btn');
const clearSelectionBtn = document.getElementById('clear-selection');

// Center panel - Room canvas
const roomCanvas = document.getElementById('room-canvas');
const roomCanvasContainer = document.getElementById('room-canvas-container');
const roomColsInput = document.getElementById('room-cols');
const roomRowsInput = document.getElementById('room-rows');
const roomDimensions = document.getElementById('room-dimensions');
const placedCountSpan = document.getElementById('placed-count');
const selectedInfoSpan = document.getElementById('selected-info');

// Mode buttons
const modeSelectBtn = document.getElementById('mode-select');
const modePlaceBtn = document.getElementById('mode-place');
const modePaintBtn = document.getElementById('mode-paint');

// Room controls
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const previewRoomBtn = document.getElementById('preview-room');
const clearRoomBtn = document.getElementById('clear-room');
const saveRoomBtn = document.getElementById('save-room');
const loadRoomBtn = document.getElementById('load-room');
const loadFileInput = document.getElementById('load-file-input');

// Right panel - Palette and properties
const paletteGrid = document.getElementById('palette-grid');
const placedObjectsList = document.getElementById('placed-objects-list');
const objectCount = document.getElementById('object-count');
const objectProperties = document.getElementById('object-properties');

// Export panel
const showExportBtn = document.getElementById('show-export');
const closeExportBtn = document.getElementById('close-export');
const exportPanel = document.getElementById('export-panel');
const exportSpritemap = document.getElementById('export-spritemap');
const exportLayout = document.getElementById('export-layout');
const exportAll = document.getElementById('export-all');
const copySpritemap = document.getElementById('copy-spritemap');
const copyLayout = document.getElementById('copy-layout');
const validationErrors = document.getElementById('validation-errors');
const errorList = document.getElementById('error-list');
const exportSpritemapOutput = document.getElementById('export-spritemap-output');
const exportLayoutOutput = document.getElementById('export-layout-output');

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
    loadSpriteSheet(currentSheet);
    initRoomCanvas();
    setupEventListeners();
    loadFromLocalStorage();
    updateUI();
}

function setupEventListeners() {
    // Sheet selection
    sheetSelect.addEventListener('change', (e) => {
        currentSheet = e.target.value;
        loadSpriteSheet(currentSheet);
        clearSheetSelection();
    });

    // Sheet zoom controls
    document.querySelectorAll('[data-zoom]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            sheetZoom = parseInt(e.target.dataset.zoom);
            applySheetZoom();
        });
    });

    // Sprite sheet mouse interaction
    spriteViewer.addEventListener('mousedown', handleSheetMouseDown);
    spriteViewer.addEventListener('mousemove', handleSheetMouseMove);
    spriteViewer.addEventListener('mouseup', handleSheetMouseUp);
    spriteViewer.addEventListener('mouseleave', handleSheetMouseUp);

    // Add sprite button
    addSpriteBtn.addEventListener('click', addSpriteFromSelection);
    clearSelectionBtn.addEventListener('click', clearSheetSelection);

    // Room dimension changes
    roomColsInput.addEventListener('change', updateRoomDimensions);
    roomRowsInput.addEventListener('change', updateRoomDimensions);

    // Build mode buttons
    modeSelectBtn.addEventListener('click', () => setBuildMode('select'));
    modePlaceBtn.addEventListener('click', () => setBuildMode('place'));
    modePaintBtn.addEventListener('click', () => setBuildMode('paint'));

    // Canvas zoom controls
    document.querySelectorAll('[data-canvas-zoom]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            canvasZoom = parseFloat(e.target.dataset.zoom);
            renderRoom();
        });
    });

    // Room canvas interaction
    roomCanvas.addEventListener('mousedown', handleRoomMouseDown);
    roomCanvas.addEventListener('mousemove', handleRoomMouseMove);
    roomCanvas.addEventListener('mouseup', handleRoomMouseUp);
    roomCanvas.addEventListener('mouseleave', handleRoomMouseUp);

    // Room controls
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    previewRoomBtn.addEventListener('click', togglePreviewMode);
    clearRoomBtn.addEventListener('click', clearRoom);
    saveRoomBtn.addEventListener('click', saveRoomData);
    loadRoomBtn.addEventListener('click', () => loadFileInput.click());
    loadFileInput.addEventListener('change', loadRoomData);

    // Export controls
    showExportBtn.addEventListener('click', () => {
        exportPanel.classList.add('visible');
        generateExports();
    });
    closeExportBtn.addEventListener('click', () => exportPanel.classList.remove('visible'));
    exportSpritemap.addEventListener('click', () => downloadFile('spriteMap.ts', exportSpritemapOutput.textContent));
    exportLayout.addEventListener('click', () => downloadFile('apartmentLayout.ts', exportLayoutOutput.textContent));
    exportAll.addEventListener('click', exportAllFiles);
    copySpritemap.addEventListener('click', () => copyToClipboard(exportSpritemapOutput.textContent, copySpritemap));
    copyLayout.addEventListener('click', () => copyToClipboard(exportLayoutOutput.textContent, copyLayout));

    // Export tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const tabName = e.target.dataset.tab;
            exportSpritemapOutput.style.display = tabName === 'spritemap' ? 'block' : 'none';
            exportLayoutOutput.style.display = tabName === 'layout' ? 'block' : 'none';
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Auto-save on changes
    window.addEventListener('beforeunload', saveToLocalStorage);
}

// ============================================================================
// SPRITE SHEET SELECTION (Preserved original functionality)
// ============================================================================

function loadSpriteSheet(sheetKey) {
    const sheet = SHEETS[sheetKey];
    spriteImage.src = sheet.path;

    spriteImage.onload = () => {
        // Cache the loaded image
        spriteSheetImages[sheetKey] = spriteImage.cloneNode();
        applySheetZoom();
    };
}

function applySheetZoom() {
    const sheet = SHEETS[currentSheet];
    const scaledWidth = sheet.width * sheetZoom;
    const scaledHeight = sheet.height * sheetZoom;

    spriteImage.width = scaledWidth;
    spriteImage.height = scaledHeight;

    gridOverlay.width = scaledWidth;
    gridOverlay.height = scaledHeight;

    selectionOverlay.width = scaledWidth;
    selectionOverlay.height = scaledHeight;

    drawSheetGrid();
    updateSheetSelection();
}

function drawSheetGrid() {
    const sheet = SHEETS[currentSheet];
    const ctx = gridOverlay.getContext('2d');
    ctx.clearRect(0, 0, gridOverlay.width, gridOverlay.height);

    const scaledTileSize = TILE_SIZE * sheetZoom;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 1;

    for (let col = 0; col <= sheet.cols; col++) {
        const x = col * scaledTileSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gridOverlay.height);
        ctx.stroke();
    }

    for (let row = 0; row <= sheet.rows; row++) {
        const y = row * scaledTileSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gridOverlay.width, y);
        ctx.stroke();
    }

    // Draw labels
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = '12px monospace';

    for (let col = 0; col < sheet.cols; col += 2) {
        const x = col * scaledTileSize + 4;
        ctx.fillText(col, x, 14);
    }

    for (let row = 0; row < sheet.rows; row += 5) {
        const y = row * scaledTileSize + 14;
        ctx.fillText(row, 4, y);
    }
}

function handleSheetMouseDown(e) {
    const rect = spriteViewer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridPos = pixelToSheetGrid(x, y);
    if (!gridPos) return;

    isDraggingSheet = true;
    dragStart = gridPos;
    selection = { ...gridPos, ...gridPos };
    updateSheetSelectionDisplay();
}

function handleSheetMouseMove(e) {
    if (!isDraggingSheet) return;

    const rect = spriteViewer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridPos = pixelToSheetGrid(x, y);
    if (!gridPos) return;

    selection = {
        col: Math.min(dragStart.col, gridPos.col),
        row: Math.min(dragStart.row, gridPos.row),
        endCol: Math.max(dragStart.col, gridPos.col),
        endRow: Math.max(dragStart.row, gridPos.row)
    };

    updateSheetSelectionDisplay();
}

function handleSheetMouseUp() {
    if (isDraggingSheet) {
        isDraggingSheet = false;
        updateSheetSelectionDisplay();
    }
}

function pixelToSheetGrid(px, py) {
    const sheet = SHEETS[currentSheet];
    const scaledTileSize = TILE_SIZE * sheetZoom;

    const col = Math.floor(px / scaledTileSize);
    const row = Math.floor(py / scaledTileSize);

    if (col < 0 || col >= sheet.cols || row < 0 || row >= sheet.rows) {
        return null;
    }

    return { col, row };
}

function updateSheetSelectionDisplay() {
    updateSheetSelection();
    updateSelectionInfo();
}

function updateSheetSelection() {
    const ctx = selectionOverlay.getContext('2d');
    ctx.clearRect(0, 0, selectionOverlay.width, selectionOverlay.height);

    if (!selection) return;

    const scaledTileSize = TILE_SIZE * sheetZoom;
    const x = selection.col * scaledTileSize;
    const y = selection.row * scaledTileSize;
    const width = (selection.endCol - selection.col + 1) * scaledTileSize;
    const height = (selection.endRow - selection.row + 1) * scaledTileSize;

    ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = 'rgba(52, 152, 219, 1)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
}

function updateSelectionInfo() {
    const infoCols = document.getElementById('info-cols');
    const infoRows = document.getElementById('info-rows');
    const infoSize = document.getElementById('info-size');
    const infoPixels = document.getElementById('info-pixels');

    if (!selection) {
        infoCols.textContent = '—';
        infoRows.textContent = '—';
        infoSize.textContent = '—';
        infoPixels.textContent = '—';
        return;
    }

    const width = selection.endCol - selection.col + 1;
    const height = selection.endRow - selection.row + 1;
    const pixelWidth = width * TILE_SIZE;
    const pixelHeight = height * TILE_SIZE;

    infoCols.textContent = `${selection.col}–${selection.endCol}`;
    infoRows.textContent = `${selection.row}–${selection.endRow}`;
    infoSize.textContent = `${width} × ${height} tiles`;
    infoPixels.textContent = `${pixelWidth} × ${pixelHeight} px`;
}

function clearSheetSelection() {
    selection = null;
    isDraggingSheet = false;
    dragStart = null;
    updateSheetSelectionDisplay();
}

function addSpriteFromSelection() {
    const name = spriteNameInput.value.trim();

    if (!name) {
        alert('Please enter a name for the sprite');
        return;
    }

    if (!selection) {
        alert('Please select a region of the sprite sheet first');
        return;
    }

    const width = selection.endCol - selection.col + 1;
    const height = selection.endRow - selection.row + 1;

    // Check if sprite with this name already exists
    const existingIndex = sprites.findIndex(s => s.name === name);
    if (existingIndex !== -1) {
        if (!confirm(`A sprite named "${name}" already exists. Replace it?`)) {
            return;
        }
        sprites.splice(existingIndex, 1);
    }

    // Create sprite preview image
    const canvas = document.createElement('canvas');
    canvas.width = width * TILE_SIZE;
    canvas.height = height * TILE_SIZE;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = spriteImage.src;
    img.onload = () => {
        ctx.drawImage(
            img,
            selection.col * TILE_SIZE,
            selection.row * TILE_SIZE,
            width * TILE_SIZE,
            height * TILE_SIZE,
            0,
            0,
            width * TILE_SIZE,
            height * TILE_SIZE
        );

        const sprite = {
            name,
            sheet: currentSheet,
            col: selection.col,
            row: selection.row,
            width,
            height,
            preview: canvas.toDataURL()
        };

        sprites.push(sprite);
        updatePalette();
        clearSheetSelection();
        spriteNameInput.value = '';
        saveToLocalStorage();
    };
}

// ============================================================================
// SPRITE PALETTE
// ============================================================================

function updatePalette() {
    if (sprites.length === 0) {
        paletteGrid.innerHTML = '<div class="empty-state">No sprites in palette<br>Add sprites from the left panel</div>';
        return;
    }

    paletteGrid.innerHTML = sprites.map((sprite, index) => {
        const isSelected = selectedSprite && selectedSprite.name === sprite.name;
        return `
            <div class="palette-item ${isSelected ? 'selected' : ''}" data-sprite-index="${index}">
                <img src="${sprite.preview}" style="max-width: 80px; max-height: 80px;">
                <div class="palette-item-name">${sprite.name}</div>
                <div class="palette-item-size">${sprite.width} × ${sprite.height}</div>
            </div>
        `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.palette-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.spriteIndex);
            selectSpriteFromPalette(sprites[index]);
        });
    });
}

function selectSpriteFromPalette(sprite) {
    selectedSprite = sprite;
    updatePalette();

    // Auto-switch to place mode when selecting a sprite
    if (buildMode === 'select') {
        setBuildMode('place');
    }
}

// ============================================================================
// ROOM CANVAS
// ============================================================================

function initRoomCanvas() {
    updateRoomDimensions();
}

function updateRoomDimensions() {
    const cols = parseInt(roomColsInput.value);
    const rows = parseInt(roomRowsInput.value);

    if (cols < 10 || cols > 50 || rows < 10 || rows > 40) {
        alert('Invalid room dimensions. Width: 10-50, Height: 10-40');
        roomColsInput.value = roomConfig.cols;
        roomRowsInput.value = roomConfig.rows;
        return;
    }

    roomConfig = { cols, rows };
    renderRoom();
    updateRoomStats();
    saveToLocalStorage();
}

function renderRoom() {
    const width = roomConfig.cols * TILE_SIZE;
    const height = roomConfig.rows * TILE_SIZE;

    roomCanvas.width = width;
    roomCanvas.height = height;
    roomCanvas.style.width = `${width * canvasZoom}px`;
    roomCanvas.style.height = `${height * canvasZoom}px`;

    const ctx = roomCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, width, height);

    // Draw grid (if not in preview mode)
    if (!previewMode) {
        drawRoomGrid(ctx);
    }

    // Sort objects by z-index
    const sortedObjects = [...placedObjects].sort((a, b) => a.zIndex - b.zIndex);

    // Draw all placed objects
    sortedObjects.forEach(obj => {
        drawPlacedObject(ctx, obj);
    });

    // Draw selection highlight
    if (selectedObject && !previewMode) {
        drawObjectSelection(ctx, selectedObject);
    }
}

function drawRoomGrid(ctx) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let col = 0; col <= roomConfig.cols; col++) {
        const x = col * TILE_SIZE;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, roomConfig.rows * TILE_SIZE);
        ctx.stroke();
    }

    // Horizontal lines
    for (let row = 0; row <= roomConfig.rows; row++) {
        const y = row * TILE_SIZE;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(roomConfig.cols * TILE_SIZE, y);
        ctx.stroke();
    }
}

function drawPlacedObject(ctx, obj) {
    const sprite = sprites.find(s => s.name === obj.sprite);
    if (!sprite) return;

    const sheetImage = spriteSheetImages[sprite.sheet];
    if (!sheetImage) return;

    const sourceX = sprite.col * TILE_SIZE;
    const sourceY = sprite.row * TILE_SIZE;
    const sourceWidth = sprite.width * TILE_SIZE;
    const sourceHeight = sprite.height * TILE_SIZE;

    const destX = obj.x * TILE_SIZE;
    const destY = obj.y * TILE_SIZE;
    const destWidth = sprite.width * TILE_SIZE;
    const destHeight = sprite.height * TILE_SIZE;

    ctx.drawImage(
        sheetImage,
        sourceX, sourceY, sourceWidth, sourceHeight,
        destX, destY, destWidth, destHeight
    );
}

function drawObjectSelection(ctx, obj) {
    const sprite = sprites.find(s => s.name === obj.sprite);
    if (!sprite) return;

    const x = obj.x * TILE_SIZE;
    const y = obj.y * TILE_SIZE;
    const width = sprite.width * TILE_SIZE;
    const height = sprite.height * TILE_SIZE;

    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = 'rgba(243, 156, 18, 0.2)';
    ctx.fillRect(x, y, width, height);
}

// ============================================================================
// ROOM CANVAS INTERACTION
// ============================================================================

function handleRoomMouseDown(e) {
    const pos = getRoomCanvasPosition(e);
    if (!pos) return;

    if (buildMode === 'select') {
        handleSelectMode(pos, e);
    } else if (buildMode === 'place') {
        handlePlaceMode(pos);
    } else if (buildMode === 'paint') {
        handlePaintMode(pos);
        isPainting = true;
    }
}

function handleRoomMouseMove(e) {
    const pos = getRoomCanvasPosition(e);
    if (!pos) return;

    if (buildMode === 'select' && isDraggingObject) {
        handleDragObject(pos);
    } else if (buildMode === 'paint' && isPainting) {
        handlePaintMode(pos);
    }
}

function handleRoomMouseUp(e) {
    if (isDraggingObject) {
        isDraggingObject = false;
        addToHistory();
    }
    isPainting = false;
}

function getRoomCanvasPosition(e) {
    const rect = roomCanvas.getBoundingClientRect();
    const scaleX = roomCanvas.width / rect.width;
    const scaleY = roomCanvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);

    if (col < 0 || col >= roomConfig.cols || row < 0 || row >= roomConfig.rows) {
        return null;
    }

    return { col, row, x, y };
}

function handleSelectMode(pos, e) {
    // Check if clicking on an existing object
    const clickedObject = findObjectAtPosition(pos.col, pos.row);

    if (clickedObject) {
        selectedObject = clickedObject;
        const sprite = sprites.find(s => s.name === clickedObject.sprite);
        if (sprite) {
            // Calculate drag offset
            dragOffset = {
                x: pos.col - clickedObject.x,
                y: pos.row - clickedObject.y
            };
            isDraggingObject = true;
        }
    } else {
        selectedObject = null;
    }

    updateObjectsList();
    updateObjectProperties();
    renderRoom();
}

function handleDragObject(pos) {
    if (!selectedObject) return;

    const sprite = sprites.find(s => s.name === selectedObject.sprite);
    if (!sprite) return;

    // Calculate new position with offset
    let newX = pos.col - dragOffset.x;
    let newY = pos.row - dragOffset.y;

    // Clamp to room bounds
    newX = Math.max(0, Math.min(roomConfig.cols - sprite.width, newX));
    newY = Math.max(0, Math.min(roomConfig.rows - sprite.height, newY));

    selectedObject.x = newX;
    selectedObject.y = newY;

    renderRoom();
    updateObjectProperties();
    saveToLocalStorage();
}

function handlePlaceMode(pos) {
    if (!selectedSprite) {
        alert('Please select a sprite from the palette first');
        return;
    }

    // Check if placement is valid
    if (pos.col + selectedSprite.width > roomConfig.cols ||
        pos.row + selectedSprite.height > roomConfig.rows) {
        alert('Object doesn\'t fit here');
        return;
    }

    const newObject = {
        id: `${selectedSprite.name}-${nextObjectId++}`,
        sprite: selectedSprite.name,
        x: pos.col,
        y: pos.row,
        zIndex: placedObjects.length * 10
    };

    placedObjects.push(newObject);
    addToHistory();
    renderRoom();
    updateObjectsList();
    updateRoomStats();
    saveToLocalStorage();
}

function handlePaintMode(pos) {
    if (!selectedSprite) {
        alert('Please select a sprite from the palette first');
        return;
    }

    // Only allow painting with 1×1 sprites
    if (selectedSprite.width !== 1 || selectedSprite.height !== 1) {
        alert('Paint mode only works with 1×1 tiles (like floor or wall)');
        return;
    }

    // Check if there's already an object at this position with the same sprite
    const existing = placedObjects.find(obj =>
        obj.sprite === selectedSprite.name && obj.x === pos.col && obj.y === pos.row
    );

    if (existing) return; // Don't paint over the same sprite

    const newObject = {
        id: `${selectedSprite.name}-${nextObjectId++}`,
        sprite: selectedSprite.name,
        x: pos.col,
        y: pos.row,
        zIndex: 0 // Paint mode objects go to the back
    };

    placedObjects.push(newObject);
    renderRoom();
    updateObjectsList();
    updateRoomStats();
    saveToLocalStorage();
}

function findObjectAtPosition(col, row) {
    // Find topmost object at this position (reverse order by z-index)
    const sorted = [...placedObjects].sort((a, b) => b.zIndex - a.zIndex);

    for (const obj of sorted) {
        const sprite = sprites.find(s => s.name === obj.sprite);
        if (!sprite) continue;

        if (col >= obj.x && col < obj.x + sprite.width &&
            row >= obj.y && row < obj.y + sprite.height) {
            return obj;
        }
    }

    return null;
}

// ============================================================================
// BUILD MODE
// ============================================================================

function setBuildMode(mode) {
    buildMode = mode;

    modeSelectBtn.classList.toggle('active', mode === 'select');
    modePlaceBtn.classList.toggle('active', mode === 'place');
    modePaintBtn.classList.toggle('active', mode === 'paint');

    // Clear selections when switching modes
    if (mode !== 'select') {
        selectedObject = null;
        updateObjectProperties();
    }

    renderRoom();
}

// ============================================================================
// PLACED OBJECTS LIST
// ============================================================================

function updateObjectsList() {
    objectCount.textContent = placedObjects.length;

    if (placedObjects.length === 0) {
        placedObjectsList.innerHTML = '<div class="empty-state">No objects placed<br>Select a sprite and click on the canvas</div>';
        return;
    }

    placedObjectsList.innerHTML = placedObjects.map(obj => {
        const sprite = sprites.find(s => s.name === obj.sprite);
        const isSelected = selectedObject && selectedObject.id === obj.id;

        return `
            <div class="placed-object-item ${isSelected ? 'selected' : ''}" data-object-id="${obj.id}">
                <div class="object-header">
                    <span class="object-name">${obj.id}</span>
                </div>
                <div class="object-details">
                    Sprite: ${obj.sprite}<br>
                    Position: (${obj.x}, ${obj.y})<br>
                    Z-Index: ${obj.zIndex}
                </div>
                <div class="object-actions">
                    <button class="secondary" onclick="selectObjectById('${obj.id}')">Select</button>
                    <button class="secondary" onclick="duplicateObject('${obj.id}')">Duplicate</button>
                    <button class="danger" onclick="deleteObject('${obj.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function selectObjectById(id) {
    selectedObject = placedObjects.find(obj => obj.id === id);
    setBuildMode('select');
    updateObjectsList();
    updateObjectProperties();
    renderRoom();
}

function duplicateObject(id) {
    const obj = placedObjects.find(o => o.id === id);
    if (!obj) return;

    const sprite = sprites.find(s => s.name === obj.sprite);
    if (!sprite) return;

    const newObject = {
        ...obj,
        id: `${obj.sprite}-${nextObjectId++}`,
        x: Math.min(obj.x + 1, roomConfig.cols - sprite.width),
        y: Math.min(obj.y + 1, roomConfig.rows - sprite.height),
        zIndex: obj.zIndex + 1
    };

    placedObjects.push(newObject);
    selectedObject = newObject;

    addToHistory();
    renderRoom();
    updateObjectsList();
    updateObjectProperties();
    updateRoomStats();
    saveToLocalStorage();
}

function deleteObject(id) {
    if (!confirm('Delete this object?')) return;

    const index = placedObjects.findIndex(obj => obj.id === id);
    if (index !== -1) {
        placedObjects.splice(index, 1);

        if (selectedObject && selectedObject.id === id) {
            selectedObject = null;
        }

        addToHistory();
        renderRoom();
        updateObjectsList();
        updateObjectProperties();
        updateRoomStats();
        saveToLocalStorage();
    }
}

// ============================================================================
// OBJECT PROPERTIES
// ============================================================================

function updateObjectProperties() {
    if (!selectedObject) {
        objectProperties.innerHTML = '<div class="empty-state" style="padding: 20px;">Select an object to edit</div>';
        return;
    }

    const sprite = sprites.find(s => s.name === selectedObject.sprite);
    if (!sprite) return;

    objectProperties.innerHTML = `
        <div class="property-item">
            <div class="property-label">Object ID</div>
            <div class="property-value">${selectedObject.id}</div>
        </div>

        <div class="property-item">
            <div class="property-label">Sprite</div>
            <div class="property-value">${selectedObject.sprite}</div>
        </div>

        <div class="property-item">
            <div class="property-label">Position (X, Y)</div>
            <div class="property-value">(${selectedObject.x}, ${selectedObject.y})</div>
        </div>

        <div class="property-item">
            <div class="property-label">Size</div>
            <div class="property-value">${sprite.width} × ${sprite.height} tiles</div>
        </div>

        <div class="property-item">
            <div class="property-label">Z-Index</div>
            <div class="property-value">${selectedObject.zIndex}</div>
            <div class="property-controls">
                <button class="secondary" onclick="adjustZIndex('front')">To Front</button>
                <button class="secondary" onclick="adjustZIndex('forward')">Forward</button>
                <button class="secondary" onclick="adjustZIndex('backward')">Backward</button>
                <button class="secondary" onclick="adjustZIndex('back')">To Back</button>
            </div>
        </div>

        <div class="property-item">
            <button class="danger" onclick="deleteObject('${selectedObject.id}')" style="width: 100%;">Delete Object</button>
        </div>
    `;
}

function adjustZIndex(action) {
    if (!selectedObject) return;

    const maxZ = Math.max(...placedObjects.map(o => o.zIndex), 0);
    const minZ = Math.min(...placedObjects.map(o => o.zIndex), 0);

    switch (action) {
        case 'front':
            selectedObject.zIndex = maxZ + 10;
            break;
        case 'forward':
            selectedObject.zIndex += 11;
            break;
        case 'backward':
            selectedObject.zIndex -= 11;
            break;
        case 'back':
            selectedObject.zIndex = minZ - 10;
            break;
    }

    addToHistory();
    renderRoom();
    updateObjectProperties();
    updateObjectsList();
    saveToLocalStorage();
}

// ============================================================================
// UNDO/REDO
// ============================================================================

function addToHistory() {
    // Remove any redo history when new action is performed
    history = history.slice(0, historyIndex + 1);

    // Add current state to history
    const state = {
        placedObjects: JSON.parse(JSON.stringify(placedObjects)),
        nextObjectId
    };

    history.push(state);
    historyIndex++;

    // Limit history size
    if (history.length > maxHistory) {
        history.shift();
        historyIndex--;
    }

    updateUndoRedoButtons();
}

function undo() {
    if (historyIndex <= 0) return;

    historyIndex--;
    const state = history[historyIndex];

    placedObjects = JSON.parse(JSON.stringify(state.placedObjects));
    nextObjectId = state.nextObjectId;

    renderRoom();
    updateObjectsList();
    updateObjectProperties();
    updateRoomStats();
    updateUndoRedoButtons();
    saveToLocalStorage();
}

function redo() {
    if (historyIndex >= history.length - 1) return;

    historyIndex++;
    const state = history[historyIndex];

    placedObjects = JSON.parse(JSON.stringify(state.placedObjects));
    nextObjectId = state.nextObjectId;

    renderRoom();
    updateObjectsList();
    updateObjectProperties();
    updateRoomStats();
    updateUndoRedoButtons();
    saveToLocalStorage();
}

function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
}

// ============================================================================
// ROOM CONTROLS
// ============================================================================

function togglePreviewMode() {
    previewMode = !previewMode;
    previewRoomBtn.textContent = previewMode ? 'Edit Mode' : 'Preview';
    renderRoom();
}

function clearRoom() {
    if (placedObjects.length === 0) return;

    if (!confirm(`Clear all ${placedObjects.length} objects from the room? This cannot be undone.`)) {
        return;
    }

    placedObjects = [];
    selectedObject = null;

    addToHistory();
    renderRoom();
    updateObjectsList();
    updateObjectProperties();
    updateRoomStats();
    saveToLocalStorage();
}

function updateRoomStats() {
    roomDimensions.textContent = `Room: ${roomConfig.cols} × ${roomConfig.rows} tiles (${roomConfig.cols * TILE_SIZE} × ${roomConfig.rows * TILE_SIZE} px)`;
    placedCountSpan.textContent = `Objects: ${placedObjects.length}`;

    if (selectedObject) {
        selectedInfoSpan.textContent = `Selected: ${selectedObject.id}`;
    } else {
        selectedInfoSpan.textContent = 'No selection';
    }
}

// ============================================================================
// SAVE/LOAD
// ============================================================================

function saveRoomData() {
    const data = {
        version: 1,
        roomConfig,
        sprites,
        placedObjects,
        nextObjectId
    };

    const json = JSON.stringify(data, null, 2);
    downloadFile('room-data.json', json);
}

function loadRoomData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);

            if (!data.version || !data.roomConfig || !data.sprites || !data.placedObjects) {
                throw new Error('Invalid room data file');
            }

            roomConfig = data.roomConfig;
            sprites = data.sprites;
            placedObjects = data.placedObjects;
            nextObjectId = data.nextObjectId || 1;

            roomColsInput.value = roomConfig.cols;
            roomRowsInput.value = roomConfig.rows;

            // Reload sprite sheet images
            Object.keys(SHEETS).forEach(sheetKey => {
                const img = new Image();
                img.src = SHEETS[sheetKey].path;
                img.onload = () => {
                    spriteSheetImages[sheetKey] = img;
                    renderRoom();
                };
            });

            updatePalette();
            updateObjectsList();
            updateRoomStats();
            addToHistory();
            saveToLocalStorage();

            alert('Room data loaded successfully!');
        } catch (error) {
            alert('Error loading room data: ' + error.message);
        }
    };

    reader.readAsText(file);
    e.target.value = ''; // Reset file input
}

function saveToLocalStorage() {
    try {
        const data = {
            sprites,
            placedObjects,
            roomConfig,
            nextObjectId
        };
        localStorage.setItem('wattwiseRoomBuilder', JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('wattwiseRoomBuilder');
        if (!saved) return;

        const data = JSON.parse(saved);
        sprites = data.sprites || [];
        placedObjects = data.placedObjects || [];
        roomConfig = data.roomConfig || { cols: 24, rows: 18 };
        nextObjectId = data.nextObjectId || 1;

        roomColsInput.value = roomConfig.cols;
        roomRowsInput.value = roomConfig.rows;

        updatePalette();
        updateObjectsList();
        renderRoom();
        updateRoomStats();
        addToHistory();
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
    }
}

// ============================================================================
// EXPORT
// ============================================================================

function validateRoom() {
    const errors = [];

    // Check if any sprites exist
    if (sprites.length === 0) {
        errors.push('No sprites defined. Add at least one sprite from the sprite sheet.');
    }

    // Check each placed object
    placedObjects.forEach(obj => {
        const sprite = sprites.find(s => s.name === obj.sprite);

        if (!sprite) {
            errors.push(`Object "${obj.id}" references undefined sprite "${obj.sprite}"`);
            return;
        }

        // Check bounds
        if (obj.x < 0 || obj.y < 0) {
            errors.push(`Object "${obj.id}" has negative position (${obj.x}, ${obj.y})`);
        }

        if (obj.x + sprite.width > roomConfig.cols) {
            errors.push(`Object "${obj.id}" extends beyond room width`);
        }

        if (obj.y + sprite.height > roomConfig.rows) {
            errors.push(`Object "${obj.id}" extends beyond room height`);
        }

        // Check for invalid values
        if (!Number.isInteger(obj.x) || !Number.isInteger(obj.y)) {
            errors.push(`Object "${obj.id}" has non-integer position`);
        }

        if (!Number.isFinite(obj.zIndex)) {
            errors.push(`Object "${obj.id}" has invalid z-index`);
        }
    });

    // Check room dimensions
    if (!Number.isInteger(roomConfig.cols) || !Number.isInteger(roomConfig.rows)) {
        errors.push('Room dimensions must be integers');
    }

    if (roomConfig.cols < 10 || roomConfig.cols > 50) {
        errors.push('Room width must be between 10 and 50');
    }

    if (roomConfig.rows < 10 || roomConfig.rows > 40) {
        errors.push('Room height must be between 10 and 40');
    }

    return errors;
}

function generateExports() {
    const errors = validateRoom();

    if (errors.length > 0) {
        validationErrors.classList.add('visible');
        errorList.innerHTML = errors.map(err => `<li>${err}</li>`).join('');
        exportSpritemapOutput.textContent = '// Fix validation errors before exporting';
        exportLayoutOutput.textContent = '// Fix validation errors before exporting';
        return;
    }

    validationErrors.classList.remove('visible');
    exportSpritemapOutput.textContent = generateSpriteMapTS();
    exportLayoutOutput.textContent = generateApartmentLayoutTS();
}

function generateSpriteMapTS() {
    const lines = [
        '/**',
        ' * Sprite definitions for WattWise apartment',
        ' * Generated by Lane B Room Builder',
        ` * ${new Date().toISOString()}`,
        ' *',
        ' * All coordinates are zero-based (col, row)',
        ' * Each sprite defines its source location in the sprite sheet',
        ' */',
        '',
        'export interface SpriteDefinition {',
        '  sheet: "interiors" | "roomBuilder";',
        '  col: number;',
        '  row: number;',
        '  width: number;  // in tiles (32px each)',
        '  height: number; // in tiles (32px each)',
        '}',
        '',
        'export const TILE_SIZE = 32;',
        '',
        '// Sprite sheet paths relative to public/assets/',
        'export const SPRITE_SHEETS = {',
        '  interiors: "interior/32x32/Interiors_free_32x32.png",',
        '  roomBuilder: "interior/32x32/Room_Builder_free_32x32.png",',
        '} as const;',
        '',
        'export const spriteMap: Record<string, SpriteDefinition> = {',
    ];

    sprites.forEach((sprite, index) => {
        const sheetName = sprite.sheet === 'interiors' ? 'interiors' : 'roomBuilder';
        lines.push(`  ${sprite.name}: {`);
        lines.push(`    sheet: "${sheetName}",`);
        lines.push(`    col: ${sprite.col},`);
        lines.push(`    row: ${sprite.row},`);
        lines.push(`    width: ${sprite.width},`);
        lines.push(`    height: ${sprite.height},`);
        lines.push(`  }${index < sprites.length - 1 ? ',' : ''}`);
    });

    lines.push('};');
    lines.push('');
    lines.push('export type SpriteName = keyof typeof spriteMap;');

    return lines.join('\n');
}

function generateApartmentLayoutTS() {
    const lines = [
        '/**',
        ' * Apartment layout configuration for WattWise',
        ' * Generated by Lane B Room Builder',
        ` * ${new Date().toISOString()}`,
        ' *',
        ' * This file defines the exact placement of all objects in the apartment',
        ' * Import and render using ApartmentRoom.tsx',
        ' */',
        '',
        'import { SpriteName } from "./spriteMap";',
        '',
        'export interface PlacedObject {',
        '  id: string;',
        '  sprite: SpriteName;',
        '  x: number;      // tile column position',
        '  y: number;      // tile row position',
        '  zIndex: number; // rendering order (higher = front)',
        '}',
        '',
        'export interface ApartmentLayout {',
        '  cols: number;   // room width in tiles',
        '  rows: number;   // room height in tiles',
        '  objects: PlacedObject[];',
        '}',
        '',
        'export const apartmentLayout: ApartmentLayout = {',
        `  cols: ${roomConfig.cols},`,
        `  rows: ${roomConfig.rows},`,
        '  objects: [',
    ];

    placedObjects.forEach((obj, index) => {
        lines.push('    {');
        lines.push(`      id: "${obj.id}",`);
        lines.push(`      sprite: "${obj.sprite}",`);
        lines.push(`      x: ${obj.x},`);
        lines.push(`      y: ${obj.y},`);
        lines.push(`      zIndex: ${obj.zIndex},`);
        lines.push(`    }${index < placedObjects.length - 1 ? ',' : ''}`);
    });

    lines.push('  ],');
    lines.push('};');

    return lines.join('\n');
}

function exportAllFiles() {
    const errors = validateRoom();
    if (errors.length > 0) {
        alert('Please fix validation errors before exporting');
        return;
    }

    downloadFile('spriteMap.ts', generateSpriteMapTS());
    setTimeout(() => {
        downloadFile('apartmentLayout.ts', generateApartmentLayoutTS());
    }, 100);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

function handleKeyboard(e) {
    // Delete selected object
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObject && buildMode === 'select') {
        e.preventDefault();
        deleteObject(selectedObject.id);
    }

    // Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
    }
}

function updateUI() {
    updatePalette();
    updateObjectsList();
    updateObjectProperties();
    updateRoomStats();
    updateUndoRedoButtons();
}

// Make functions globally accessible for onclick handlers
window.selectObjectById = selectObjectById;
window.duplicateObject = duplicateObject;
window.deleteObject = deleteObject;
window.adjustZIndex = adjustZIndex;

// ============================================================================
// START THE APPLICATION
// ============================================================================

init();
