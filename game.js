class ChineseIdiomGame {
    constructor() {
        this.grid = [];
        this.positions = new Map();
        this.solution = new Map();
        this.selectedCell = null;
        this.idioms = [];
    }

    async loadIdioms() {
        try {
            const response = await fetch('/Users/liujinliang/workspace/trae_code/chinese-xinhua/data/idiom.json');
            this.idioms = await response.json();
        } catch (error) {
            console.error('加载成语失败:', error);
            // 使用一些示例成语作为备选
            this.idioms = [
                { "word": "望梅止渴" },
                { "word": "一帆风顺" },
                { "word": "顺水推舟" },
                { "word": "舟车劳顿" },
                { "word": "顿开茅塞" },
                { "word": "塞翁失马" },
                { "word": "马到成功" },
                { "word": "功亏一篑" },
                { "word": "篑而不舍" },
                { "word": "舍本逐末" },
                { "word": "末日穷途" },
                { "word": "途穷日暮" }, 
                // ... 可以添加更多示例成语
            ];
        }
    }

    async setupGame(numIdioms) {
        if (this.idioms.length === 0) {
            await this.loadIdioms();
        }

        // 增加网格大小以适应更多成语
        const maxSize = Math.ceil(Math.sqrt(numIdioms * 16));  // 调整网格大小计算方式
        this.grid = Array(maxSize).fill().map(() => Array(maxSize).fill(''));
        
        const selectedIdioms = this.getRandomIdioms(numIdioms);
        const center = Math.floor(maxSize / 2);

        // 放置第一个成语在中心位置（横向）
        const firstIdiom = selectedIdioms[0].word;
        for (let i = 0; i < firstIdiom.length; i++) {
            this.grid[center][center + i] = firstIdiom[i];
            this.positions.set(`${center},${center + i}`, firstIdiom[i]);
        }

        // 优化放置算法，确保横向和纵向都有成语
        const placedIdioms = [firstIdiom];
        let isHorizontal = false; // 用于交替横向和纵向放置

        for (let i = 1; i < selectedIdioms.length; i++) {
            const idiom = selectedIdioms[i].word;
            if (this.placeIdiomWithDirection(idiom, placedIdioms, isHorizontal)) {
                placedIdioms.push(idiom);
                isHorizontal = !isHorizontal; // 交替放置方向
            } else if (this.placeIdiomWithDirection(idiom, placedIdioms, !isHorizontal)) {
                // 如果首选方向失败，尝试另一个方向
                placedIdioms.push(idiom);
                isHorizontal = !isHorizontal;
            }
        }

        this.solution = new Map(this.positions);
        this.trimGrid();
        this.removeRandomChars(0.4); // 增加空格比例使游戏更有挑战性
        return this.renderGrid();
    }

    getRandomIdioms(count) {
        const shuffled = [...this.idioms].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    placeIdiomWithDirection(idiom, placedIdioms, preferHorizontal) {
        // 为每个已放置的成语尝试连接点
        for (const placed of placedIdioms) {
            for (const char of idiom) {
                if (placed.includes(char)) {
                    // 根据偏好方向优先尝试放置
                    if (preferHorizontal) {
                        if (this.tryPlaceHorizontal(idiom, char) || 
                            this.tryPlaceVertical(idiom, char)) {
                            return true;
                        }
                    } else {
                        if (this.tryPlaceVertical(idiom, char) || 
                            this.tryPlaceHorizontal(idiom, char)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    tryPlaceHorizontal(idiom, char) {
        const positions = this.findCharPositions(char);
        for (const [row, col] of positions) {
            if (this.canPlaceHorizontal(idiom, row, col)) {
                const idx = idiom.indexOf(char);
                const startCol = col - idx;
                
                // 检查是否能形成交叉
                let hasCross = false;
                for (let i = 0; i < idiom.length; i++) {
                    if (i !== idx && this.hasVerticalConnection(row, startCol + i)) {
                        hasCross = true;
                        break;
                    }
                }
                
                if (hasCross || positions.length === 0) {
                    // 放置成语
                    for (let i = 0; i < idiom.length; i++) {
                        this.grid[row][startCol + i] = idiom[i];
                        this.positions.set(`${row},${startCol + i}`, idiom[i]);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    tryPlaceVertical(idiom, char) {
        const positions = this.findCharPositions(char);
        for (const [row, col] of positions) {
            if (this.canPlaceVertical(idiom, row, col)) {
                const idx = idiom.indexOf(char);
                const startRow = row - idx;
                
                // 检查是否能形成交叉
                let hasCross = false;
                for (let i = 0; i < idiom.length; i++) {
                    if (i !== idx && this.hasHorizontalConnection(startRow + i, col)) {
                        hasCross = true;
                        break;
                    }
                }
                
                if (hasCross || positions.length === 0) {
                    // 放置成语
                    for (let i = 0; i < idiom.length; i++) {
                        this.grid[startRow + i][col] = idiom[i];
                        this.positions.set(`${startRow + i},${col}`, idiom[i]);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    findCharPositions(char) {
        const positions = [];
        this.positions.forEach((value, key) => {
            if (value === char) {
                const [row, col] = key.split(',').map(Number);
                positions.push([row, col]);
            }
        });
        return positions;
    }

    hasVerticalConnection(row, col) {
        return (this.grid[row - 1]?.[col] || this.grid[row + 1]?.[col]);
    }

    hasHorizontalConnection(row, col) {
        return (this.grid[row][col - 1] || this.grid[row][col + 1]);
    }

    trimGrid() {
        let minRow = this.grid.length, maxRow = 0;
        let minCol = this.grid[0].length, maxCol = 0;

        // 找到有字符的边界
        this.positions.forEach((_, key) => {
            const [row, col] = key.split(',').map(Number);
            minRow = Math.min(minRow, row);
            maxRow = Math.max(maxRow, row);
            minCol = Math.min(minCol, col);
            maxCol = Math.max(maxCol, col);
        });

        // 裁剪网格
        this.grid = this.grid
            .slice(minRow, maxRow + 1)
            .map(row => row.slice(minCol, maxCol + 1));

        // 更新位置
        const newPositions = new Map();
        this.positions.forEach((value, key) => {
            const [row, col] = key.split(',').map(Number);
            newPositions.set(`${row - minRow},${col - minCol}`, value);
        });
        this.positions = newPositions;

        const newSolution = new Map();
        this.solution.forEach((value, key) => {
            const [row, col] = key.split(',').map(Number);
            newSolution.set(`${row - minRow},${col - minCol}`, value);
        });
        this.solution = newSolution;
    }

    removeRandomChars(percentage = 0.3) {
        const positions = Array.from(this.positions.keys());
        const numToRemove = Math.floor(positions.length * percentage);
        const positionsToRemove = positions
            .sort(() => 0.5 - Math.random())
            .slice(0, numToRemove);

        for (const pos of positionsToRemove) {
            const [row, col] = pos.split(',').map(Number);
            this.grid[row][col] = '';
            this.positions.delete(pos);
        }
    }

    renderGrid() {
        return this.grid;
    }

    makeGuess(row, col, char) {
        const key = `${row},${col}`;
        if (this.solution.has(key) && this.solution.get(key) === char) {
            this.grid[row][col] = char;
            this.positions.set(key, char);
            return true;
        }
        return false;
    }

    isComplete() {
        return this.positions.size === this.solution.size;
    }
}

// 全局游戏实例
let game = new ChineseIdiomGame();
let selectedCell = null;

// 开始新游戏
async function startGame() {
    const numIdioms = parseInt(document.getElementById('idiomCount').value);
    game = new ChineseIdiomGame();
    const grid = await game.setupGame(numIdioms);
    renderGameGrid(grid);
    document.getElementById('message').textContent = '';
}

// 渲染游戏网格
function renderGameGrid(grid) {
    const container = document.getElementById('gridContainer');
    container.innerHTML = '';
    
    grid.forEach((row, i) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'grid-row';
        
        row.forEach((cell, j) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'grid-cell' + (cell ? '' : ' empty');
            cellDiv.textContent = cell;
            cellDiv.dataset.row = i;
            cellDiv.dataset.col = j;
            cellDiv.onclick = () => selectCell(cellDiv);
            rowDiv.appendChild(cellDiv);
        });
        
        container.appendChild(rowDiv);
    });
}

// 选择单元格
function selectCell(cell) {
    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    cell.classList.add('selected');
    selectedCell = cell;
    document.getElementById('charInput').focus();
}

// 提交字符
function submitChar() {
    if (!selectedCell) {
        document.getElementById('message').textContent = '请先选择一个格子！';
        return;
    }

    const char = document.getElementById('charInput').value;
    if (!char) {
        document.getElementById('message').textContent = '请输入一个汉字！';
        return;
    }

    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);

    if (game.makeGuess(row, col, char)) {
        selectedCell.textContent = char;
        selectedCell.classList.remove('empty');
        document.getElementById('message').textContent = '填写正确！';
        
        if (game.isComplete()) {
            document.getElementById('message').textContent = '恭喜你完成游戏！';
        }
    } else {
        document.getElementById('message').textContent = '填写错误，请重试！';
    }

    document.getElementById('charInput').value = '';
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    startGame();
});

/* 添加到index.html的style标签中 */
.game-container {
    max-width: 1200px;  /* 增加容器最大宽度 */
}

.grid-container {
    overflow-x: auto;   /* 添加横向滚动 */
    max-width: 100%;
    padding: 20px;
}

.grid-cell {
    width: 35px;        /* 稍微减小格子大小 */
    height: 35px;
    font-size: 18px;
    margin: 1px;        /* 减小间距 */
}

@media (max-width: 768px) {
    .grid-cell {
        width: 30px;    /* 移动设备上使用更小的格子 */
        height: 30px;
        font-size: 16px;
    }
} 