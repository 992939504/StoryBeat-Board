// 故事演示板脚本

const STORAGE_KEY = 'storyboard_data';

// 数据结构
let data = [];
let currentEditingCard = null;
let pendingDeleteCallback = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadTheme();
    renderBoard();
    initDragAndDrop();
    initEventListeners();
});

// 主题配置 - 每层之间有明显对比
const themes = {
    wood: {
        // 背景: 木头色
        bg: '#DEB887',
        // 行背景: 蓝色 (与背景形成对比)
        rowBg: '#0000FF',
        // 卡片背景: 白色 (与行形成对比)
        cardBg: '#FFFFFF',
        text: '#000000',
        textLight: '#FFFFFF',
        border: 'rgba(0, 0, 255, 0.3)',
        borderLight: 'rgba(255, 255, 255, 0.5)',
        toolbarBg: 'rgba(222, 184, 135, 0.5)',
        toolbarBorder: 'rgba(139, 90, 43, 0.5)',
        toolbarColor: '#5D4037',
        polarityBg: '#E0E0E0'
    },
    blue: {
        // 背景: 蓝色
        bg: '#0000FF',
        // 行背景: 浅蓝色
        rowBg: '#4169E1',
        // 卡片背景: 白色
        cardBg: '#FFFFFF',
        text: '#000000',
        textLight: '#FFFFFF',
        border: 'rgba(255, 255, 255, 0.3)',
        borderLight: 'rgba(255, 255, 255, 0.5)',
        toolbarBg: 'rgba(0, 0, 255, 0.3)',
        toolbarBorder: 'rgba(255, 255, 255, 0.4)',
        toolbarColor: '#FFFFFF',
        polarityBg: '#E8E8E8'
    },
    dark: {
        // 背景: 深黑色
        bg: '#1A1A1A',
        // 行背景: 深灰色
        rowBg: '#3D3D3D',
        // 卡片背景: 浅灰色
        cardBg: '#5A5A5A',
        text: '#FFFFFF',
        textLight: '#FFFFFF',
        border: 'rgba(255, 255, 255, 0.2)',
        borderLight: 'rgba(255, 255, 255, 0.3)',
        toolbarBg: 'rgba(255, 255, 255, 0.1)',
        toolbarBorder: 'rgba(255, 255, 255, 0.2)',
        toolbarColor: '#FFFFFF',
        polarityBg: '#4A4A4A'
    },
    light: {
        // 背景: 浅黄色
        bg: '#FFFF8D',
        // 行背景: 黄色
        rowBg: '#FFEB3B',
        // 卡片背景: 白色
        cardBg: '#FFFFFF',
        text: '#000000',
        textLight: '#000000',
        border: 'rgba(0, 0, 0, 0.1)',
        borderLight: 'rgba(0, 0, 0, 0.2)',
        toolbarBg: 'rgba(255, 235, 59, 0.5)',
        toolbarBorder: 'rgba(255, 235, 59, 0.6)',
        toolbarColor: '#000000',
        polarityBg: '#F0F0F0'
    },
    pink: {
        // 背景: 浅粉色
        bg: '#FFE4E1',
        // 行背景: 深粉色
        rowBg: '#DB7093',
        // 卡片背景: 白色
        cardBg: '#FFFFFF',
        text: '#000000',
        textLight: '#FFFFFF',
        border: 'rgba(255, 255, 255, 0.5)',
        borderLight: 'rgba(255, 255, 255, 0.6)',
        toolbarBg: 'rgba(219, 112, 147, 0.3)',
        toolbarBorder: 'rgba(219, 112, 147, 0.5)',
        toolbarColor: '#8B475D',
        polarityBg: '#F8F8F8'
    },
    green: {
        // 背景: 浅绿色
        bg: '#90EE90',
        // 行背景: 深绿色
        rowBg: '#228B22',
        // 卡片背景: 白色
        cardBg: '#FFFFFF',
        text: '#000000',
        textLight: '#FFFFFF',
        border: 'rgba(255, 255, 255, 0.5)',
        borderLight: 'rgba(255, 255, 255, 0.6)',
        toolbarBg: 'rgba(34, 139, 34, 0.3)',
        toolbarBorder: 'rgba(34, 139, 34, 0.5)',
        toolbarColor: '#006400',
        polarityBg: '#F0FFF0'
    }
};

// 应用主题
function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    
    document.body.style.background = theme.bg;
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
    
    // 更新行样式
    document.querySelectorAll('.row').forEach(row => {
        row.style.background = theme.rowBg;
        row.style.borderColor = theme.borderLight;
    });
    
    // 更新卡片样式
    document.querySelectorAll('.card').forEach(card => {
        card.style.background = theme.cardBg;
        card.style.color = theme.text;
        card.style.borderColor = theme.border;
    });
    
    // 更新小标题样式
    document.querySelectorAll('.card-small-title').forEach(title => {
        title.style.color = theme.text;
    });
    
    // 更新工具栏按钮
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.style.background = theme.toolbarBg;
        btn.style.borderColor = theme.toolbarBorder;
        btn.style.color = theme.toolbarColor;
    });
    
    // 更新添加按钮
    document.querySelectorAll('.add-card-btn').forEach(btn => {
        btn.style.background = theme.rowBg;
        btn.style.borderColor = theme.borderLight;
        btn.style.color = theme.textLight;
    });
    
    document.querySelectorAll('.add-row-btn').forEach(btn => {
        btn.style.background = theme.rowBg;
        btn.style.borderColor = theme.borderLight;
        btn.style.color = theme.textLight;
    });
    
    // 更新行标题
    document.querySelectorAll('.row-title').forEach(title => {
        title.style.color = theme.textLight;
    });
    
    // 更新极性符号
    document.querySelectorAll('.polarity-symbol').forEach(symbol => {
        symbol.style.background = theme.polarityBg || theme.cardBg;
        symbol.style.color = theme.text;
    });
}

// 加载保存的主题
function loadTheme() {
    const savedTheme = localStorage.getItem('storyboard_theme') || 'wood';
    applyTheme(savedTheme);
    
    // 标记当前主题
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === savedTheme) {
            option.classList.add('active');
        }
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
                    bigTitle: '示例',
                    smallTitle: '示例卡片',
                    content: '这是示例详细内容',
                    polarity: { left: '+', right: '-', top: '+' }
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
    
    // 如果没有数据，使用默认数据
    if (data.length === 0) {
        data = getDefaultData();
    }
    
    data.forEach((row, rowIndex) => {
        // 创建行的包装器
        const wrapper = document.createElement('div');
        wrapper.className = 'row-wrapper';
        
        // 如果不是第一行，在行之前添加添加行按钮（下一行左边）
        if (rowIndex > 0) {
            const addRowBefore = document.createElement('div');
            addRowBefore.className = 'add-row-before';
            const addRowBtn = document.createElement('button');
            addRowBtn.className = 'add-row-btn';
            addRowBtn.textContent = '+';
            addRowBtn.title = '在此行上方添加新行';
            addRowBtn.onclick = () => addNewRowAt(rowIndex);
            addRowBefore.appendChild(addRowBtn);
            wrapper.appendChild(addRowBefore);
        }
        
        // 创建行元素
        const rowElement = createRowElement(row);
        wrapper.appendChild(rowElement);
        
        board.appendChild(wrapper);
    });
    
    // 最后添加一个添加行按钮
    const lastWrapper = document.createElement('div');
    lastWrapper.className = 'row-wrapper';
    const addRowContainer = document.createElement('div');
    addRowContainer.className = 'add-row-before';
    const addRowBtn = document.createElement('button');
    addRowBtn.className = 'add-row-btn';
    addRowBtn.textContent = '+';
    addRowBtn.title = '添加新行';
    addRowBtn.onclick = addNewRow;
    addRowContainer.appendChild(addRowBtn);
    lastWrapper.appendChild(addRowContainer);
    board.appendChild(lastWrapper);
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
        showConfirm('确定要删除这一行吗？', () => {
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
    
    // 渲染卡片
    row.cards.forEach((card) => {
        const cardElement = createCardElement(card, row.id);
        cardsContainer.appendChild(cardElement);
    });
    
    rowDiv.appendChild(cardsContainer);
    
    return rowDiv;
}

// 创建卡片元素
function createCardElement(card, rowId) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.dataset.cardId = card.id;
    cardDiv.dataset.rowId = rowId;
    
    // 左侧极性
    const leftPolarity = document.createElement('div');
    leftPolarity.className = 'card-polarity left';
    const leftSymbol = document.createElement('span');
    leftSymbol.className = 'polarity-symbol';
    leftSymbol.textContent = card.polarity.left;
    leftSymbol.onclick = (e) => {
        e.stopPropagation();
        togglePolarity(card, 'left');
    };
    leftPolarity.appendChild(leftSymbol);
    cardDiv.appendChild(leftPolarity);
    
    // 顶部极性
    const topPolarity = document.createElement('div');
    topPolarity.className = 'card-polarity top';
    const topSymbol = document.createElement('span');
    topSymbol.className = 'polarity-symbol';
    topSymbol.textContent = card.polarity.top;
    topSymbol.onclick = (e) => {
        e.stopPropagation();
        togglePolarity(card, 'top');
    };
    topPolarity.appendChild(topSymbol);
    cardDiv.appendChild(topPolarity);
    
    // 小标题
    const smallTitle = document.createElement('div');
    smallTitle.className = 'card-small-title';
    smallTitle.textContent = card.smallTitle || '无标题';
    cardDiv.appendChild(smallTitle);
    
    // 右侧极性
    const rightPolarity = document.createElement('div');
    rightPolarity.className = 'card-polarity right';
    const rightSymbol = document.createElement('span');
    rightSymbol.className = 'polarity-symbol';
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
    saveData();
    renderBoard();
    initDragAndDrop();
}

// 添加新行（在末尾）
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
        // 直接进入编辑模式
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
    
    // 设置极性按钮
    updatePolarityButtons(card);
    
    document.getElementById('editModal').classList.add('show');
    
    // 聚焦大标题
    setTimeout(() => {
        document.getElementById('bigTitleInput').focus();
    }, 100);
}

// 更新极性按钮显示
function updatePolarityButtons(card) {
    document.querySelector('.left-polarity').textContent = card.polarity.left;
    document.querySelector('.right-polarity').textContent = card.polarity.right;
    document.querySelector('.top-polarity').textContent = card.polarity.top;
}

// 关闭编辑弹窗
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    currentEditingCard = null;
}

// 保存卡片
function saveCard() {
    if (!currentEditingCard) return;
    
    const { card, rowId } = currentEditingCard;
    
    card.bigTitle = document.getElementById('bigTitleInput').value;
    card.smallTitle = document.getElementById('smallTitleInput').value;
    card.content = document.getElementById('contentInput').value;
    
    saveData();
    closeEditModal();
    renderBoard();
    initDragAndDrop();
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
    
    // 极性按钮点击
    document.querySelectorAll('.polarity-btn').forEach(btn => {
        btn.onclick = () => {
            if (!currentEditingCard) return;
            const position = btn.dataset.position;
            const values = ['+', '-'];
            const currentIndex = values.indexOf(currentEditingCard.card.polarity[position]);
            currentEditingCard.card.polarity[position] = values[(currentIndex + 1) % values.length];
            updatePolarityButtons(currentEditingCard.card);
        };
    });
    
    // 导出按钮
    document.getElementById('exportBtn').onclick = exportData;
    
    // 主题按钮
    document.getElementById('themeBtn').onclick = () => {
        document.getElementById('themeModal').classList.add('show');
    };
    
    // 主题选项点击
    document.querySelectorAll('.theme-option').forEach(option => {
        option.onclick = () => {
            const theme = option.dataset.theme;
            applyTheme(theme);
            localStorage.setItem('storyboard_theme', theme);
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        };
    });
    
    // 关闭主题弹窗
    document.getElementById('closeThemeBtn').onclick = () => {
        document.getElementById('themeModal').classList.remove('show');
    };
    
    document.getElementById('themeModal').onclick = (e) => {
        if (e.target.id === 'themeModal') {
            document.getElementById('themeModal').classList.remove('show');
        }
    };
    
    // 导入按钮
    document.getElementById('importBtn').onclick = () => {
        document.getElementById('importFile').click();
    };
    
    // 导入文件选择
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
    
    // ESC 关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModal();
            closeConfirmModal();
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
    a.download = 'storyboard_' + new Date().toISOString().slice(0, 10) + '.json';
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
                alert('导入成功！');
            } else {
                alert('无效的数据格式');
            }
        } catch (err) {
            alert('导入失败：' + err.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// 初始化拖拽
function initDragAndDrop() {
    // 卡片拖拽
    document.querySelectorAll('.cards-container').forEach(container => {
        // 销毁旧的 Sortable 实例
        if (container.sortableInstance) {
            container.sortableInstance.destroy();
        }
        
        const sortable = new Sortable(container, {
            group: 'cards',
            animation: 150,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            filter: '.add-card-btn',
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
    
    // 找到移动的卡片的ID
    const movedCardId = item.dataset.cardId;
    
    if (fromRowId === toRowId) {
        // 同一行内拖拽
        const cardIndex = fromRow.cards.findIndex(c => c.id === movedCardId);
        if (cardIndex > -1) {
            const [movedCard] = fromRow.cards.splice(cardIndex, 1);
            // 重新计算新索引（排除添加按钮）
            let insertIndex = newIndex;
            if (newIndex > cardIndex) {
                insertIndex = newIndex - 1;
            }
            fromRow.cards.splice(insertIndex, 0, movedCard);
        }
    } else {
        // 跨行拖拽
        const cardIndex = fromRow.cards.findIndex(c => c.id === movedCardId);
        if (cardIndex > -1) {
            const [movedCard] = fromRow.cards.splice(cardIndex, 1);
            let insertIndex = newIndex;
            // 调整索引（排除添加按钮）
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