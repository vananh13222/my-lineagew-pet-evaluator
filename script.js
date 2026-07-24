// 寵物基礎數據
const petData = {
    wolf: {
        name: 'Sói',
        emoji: '🐺',
        image: 'wolf.png',
        mainStat: 'hp',
        baseStats: {
            endurance: 6,    // 忍耐力
            loyalty: 6,      // 忠誠心
            speed: 6,        // 速度
            aggressiveness: 3, // 積極性
            hp: 14          // 體力
        }
    },
    dog: {
        name: 'Doberman',
        emoji: '🐕',
        image: 'dubin.png',
        mainStat: 'loyalty',
        baseStats: {
            endurance: 6,
            loyalty: 14,
            speed: 6,
            aggressiveness: 3,
            hp: 6
        }
    },
    shepherd: {
        name: 'Chó chăn cừu',
        emoji: '🐕‍🦺',
        image: 'sheepdog.png',
        mainStat: 'endurance',
        baseStats: {
            endurance: 14,
            loyalty: 6,
            speed: 6,
            aggressiveness: 3,
            hp: 6
        }
    },
    hound: {
        name: 'Beagle',
        emoji: '🐶',
        image: 'beagle.png',
        mainStat: 'speed',
        baseStats: {
            endurance: 6,
            loyalty: 6,
            speed: 14,
            aggressiveness: 3,
            hp: 6
        }
    }
};

// 升級機率表
const upgradeRates = {
    main: [
        { level: 1, rate: 0.05 },
        { level: 2, rate: 0.15 },
        { level: 3, rate: 0.30 },
        { level: 4, rate: 0.20 },
        { level: 5, rate: 0.15 },
        { level: 6, rate: 0.10 },
        { level: 7, rate: 0.05 }
    ],
    sub: [
        { level: 0, rate: 0.15 },
        { level: 1, rate: 0.50 },
        { level: 2, rate: 0.30 },
        { level: 3, rate: 0.05 }
    ]
};

// 屬性名稱對應
const statNames = {
    endurance: 'Sức bền',
    loyalty: 'Trung thành',
    speed: 'Tốc độ',
    aggressiveness: 'Tính tích cực',
    hp: 'Thể lực'
};

// 現代通知系統
function showNotification(message, type = 'warning') {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close" aria-label="Đóng thông báo">&times;</button>
    `;
    
    // 添加到頁面
    document.body.appendChild(notification);
    
    // 自動關閉
    const autoCloseTimer = setTimeout(() => {
        closeNotification(notification);
    }, 4000);
    
    // 點擊關閉
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(autoCloseTimer);
        closeNotification(notification);
    });
}

function closeNotification(notification) {
    notification.classList.add('fade-out');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Tính hiệu ứng nhân vật
function calculateCharacterBonus(statName, value) {
    switch(statName) {
        case 'endurance':
            return `+${Math.floor(value / 5)} Phòng thủ vật lý`;
        case 'loyalty':
            return `+${Math.floor(value / 5)} Chính xác`;
        case 'speed':
            return `+${Math.floor(value / 10)} Né tránh`;
        case 'hp':
            return `+${value * 30} HP`;
        case 'aggressiveness':
            return 'Không có tác dụng';
        default:
            return '';
    }
}

// 防抖函數
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 全域變數
let selectedPet = null;

// DOM 元素
const petCards = document.querySelectorAll('.pet-card');
const calculateBtn = document.getElementById('calculate');
const resultsSection = document.getElementById('results');
const levelInput = document.getElementById('level');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeBtn = document.querySelector('.close');
const helpTabBtns = document.querySelectorAll('.help-tab-btn');
const helpTabContents = document.querySelectorAll('.help-tab-content');

// 事件監聽器
document.addEventListener('DOMContentLoaded', function() {
    // 寵物選擇
    petCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除其他選中狀態
            petCards.forEach(c => c.classList.remove('selected'));
            // 選中當前寵物
            this.classList.add('selected');
            selectedPet = this.dataset.pet;
            
            // 更新基礎屬性顯示
            updateBaseStatsDisplay();
        });
    });

    // 計算按鈕
    calculateBtn.addEventListener('click', calculatePetStats);
    
    // 等級輸入變化時更新基礎值 - 使用防抖
    const debouncedUpdateBaseStats = debounce(updateBaseStatsDisplay, 300);
    levelInput.addEventListener('input', debouncedUpdateBaseStats);
    
    // 說明按鈕事件
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            helpModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // 防止背景滾動
        });
    }
    
    // 關閉按鈕事件
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            helpModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // 恢復背景滾動
        });
    }
    
    // 點擊視窗外部關閉
    window.addEventListener('click', function(event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // ESC鍵關閉視窗
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && helpModal && helpModal.style.display === 'block') {
            helpModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // 說明標籤切換
    helpTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // 移除所有active狀態
            helpTabBtns.forEach(b => b.classList.remove('active'));
            helpTabContents.forEach(content => content.classList.remove('active'));
            
            // 添加當前標籤的active狀態
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // 初始化公告欄位
    initAnnouncementToggle();
});

// 更新基礎屬性顯示
function updateBaseStatsDisplay() {
    if (!selectedPet) return;
    
    const level = parseInt(levelInput.value) || 1;
    const pet = petData[selectedPet];
    
    // 計算預期的基礎值
    const expectedStats = calculateExpectedStats(pet, level);
    
    // 更新輸入框的 placeholder
    Object.keys(expectedStats).forEach(stat => {
        const input = document.getElementById(stat);
        if (input && stat !== 'aggressiveness') {
            input.placeholder = `Dự kiến: ${expectedStats[stat].toFixed(1)}`;
        }
    });
}

// 計算預期屬性值
function calculateExpectedStats(pet, level) {
    const stats = { ...pet.baseStats };
    const upgradesNeeded = level - 1;
    
    // 計算每個屬性的預期增長
    Object.keys(stats).forEach(stat => {
        // 積極性不升級
        if (stat === 'aggressiveness') {
            return;
        }
        
        const isMainStat = stat === pet.mainStat;
        const rates = isMainStat ? upgradeRates.main : upgradeRates.sub;
        
        // 修正：計算每次升級的期望值
        let expectedPerLevel = 0;
        rates.forEach(rate => {
            expectedPerLevel += rate.level * rate.rate;
        });
        
        // 總期望增長 = 每次升級期望值 × 升級次數
        const totalExpectedIncrease = expectedPerLevel * upgradesNeeded;
        stats[stat] += totalExpectedIncrease;
    });
    
    return stats;
}

// 計算寵物屬性
function calculatePetStats() {
    if (!selectedPet) {
        showNotification('Vui lòng chọn một thú cưng', 'warning');
        return;
    }
    
    const level = parseInt(levelInput.value) || 1;
    const currentStats = {
        endurance: parseInt(document.getElementById('endurance').value) || 0,
        loyalty: parseInt(document.getElementById('loyalty').value) || 0,
        speed: parseInt(document.getElementById('speed').value) || 0,
        aggressiveness: 3, // 固定為3
        hp: parseInt(document.getElementById('hp').value) || 0
    };
    
    // 驗證輸入
    if (level < 1 || level > 15) {
        showNotification('Cấp độ phải nằm trong khoảng 1-15', 'error');
        return;
    }
    
    // 修正：調整屬性值合理範圍檢查，根據預期值動態計算
    const pet = petData[selectedPet];
    const expectedStats = calculateExpectedStats(pet, level);
    
    for (const [stat, value] of Object.entries(currentStats)) {
        if (stat !== 'aggressiveness' && value > 0) {
            // 設定合理上限為預期值的1.5倍（允許優質寵物）
            const maxReasonableValue = Math.ceil(expectedStats[stat] * 1.5);
            if (value > maxReasonableValue) {
                showNotification(`${statNames[stat]} quá cao, vui lòng kiểm tra (khuyến nghị không vượt quá ${maxReasonableValue})`, 'warning');
                return;
            }
        }
        if (value < 0) {
            showNotification(`${statNames[stat]} không được là số âm`, 'error');
            return;
        }
    }
    
    if (Object.values(currentStats).filter((val, index) => index !== 3).every(val => val === 0)) {
        showNotification('Vui lòng nhập ít nhất một giá trị thuộc tính (ngoại trừ Tính tích cực)', 'warning');
        return;
    }
    
    const analysis = analyzeStats(pet, level, currentStats, expectedStats);
    
    displayResults(pet, level, currentStats, expectedStats, analysis);
    showNotification('Hoàn tất tính toán!', 'success');
}

// 分析屬性
function analyzeStats(pet, level, currentStats, expectedStats) {
    const analysis = {};
    let totalScore = 0;
    let validStats = 0;
    
    Object.keys(currentStats).forEach(stat => {
        if (stat === 'aggressiveness' || currentStats[stat] > 0) {
            const baseValue = pet.baseStats[stat];
            const expectedValue = expectedStats[stat];
            const currentValue = currentStats[stat];
            const growthValue = currentValue - baseValue;
            
            let rating, ratingClass, score;
            // Tính tích cực đặc biệt xử lý
            if (stat === 'aggressiveness') {
                rating = 'Giá trị cố định';
                ratingClass = 'rating-good';
                score = 70; // Cho điểm trung bình, không ảnh hưởng đến trung bình
            } else {
                // Sửa: Tính tỷ lệ tăng trưởng (tương đối với giá trị dự kiến), tránh lỗi chia cho 0
                let growthRate;
                if (expectedValue > baseValue) {
                    growthRate = (currentValue - baseValue) / (expectedValue - baseValue);
                } else {
                    // Nếu giá trị dự kiến bằng giá trị cơ bản (trường hợp cấp 1), so sánh trực tiếp giá trị hiện tại và cơ bản
                    growthRate = currentValue >= baseValue ? 1 : 0.5;
                }
                
                // Tránh trường hợp bất thường với tỷ lệ tăng trưởng âm
                if (growthRate < 0) {
                    growthRate = 0;
                }
                
                if (growthRate >= 1.4) {
                    rating = 'Tuyệt đỉnh';
                    ratingClass = 'rating-excellent';
                    score = 100;
                } else if (growthRate >= 1.2) {
                    rating = 'Xuất sắc';
                    ratingClass = 'rating-excellent';
                    score = 85;
                } else if (growthRate >= 1.05) {
                    rating = 'Tốt';
                    ratingClass = 'rating-good';
                    score = 70;
                } else if (growthRate >= 1.0) {
                    rating = 'Bình thường';
                    ratingClass = 'rating-average';
                    score = 55;
                } else if (growthRate >= 0.85) {
                    rating = 'Cần cải thiện';
                    ratingClass = 'rating-average';
                    score = 40;
                } else {
                    rating = 'Kém';
                    ratingClass = 'rating-poor';
                    score = 30;
                }
                
                // Trọng số thuộc tính chính
                if (stat === pet.mainStat) {
                    score *= 1.5;
                }
                
                totalScore += score;
                validStats++;
            }
            
            analysis[stat] = {
                current: currentValue,
                base: baseValue,
                expected: expectedValue,
                growth: growthValue,
                rating: rating,
                ratingClass: ratingClass,
                score: score,
                isMain: stat === pet.mainStat,
                characterBonus: calculateCharacterBonus(stat, currentValue)
            };
        }
    });
    
    // Tính đánh giá tổng thể (loại trừ tính tích cực)
    const averageScore = validStats > 0 ? totalScore / validStats : 0;
    let overallRating, overallClass, description;
    
    if (averageScore >= 95) {
        overallRating = 'Thú đỉnh';
        overallClass = 'excellent';
        description = 'Chúc mừng! Đây là một thú cưng cực phẩm, tăng trưởng thuộc tính rất xuất sắc, xứng đáng đầu tư!';
    } else if (averageScore >= 80) {
        overallRating = 'Thú chất lượng cao';
        overallClass = 'excellent';
        description = 'Đây là một thú cưng chất lượng tốt, tăng trưởng thuộc tính vượt mức trung bình, khuyến nghị tiếp tục nuôi dưỡng.';
    } else if (averageScore >= 65) {
        overallRating = 'Thú bình thường';
        overallClass = 'good';
        description = 'Thú cưng này có tăng trưởng thuộc tính đạt kỳ vọng, có thể sử dụng bình thường.';
    } else if (averageScore >= 50) {
        overallRating = 'Cần cải thiện';
        overallClass = 'average';
        description = 'Thú cưng này có tăng trưởng dưới trung bình, khuyến nghị tăng cường hoặc tìm thay thế tốt hơn.';
    } else {
        overallRating = 'Chất lượng kém';
        overallClass = 'poor';
        description = 'Tăng trưởng thuộc tính của thú cưng này rõ ràng không đạt, khuyến nghị huấn luyện lại hoặc thay thế.';
    }
    
    return {
        stats: analysis,
        overall: {
            rating: overallRating,
            class: overallClass,
            description: description,
            score: averageScore
        }
    };
}

// 顯示結果
function displayResults(pet, level, currentStats, expectedStats, analysis) {
    // 顯示寵物資訊 - 使用圖片替代emoji
    const petEmojiElement = document.querySelector('.pet-emoji');
    if (petEmojiElement) {
        // 如果存在舊的圖片或文字，先清除
        petEmojiElement.innerHTML = '';
        // 創建圖片元素
        const petImg = document.createElement('img');
        petImg.src = pet.image;
        petImg.alt = pet.name;
        petImg.className = 'pet-image';
        petEmojiElement.appendChild(petImg);
    }
    
    document.querySelector('.pet-name').textContent = pet.name;
    document.querySelector('.pet-level').textContent = `Lv.${level}`;
    
    // 清空之前的比較表格
    const comparisonGrid = document.querySelector('.comparison-grid');
    comparisonGrid.innerHTML = `
        <div class="stat-row header">
            <div>Thuộc tính</div>
            <div>Giá trị hiện tại</div>
            <div>Giá trị cơ bản</div>
            <div>Tăng trưởng</div>
            <div>Giá trị dự kiến</div>
            <div>Hiệu ứng nhân vật</div>
            <div>Đánh giá</div>
        </div>
    `;
    
    // 添加屬性行
    Object.keys(analysis.stats).forEach(stat => {
        const data = analysis.stats[stat];
        const statRow = document.createElement('div');
        statRow.className = 'stat-row';
        
        const mainIndicator = data.isMain ? ' ⭐' : '';
        
        statRow.innerHTML = `
            <div>${statNames[stat]}${mainIndicator}</div>
            <div>${data.current}</div>
            <div>${data.base}</div>
            <div>+${data.growth}</div>
            <div>${formatNumber(data.expected)}</div>
            <div>${data.characterBonus}</div>
            <div><span class="${data.ratingClass}">${data.rating}</span></div>
        `;
        
        comparisonGrid.appendChild(statRow);
    });
    
    // 顯示整體評價
    const ratingBadge = document.querySelector('.rating-badge');
    const ratingDescription = document.querySelector('.rating-description');
    
    ratingBadge.textContent = analysis.overall.rating;
    ratingBadge.className = `rating-badge ${analysis.overall.class}`;
    ratingDescription.textContent = analysis.overall.description;
    
    // 顯示結果區域
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// 工具函數：格式化數字
function formatNumber(num) {
    return parseFloat(num.toFixed(1));
}

// 📢 公告欄位折疊功能
function initAnnouncementToggle() {
    const announcementToggle = document.getElementById('announcementToggle');
    const announcementContent = document.getElementById('announcementContent');
    
    if (announcementToggle && announcementContent) {
        // 檢查本地存儲的折疊狀態
        const isCollapsed = localStorage.getItem('announcementCollapsed') === 'true';
        if (isCollapsed) {
            announcementToggle.classList.add('collapsed');
            announcementContent.classList.add('collapsed');
        }
        
        announcementToggle.addEventListener('click', function() {
            const isCurrentlyCollapsed = announcementContent.classList.contains('collapsed');
            
            if (isCurrentlyCollapsed) {
                // 展開
                announcementToggle.classList.remove('collapsed');
                announcementContent.classList.remove('collapsed');
                localStorage.setItem('announcementCollapsed', 'false');
            } else {
                // 折疊
                announcementToggle.classList.add('collapsed');
                announcementContent.classList.add('collapsed');
                localStorage.setItem('announcementCollapsed', 'true');
            }
        });
    }
}
