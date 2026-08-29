// Lane B Sprite Selector — WattWise
// Coordinate mapping tool for pixel art sprites

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

// State
let currentSheet = 'interiors';
let zoomLevel = 2;
let sprites = [];
let selection = null;
let isDragging = false;
let dragStart = null;

// DOM Elements
const sheetSelect = document.getElementById('sheet-select');
const spriteNameInput = document.getElementById('sprite-name');
const spriteImage = document.getElementById('sprite-image');
const gridOverlay = document.getElementById('grid-overlay');
const selectionOverlay = document.getElementById('selection-overlay');
const spriteViewer = document.getElementById('sprite-viewer');
const previewContainer = document.getElementById('preview-container');
const spritesList = document.getElementById('sprites-list');
const spriteCount = document.getElementById('sprite-count');
const sheetTitle = document.getElementById('sheet-title');
const exportOutput = document.getElementById('export-output');
const copyButton = document.getElementById('copy-output');

// Initialize
function init() {
    loadSpriteSheet(currentSheet);
    setupEventListeners();
}

function setupEventListeners() {
    // Sheet selection
    sheetSelect.addEventListener('change', (e) => {
        currentSheet = e.target.value;
        loadSpriteSheet(currentSheet);
        clearSelection();
    });

    // Zoom controls
    document.querySelectorAll('[data-zoom]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            zoomLevel = parseInt(e.target.dataset.zoom);
            applyZoom();
        });
    });

    // Mouse interaction
    spriteViewer.addEventListener('mousedown', handleMouseDown);
    spriteViewer.addEventListener('mousemove', handleMouseMove);
    spriteViewer.addEventListener('mouseup', handleMouseUp);
    spriteViewer.addEventListener('mouseleave', handleMouseUp);

    // Buttons
    document.getElementById('clear-selection').addEventListener('click', clearSelection);
    document.getElementById('add-sprite-btn').addEventListener('click', addSprite);
    document.getElementById('export-json').addEventListener('click', exportJSON);
    document.getElementById('export-typescript').addEventListener('click', exportTypeScript);
    document.getElementById('show-typescript').addEventListener('click', showTypeScriptPreview);
    document.getElementById('clear-all').addEventListener('click', clearAllSprites);
    copyButton.addEventListener('click', copyToClipboard);
}

function loadSpriteSheet(sheetKey) {
    const sheet = SHEETS[sheetKey];
    spriteImage.src = sheet.path;
    sheetTitle.textContent = `${sheet.name} — ${sheet.cols} columns × ${sheet.rows} rows`;

    spriteImage.onload = () => {
        applyZoom();
    };
}

function applyZoom() {
    const sheet = SHEETS[currentSheet];
    const scaledWidth = sheet.width * zoomLevel;
    const scaledHeight = sheet.height * zoomLevel;

    spriteImage.width = scaledWidth;
    spriteImage.height = scaledHeight;

    gridOverlay.width = scaledWidth;
    gridOverlay.height = scaledHeight;

    selectionOverlay.width = scaledWidth;
    selectionOverlay.height = scaledHeight;

    drawGrid();
    updateSelectionOverlay();
}

function drawGrid() {
    const sheet = SHEETS[currentSheet];
    const ctx = gridOverlay.getContext('2d');
    ctx.clearRect(0, 0, gridOverlay.width, gridOverlay.height);

    const scaledTileSize = TILE_SIZE * zoomLevel;

    // Draw vertical lines
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 1;

    for (let col = 0; col <= sheet.cols; col++) {
        const x = col * scaledTileSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gridOverlay.height);
        ctx.stroke();
    }

    // Draw horizontal lines
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

    // Column labels (every 2 columns to avoid clutter)
    for (let col = 0; col < sheet.cols; col += 2) {
        const x = col * scaledTileSize + 4;
        ctx.fillText(col, x, 14);
    }

    // Row labels (every 5 rows to avoid clutter)
    for (let row = 0; row < sheet.rows; row += 5) {
        const y = row * scaledTileSize + 14;
        ctx.fillText(row, 4, y);
    }
}

function handleMouseDown(e) {
    const rect = spriteViewer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridPos = pixelToGrid(x, y);
    if (!gridPos) return;

    isDragging = true;
    dragStart = gridPos;
    selection = { ...gridPos, ...gridPos };
    updateSelectionDisplay();
}

function handleMouseMove(e) {
    if (!isDragging) return;

    const rect = spriteViewer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridPos = pixelToGrid(x, y);
    if (!gridPos) return;

    // Update selection to encompass drag start and current position
    selection = {
        col: Math.min(dragStart.col, gridPos.col),
        row: Math.min(dragStart.row, gridPos.row),
        endCol: Math.max(dragStart.col, gridPos.col),
        endRow: Math.max(dragStart.row, gridPos.row)
    };

    updateSelectionDisplay();
}

function handleMouseUp(e) {
    if (isDragging && selection) {
        isDragging = false;
        updateSelectionDisplay();
    } else {
        isDragging = false;
    }
}

function pixelToGrid(px, py) {
    const sheet = SHEETS[currentSheet];
    const scaledTileSize = TILE_SIZE * zoomLevel;

    const col = Math.floor(px / scaledTileSize);
    const row = Math.floor(py / scaledTileSize);

    if (col < 0 || col >= sheet.cols || row < 0 || row >= sheet.rows) {
        return null;
    }

    return { col, row };
}

function updateSelectionDisplay() {
    updateSelectionOverlay();
    updateSelectionInfo();
    updatePreview();
}

function updateSelectionOverlay() {
    const ctx = selectionOverlay.getContext('2d');
    ctx.clearRect(0, 0, selectionOverlay.width, selectionOverlay.height);

    if (!selection) return;

    const scaledTileSize = TILE_SIZE * zoomLevel;
    const x = selection.col * scaledTileSize;
    const y = selection.row * scaledTileSize;
    const width = (selection.endCol - selection.col + 1) * scaledTileSize;
    const height = (selection.endRow - selection.row + 1) * scaledTileSize;

    // Draw selection rectangle
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
    const infoStart = document.getElementById('info-start');
    const infoEnd = document.getElementById('info-end');

    if (!selection) {
        infoCols.textContent = '—';
        infoRows.textContent = '—';
        infoSize.textContent = '—';
        infoPixels.textContent = '—';
        infoStart.textContent = '—';
        infoEnd.textContent = '—';
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
    infoStart.textContent = `(${selection.col}, ${selection.row})`;
    infoEnd.textContent = `(${selection.endCol}, ${selection.endRow})`;
}

function updatePreview() {
    if (!selection) {
        previewContainer.innerHTML = '<p class="preview-empty">No selection</p>';
        return;
    }

    const width = selection.endCol - selection.col + 1;
    const height = selection.endRow - selection.row + 1;

    // Create a canvas to extract the selected portion
    const canvas = document.createElement('canvas');
    canvas.width = width * TILE_SIZE;
    canvas.height = height * TILE_SIZE;

    const ctx = canvas.getContext('2d');

    // Draw the selected portion from the original image
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

        // Display in preview
        const previewImg = document.createElement('img');
        previewImg.src = canvas.toDataURL();
        previewImg.className = 'preview-image';
        previewImg.style.width = `${width * TILE_SIZE * 2}px`; // 2x scale for preview

        previewContainer.innerHTML = '';
        previewContainer.appendChild(previewImg);
    };
}

function clearSelection() {
    selection = null;
    isDragging = false;
    dragStart = null;
    updateSelectionDisplay();
}

function addSprite() {
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

    // Capture the preview image
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
        updateSpritesList();
        clearSelection();
        spriteNameInput.value = '';
    };
}

function updateSpritesList() {
    spriteCount.textContent = sprites.length;

    if (sprites.length === 0) {
        spritesList.innerHTML = '<div class="empty-state">No sprites added yet</div>';
        return;
    }

    spritesList.innerHTML = sprites.map((sprite, index) => `
        <div class="sprite-item">
            <div class="sprite-item-header">
                <span class="sprite-item-name">${sprite.name}</span>
                <button class="danger" onclick="deleteSprite(${index})" style="padding: 5px 10px; font-size: 11px;">Delete</button>
            </div>
            <div class="sprite-item-details">
                Sheet: ${SHEETS[sprite.sheet].name}<br>
                Column: ${sprite.col}, Row: ${sprite.row}<br>
                Size: ${sprite.width} × ${sprite.height} tiles (${sprite.width * TILE_SIZE} × ${sprite.height * TILE_SIZE} px)
            </div>
            <div class="sprite-item-preview">
                <img src="${sprite.preview}" style="width: ${sprite.width * TILE_SIZE * 2}px;">
            </div>
        </div>
    `).join('');
}

function deleteSprite(index) {
    if (confirm(`Delete sprite "${sprites[index].name}"?`)) {
        sprites.splice(index, 1);
        updateSpritesList();
    }
}

function clearAllSprites() {
    if (sprites.length === 0) return;

    if (confirm(`Clear all ${sprites.length} sprites? This cannot be undone.`)) {
        sprites = [];
        updateSpritesList();
    }
}

function exportJSON() {
    if (sprites.length === 0) {
        alert('No sprites to export');
        return;
    }

    const data = sprites.map(s => ({
        name: s.name,
        sheet: s.sheet,
        col: s.col,
        row: s.row,
        width: s.width,
        height: s.height
    }));

    const json = JSON.stringify(data, null, 2);
    downloadFile('sprite-map.json', json);
}

function exportTypeScript() {
    if (sprites.length === 0) {
        alert('No sprites to export');
        return;
    }

    const ts = generateTypeScript();
    downloadFile('spriteMap.ts', ts);
}

function showTypeScriptPreview() {
    if (sprites.length === 0) {
        alert('No sprites to export');
        return;
    }

    const ts = generateTypeScript();
    exportOutput.textContent = ts;
    exportOutput.classList.add('visible');
    copyButton.style.display = 'block';
}

function generateTypeScript() {
    const lines = [
        '/**',
        ' * Sprite map for WattWise apartment room',
        ' * Generated by Lane B Sprite Selector',
        ` * ${new Date().toISOString()}`,
        ' * All coordinates are zero-based (col, row)',
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

function copyToClipboard() {
    const text = exportOutput.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    });
}

// Initialize on load
init();
