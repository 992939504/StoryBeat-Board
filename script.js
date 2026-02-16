// StoryBeat Board - iOS 18 Style
// 故事演示板脚本

const STORAGE_KEY = 'storyboard_data';
const THEME_KEY = 'storyboard_theme';

// 数据结构
let data = [];
let currentEditingCard = null;
let pendingDeleteCallback = null;
let currentTheme = 'default';

// iOS 18 主题配置
const themes = {
    default: {
        name: '默认',
        bg: 'linear-gradient(180deg, #E8E8ED 0%, #F2F2F7 50%, #E8E8ED 100%)',
        rowBg: 'rgba(255, 255, 255, 0.72)',
        rowBorder: 'rgba(255, 255, 255, 0.5)',
        cardBg: '#FFFFFF',
        text: '#000000',
        textLight: '#000000',
        toolbarBg: 'rgba(0, 0, 0, 0.85)',
        toolbarColor: '#FFFFFF',
        polarityBg: 'rgba(0, 122, 255, 0.12)',
        polarityColor: '#007AFF',
        addBtnBg: 'rgba(255, 255, 255, 0.72)',
        addBtnColor: '#007AFF',
        preview: 'linear-gradient(180deg, #E8E8ED 0%, #E8E8ED 33%, #FFFFFF 33%, #FFFFFF 66%, #007AFF 66%, #007AFF 100%)'
    },
    blue: {
        name: '海洋蓝',
        bg: 'linear-gradient(180deg, #CCE5FF 0%, #E5F0FF 50%, #CCE5FF 100%)',
        rowBg: 'rgba(255, 255, 255, 0.85)',
        rowBorder: 'rgba(0, 122, 255, 0.2)',
        cardBg: '#FFFFFF',
        text: '#001F3F',
        textLight: '#001F3F',
        toolbarBg: 'rgba(0, 122, 255, 0.9)',
        toolbarColor: '#FFFFFF',
        polarityBg: 'rgba(0, 122, 255, 0.15)',
        polarityColor: '#007AFF',
        addBtnBg: 'rgba(0, 122, 255, 0.15)',
        addBtnColor: '#007AFF',
        preview: 'linear-gradient(180deg, #CCE5FF 0%, #CCE5FF 33%, #007AFF 33%, #007AFF 66%, #FFFFFF 66%, #FFFFFF 100%)'
    },
    dark: {
        name: '深色',
        bg: 'linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 50%, #1A1A1A 100%)',
        rowBg: 'rgba(40, 40, 40, 0.85)',
        rowBorder: 'rgba(255, 255, 255, 0.1)',
        cardBg: '#2C2C2E',
        text: '#FFFFFF',
        textLight: '#FFFFFF',
        toolbarBg: 'rgba(28, 28, 30, 0.95)',
        toolbarColor: '#FFFFFF',
        polarityBg: 'rgba(0, 122, 255, 0.25)',
        polarityColor: '#5AC8FA',
        addBtnBg: 'rgba(40, 40, 40, 0.85)',
        addBtnColor: '#5AC8FA',
        preview: 'linear-gradient(180deg, #1A1A1A 0%, #1A1A1A 33%, #3D3D3D 33%, #3D3D3D 66%, #5AC8FA 66%, #5AC8FA 100%)'
    },
    pink: {
        name: '樱花粉',
        bg: 'linear-gradient(180deg, #FFE8EC 0%, #FFF0F3 50%, #FFE8EC 100%)',
        rowBg: 'rgba(255, 255, 255, 0.85)',
        rowBorder: 'rgba(255, 45, 85, 0.2)',
        cardBg: '#FFFFFF',
        text: '#4A0010',
        textLight: '#4A0010',
        toolbarBg: 'rgba(255, 45, 85, 0.9)',
        toolbarColor: '#FFFFFF',
        polarityBg: 'rgba(255, 45, 85, 0.15)',
        polarityColor: '#FF2D55',
        addBtnBg: 'rgba(255, 45, 85, 0.15)',
        addBtnColor: '#FF2D55',
        preview: 'linear-gradient(180deg, #FFE8EC 0%, #FFE8EC 33%, #FF2D55 33%, #FF2D55 66%, #FFFFFF 66%, #FFFFFF 100%)'
    },
    green: {
        name: '森林绿',
        bg: 'linear-gradient(180deg, #D4EDDA 0%, #E8F5E9 50%, #D4EDDA 100%)',
        rowBg: 'rgba(255, 255, 255, 0.85)',
        rowBorder: 'rgba(52, 199, 89, 0.2)',
        cardBg: '#FFFFFF',
        text: '#0A3D0E',
        textLight: '#0A3D0E',
        toolbarBg: 'rgba(52, 199, 89, 0.9)',
        toolbarColor: '#FFFFFF',
        polarityBg: 'rgba(52, 199, 89, 0.15)',
        polarityColor: '#34C759',
        addBtnBg: 'rgba(52, 199, 89, 0.15)',
        addBtnColor: '#34C759',
        preview: 'linear-gradient(180deg, #D4EDDA 0%, #D4EDDA 33%, #34C759 33%, #34C759 66%, #FFFFFF 66%, #FFFFFF 100%)'
    },
    purple: {
        name: '薰衣草',
        bg: 'linear-gradient(180deg, #E8E0F0 0%, #F3EEF7 50%, #E8E0F0 100%)',
        rowBg: 'rgba(255, 255, 255, 0.85)',
        rowBorder: 'rgba(175, 82, 222, 0.2)',
        cardBg: '#FFFFFF',
        text: '#2D0A3D',
        textLight: '#2D0A3D',
        toolbarBg: 'rgba(175, 82, 222, 0.9)',
        toolbarColor: '#FFFFFF',
        polarityBg: 'rgba(175, 82, 222, 0.15)',
        polarityColor: '#AF52DE',
        addBtnBg: 'rgba(175, 82, 222, 0.15)',
        addBtnColor: '#AF52DE',
        preview: 'linear-gradient(180deg, #E8E0F0 0%, #E8E0F0 33%, #AF52DE 33%, #AF52DE 66%, #FFFFFF 66%, #FFFFFF 100%)'
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadTheme();
    loadPageTitle();
    renderThemeOptions();
    renderBoard();
    initDragAndDrop();
    initEventListeners();
});

// 应用主题
function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    
    currentTheme = themeName;
    
    // 设置背景
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
    
    // 更新 iOS 背景渐变
    const iosBg = document.querySelector('.ios-background');
    if (iosBg) {
        iosBg.style.background = theme.bg;
    }
    
    // 更新行动态样式
    document.querySelectorAll('.row').forEach(row => {
        row.style.background = theme.rowBg;
        row.style.borderColor = theme.rowBorder;
    });
    
    // 更新卡片样式
    document.querySelectorAll('.card').forEach(card => {
        card.style.background = theme.cardBg;
        card.style.color = theme.text;
    });
    
    // 更新小标题
    document.querySelectorAll('.card-small-title').forEach(title => {
        title.style.color = theme.text;
    });
    
    // 更新行标题
    document.querySelectorAll('.row-title').forEach(title => {
        title.style.color = theme.textLight;
    });
    
    // 更新工具栏
    document.querySelector('.dynamic-island').style.background = theme.toolbarBg;
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.style.color = theme.toolbarColor;
    });
    
    // 极性符号颜色由极性值决定，不应用主题颜色
    
    // 更新添加按钮
    document.querySelectorAll('.add-card-btn, .add-row-btn').forEach(btn => {
        btn.style.background = theme.addBtnBg;
        btn.style.color = theme.addBtnColor;
    });
    
    // 更新主题选项的激活状态
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('active', option.dataset.theme === themeName);
    });
    
    // 保存主题偏好
    localStorage.setItem(THEME_KEY, themeName);
}

// 加载保存的主题
function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'blue';
    applyTheme(savedTheme);
}

// 加载页面标题
function loadPageTitle() {
    const savedTitle = localStorage.getItem('storyboard_title') || '我的故事';
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) {
        titleElement.textContent = savedTitle;
        document.title = savedTitle + ' - StoryBeat Board';
    }
}

// 保存页面标题
function savePageTitle(title) {
    localStorage.setItem('storyboard_title', title);
    document.title = title + ' - StoryBeat Board';
}

// 渲染主题选项
function renderThemeOptions() {
    const container = document.getElementById('themeOptions');
    container.innerHTML = '';
    
    Object.entries(themes).forEach(([key, theme]) => {
        const option = document.createElement('div');
        option.className = 'theme-option' + (currentTheme === key ? ' active' : '');
        option.dataset.theme = key;
        
        option.innerHTML = `
            <div class="theme-preview" style="background: ${theme.preview}"></div>
            <span>${theme.name}</span>
        `;
        
        option.onclick = () => applyTheme(key);
        container.appendChild(option);
    });
}

// 加载数据
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            data = JSON.parse(saved);
        } catch (e) {
            console.error('数据解析失败', e);
            data = getDefaultData();
        }
    } else {
        data = getDefaultData();
    }
}

// 获取默认数据
function getDefaultData() {
    return [
        {
            id: generateId(),
            title: '第一幕',
            cards: [
                {
                    id: generateId(),
                    bigTitle: '开场',
                    smallTitle: '故事开始',
                    content: '这是故事的开始，描述场景和主要角色...',
                    polarity: { left: '+', right: '+', top: '+' }
                }
            ]
        }
    ];
}

// 保存数据
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 生成唯一ID
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 渲染看板
function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    
    if (data.length === 0) {
        data = getDefaultData();
    }
    
    data.forEach((row, rowIndex) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'row-wrapper';
        
        // 添加行按钮（非第一行显示）
        if (rowIndex > 0) {
            const addRowBefore = document.createElement('div');
            addRowBefore.className = 'add-row-before';
            const addRowBtn = document.createElement('button');
            addRowBtn.className = 'add-row-btn';
            addRowBtn.innerHTML = '<span>+</span><span style="font-size: 13px; margin-left: 4px;">添加行</span>';
            addRowBtn.title = '在此行上方添加新行';
            addRowBtn.onclick = () => addNewRowAt(rowIndex);
            addRowBefore.appendChild(addRowBtn);
            wrapper.appendChild(addRowBefore);
        }
        
        const rowElement = createRowElement(row);
        wrapper.appendChild(rowElement);
        board.appendChild(wrapper);
    });
    
    // 底部添加行按钮
    const lastWrapper = document.createElement('div');
    lastWrapper.className = 'row-wrapper';
    const addRowContainer = document.createElement('div');
    addRowContainer.className = 'add-row-before';
    const addRowBtn = document.createElement('button');
    addRowBtn.className = 'add-row-btn';
    addRowBtn.innerHTML = '<span>+</span><span style="font-size: 13px; margin-left: 4px;">添加新行</span>';
    addRowBtn.title = '添加新行';
    addRowBtn.onclick = addNewRow;
    addRowContainer.appendChild(addRowBtn);
    lastWrapper.appendChild(addRowContainer);
    board.appendChild(lastWrapper);
    
    // 应用当前主题
    applyTheme(currentTheme);
}

// 创建行元素
function createRowElement(row) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row';
    rowDiv.dataset.rowId = row.id;
    
    // 行头部
    const header = document.createElement('div');
    header.className = 'row-header';
    
    // 行标题
    const titleSpan = document.createElement('span');
    titleSpan.className = 'row-title';
    titleSpan.contentEditable = true;
    titleSpan.textContent = row.title;
    titleSpan.addEventListener('blur', (e) => {
        row.title = e.target.textContent.trim() || '未命名';
        e.target.textContent = row.title;
        saveData();
    });
    titleSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            titleSpan.blur();
        }
    });
    
    // 删除行按钮
    const deleteRowBtn = document.createElement('button');
    deleteRowBtn.className = 'delete-row-btn';
    deleteRowBtn.textContent = '删除';
    deleteRowBtn.onclick = (e) => {
        e.stopPropagation();
        showConfirm('确定要删除这一行吗？所有卡片将被删除。', () => {
            deleteRow(row.id);
        });
    };
    
    header.appendChild(titleSpan);
    header.appendChild(deleteRowBtn);
    rowDiv.appendChild(header);
    
    // 卡片容器
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    
    // 添加卡片按钮
    const addCardBtn = document.createElement('button');
    addCardBtn.className = 'add-card-btn';
    addCardBtn.textContent = '+';
    addCardBtn.title = '添加卡片';
    addCardBtn.onclick = () => addNewCard(row.id);
    cardsContainer.appendChild(addCardBtn);
    
    // 渲染卡片，传递上一张卡片的右侧极性
    let prevCardPolarity = null;
    row.cards.forEach((card) => {
        const cardElement = createCardElement(card, row.id, prevCardPolarity);
        cardsContainer.appendChild(cardElement);
        // 保存当前卡片的右侧极性，供下一张卡片使用
        prevCardPolarity = card.polarity.right;
    });
    
    rowDiv.appendChild(cardsContainer);
    
    return rowDiv;
}

// 创建卡片元素
function createCardElement(card, rowId, prevCardPolarity) {
    // 顶部极性自动同步右侧极性
    card.polarity.top = card.polarity.right;
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.dataset.cardId = card.id;
    cardDiv.dataset.rowId = rowId;
    
    // 如果有上一张卡片，检查连贯性并显示连接线
    if (prevCardPolarity) {
        const connector = document.createElement('div');
        connector.className = 'card-connector-wrapper';
        
        // 检查连贯性：上一张结尾 vs 这张开头
        const isConnected = prevCardPolarity === card.polarity.left;
        
        if (isConnected) {
            // 连贯 - 显示连接线
            const line = document.createElement('div');
            line.className = 'card-connector ' + (prevCardPolarity === '+' ? 'positive' : 'negative');
            connector.appendChild(line);
        } else {
            // 不连贯 - 显示叹号警告
            const warning = document.createElement('div');
            warning.className = 'card-connector-warning';
            warning.innerHTML = '⚠️';
            warning.title = '故事不连贯：上一张结尾与此张开头极性不同';
            connector.appendChild(warning);
        }
        
        cardDiv.appendChild(connector);
    }
    
    // 左侧极性
    const leftPolarity = document.createElement('div');
    leftPolarity.className = 'card-polarity left';
    const leftSymbol = document.createElement('span');
    leftSymbol.className = 'polarity-symbol ' + (card.polarity.left === '+' ? 'positive' : 'negative');
    leftSymbol.textContent = card.polarity.left;
    leftSymbol.onclick = (e) => {
        e.stopPropagation();
        togglePolarity(card, 'left');
    };
    leftPolarity.appendChild(leftSymbol);
    cardDiv.appendChild(leftPolarity);
    
    // 顶部极性 - 根据右侧极性自动确定，显示卡片整体情绪
    const topPolarity = document.createElement('div');
    topPolarity.className = 'card-polarity top';
    const topSymbol = document.createElement('span');
    topSymbol.className = 'polarity-symbol ' + (card.polarity.right === '+' ? 'positive' : 'negative');
    topSymbol.textContent = card.polarity.right;
    // 顶部极性不可点击，只显示
    topPolarity.appendChild(topSymbol);
    cardDiv.appendChild(topPolarity);
    
    // 小标题 - 优先显示大标题，其次小标题
    const smallTitle = document.createElement('div');
    smallTitle.className = 'card-small-title';
    smallTitle.textContent = card.bigTitle || card.smallTitle || '无标题';
    cardDiv.appendChild(smallTitle);
    
    // 右侧极性
    const rightPolarity = document.createElement('div');
    rightPolarity.className = 'card-polarity right';
    const rightSymbol = document.createElement('span');
    rightSymbol.className = 'polarity-symbol ' + (card.polarity.right === '+' ? 'positive' : 'negative');
    rightSymbol.textContent = card.polarity.right;
    rightSymbol.onclick = (e) => {
        e.stopPropagation();
        togglePolarity(card, 'right');
    };
    rightPolarity.appendChild(rightSymbol);
    cardDiv.appendChild(rightPolarity);
    
    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-card-btn';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        showConfirm('确定要删除这张卡片吗？', () => {
            deleteCard(card.id, rowId);
        });
    };
    cardDiv.appendChild(deleteBtn);
    
    // 点击进入编辑模式
    cardDiv.onclick = () => openEditModal(card, rowId);
    
    return cardDiv;
}

// 切换极性
function togglePolarity(card, position) {
    const values = ['+', '-'];
    const currentIndex = values.indexOf(card.polarity[position]);
    card.polarity[position] = values[(currentIndex + 1) % values.length];
    
    // 如果改变的是右侧极性，自动同步顶部极性
    if (position === 'right') {
        card.polarity.top = card.polarity.right;
    }
    
    saveData();
    renderBoard();
    initDragAndDrop();
}

// 添加新行
function addNewRow() {
    const newRow = {
        id: generateId(),
        title: '新行',
        cards: []
    };
    data.push(newRow);
    saveData();
    renderBoard();
    initDragAndDrop();
}

// 在指定位置添加新行
function addNewRowAt(index) {
    const newRow = {
        id: generateId(),
        title: '新行',
        cards: []
    };
    data.splice(index, 0, newRow);
    saveData();
    renderBoard();
    initDragAndDrop();
}

// 删除行
function deleteRow(rowId) {
    data = data.filter(row => row.id !== rowId);
    if (data.length === 0) {
        data = getDefaultData();
    }
    saveData();
    renderBoard();
    initDragAndDrop();
}

// 添加新卡片
function addNewCard(rowId) {
    const newCard = {
        id: generateId(),
        bigTitle: '',
        smallTitle: '',
        content: '',
        polarity: { left: '+', right: '+', top: '+' }
    };
    
    const row = data.find(r => r.id === rowId);
    if (row) {
        row.cards.push(newCard);
        saveData();
        renderBoard();
        initDragAndDrop();
        setTimeout(() => openEditModal(newCard, rowId), 100);
    }
}

// 删除卡片
function deleteCard(cardId, rowId) {
    const row = data.find(r => r.id === rowId);
    if (row) {
        row.cards = row.cards.filter(c => c.id !== cardId);
        saveData();
        renderBoard();
        initDragAndDrop();
    }
}

// 打开编辑弹窗
function openEditModal(card, rowId) {
    currentEditingCard = { card, rowId };
    
    document.getElementById('bigTitleInput').value = card.bigTitle || '';
    document.getElementById('smallTitleInput').value = card.smallTitle || '';
    document.getElementById('contentInput').value = card.content || '';
    
    // 更新极性按钮样式
    updatePolarityButtons(card);
    
    document.getElementById('editModal').classList.add('show');
    
    setTimeout(() => {
        document.getElementById('bigTitleInput').focus();
    }, 100);
}

// 更新极性按钮显示
function updatePolarityButtons(card) {
    document.querySelectorAll('.pol-btn').forEach(btn => {
        const position = btn.dataset.position;
        // 只更新左右两个按钮
        if (position === 'left' || position === 'right') {
            btn.textContent = card.polarity[position];
            btn.classList.remove('positive', 'negative');
            btn.classList.add(card.polarity[position] === '+' ? 'positive' : 'negative');
        }
    });
}

// 关闭编辑弹窗（不保存）
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    currentEditingCard = null;
}

// 保存卡片
function saveCard() {
    if (!currentEditingCard) return;
    
    const { card } = currentEditingCard;
    
    card.bigTitle = document.getElementById('bigTitleInput').value;
    card.smallTitle = document.getElementById('smallTitleInput').value;
    card.content = document.getElementById('contentInput').value;
    
    // 同步顶部极性 = 右侧极性
    card.polarity.top = card.polarity.right;
    
    saveData();
    renderBoard();
    initDragAndDrop();
    
    // 关闭弹窗
    document.getElementById('editModal').classList.remove('show');
    currentEditingCard = null;
}

// 显示确认弹窗
function showConfirm(message, onConfirm) {
    document.getElementById('confirmMessage').textContent = message;
    pendingDeleteCallback = onConfirm;
    document.getElementById('confirmModal').classList.add('show');
}

// 关闭确认弹窗
function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('show');
    pendingDeleteCallback = null;
}

// 初始化事件监听
function initEventListeners() {
    // 页面标题编辑
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.addEventListener('blur', (e) => {
            const title = e.target.textContent.trim() || '我的故事';
            e.target.textContent = title;
            savePageTitle(title);
        });
        pageTitle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                pageTitle.blur();
            }
        });
    }
    
    // 保存按钮
    document.getElementById('saveBtn').onclick = saveCard;
    
    // 取消按钮
    document.getElementById('cancelBtn').onclick = closeEditModal;
    
    // 确认弹窗
    document.getElementById('confirmYes').onclick = () => {
        if (pendingDeleteCallback) {
            pendingDeleteCallback();
        }
        closeConfirmModal();
    };
    document.getElementById('confirmNo').onclick = closeConfirmModal;
    
    // 极性按钮（只处理左右两个）
    document.querySelectorAll('.pol-btn').forEach(btn => {
        btn.onclick = () => {
            if (!currentEditingCard) return;
            const position = btn.dataset.position;
            // 只处理左右极性
            if (position !== 'left' && position !== 'right') return;
            
            const values = ['+', '-'];
            const currentIndex = values.indexOf(currentEditingCard.card.polarity[position]);
            currentEditingCard.card.polarity[position] = values[(currentIndex + 1) % values.length];
            
            // 更新按钮显示和样式
            btn.textContent = currentEditingCard.card.polarity[position];
            btn.classList.remove('positive', 'negative');
            btn.classList.add(currentEditingCard.card.polarity[position] === '+' ? 'positive' : 'negative');
        };
    });
    
    // 导出按钮
    document.getElementById('exportBtn').onclick = exportData;
    
    // 主题按钮
    document.getElementById('themeBtn').onclick = () => {
        document.getElementById('themeModal').classList.add('show');
    };
    
    // 关闭主题弹窗
    document.getElementById('closeThemeBtn').onclick = () => {
        document.getElementById('themeModal').classList.remove('show');
    };
    
    // 导入按钮
    document.getElementById('importBtn').onclick = () => {
        document.getElementById('importFile').click();
    };
    
    // 导入文件
    document.getElementById('importFile').onchange = importData;
    
    // 点击弹窗外部关闭
    document.getElementById('editModal').onclick = (e) => {
        if (e.target.id === 'editModal') {
            closeEditModal();
        }
    };
    
    document.getElementById('confirmModal').onclick = (e) => {
        if (e.target.id === 'confirmModal') {
            closeConfirmModal();
        }
    };
    
    document.getElementById('themeModal').onclick = (e) => {
        if (e.target.id === 'themeModal') {
            document.getElementById('themeModal').classList.remove('show');
        }
    };
    
    // ESC 关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModal();
            closeConfirmModal();
            document.getElementById('themeModal').classList.remove('show');
        }
    });
}

// 导出数据
function exportData() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'storybeat_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 导入数据
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported) && imported.length > 0) {
                data = imported;
                saveData();
                renderBoard();
                initDragAndDrop();
                showIOSAlert('导入成功');
            } else {
                showIOSAlert('无效的数据格式');
            }
        } catch (err) {
            showIOSAlert('导入失败：' + err.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// iOS 风格提示
function showIOSAlert(message) {
    const existingAlert = document.querySelector('.ios-toast');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'ios-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: calc(80px + env(safe-area-inset-bottom, 0px));
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: white;
        padding: 14px 28px;
        border-radius: 9999px;
        font-size: 15px;
        font-weight: 500;
        z-index: 9999;
        animation: toastSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    // 添加动画样式
    if (!document.querySelector('#toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            @keyframes toastSlideUp {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
    }, 2000);
}

// 初始化拖拽
function initDragAndDrop() {
    document.querySelectorAll('.cards-container').forEach(container => {
        if (container.sortableInstance) {
            container.sortableInstance.destroy();
        }
        
        const sortable = new Sortable(container, {
            group: 'cards',
            animation: 200,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            filter: '.add-card-btn',
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            onEnd: handleCardDragEnd
        });
        
        container.sortableInstance = sortable;
    });
}

// 处理卡片拖拽结束
function handleCardDragEnd(evt) {
    const { from, to, oldIndex, newIndex, item } = evt;
    
    if (!from || !to) return;
    
    const fromRowId = from.closest('.row')?.dataset.rowId;
    const toRowId = to.closest('.row')?.dataset.rowId;
    
    if (!fromRowId || !toRowId) return;
    
    const fromRow = data.find(r => r.id === fromRowId);
    const toRow = data.find(r => r.id === toRowId);
    
    if (!fromRow || !toRow) return;
    
    const movedCardId = item.dataset.cardId;
    
    if (fromRowId === toRowId) {
        const cardIndex = fromRow.cards.findIndex(c => c.id === movedCardId);
        if (cardIndex > -1) {
            const [movedCard] = fromRow.cards.splice(cardIndex, 1);
            let insertIndex = newIndex;
            if (newIndex > cardIndex) {
                insertIndex = newIndex - 1;
            }
            fromRow.cards.splice(insertIndex, 0, movedCard);
        }
    } else {
        const cardIndex = fromRow.cards.findIndex(c => c.id === movedCardId);
        if (cardIndex > -1) {
            const [movedCard] = fromRow.cards.splice(cardIndex, 1);
            let insertIndex = newIndex;
            if (newIndex > 0) {
                insertIndex = newIndex - 1;
            }
            toRow.cards.splice(insertIndex, 0, movedCard);
        }
    }
    
    saveData();
    renderBoard();
    initDragAndDrop();
}
