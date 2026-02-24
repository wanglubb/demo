// 地图数据存储
let mapData = {};
let myChart = null;

// 初始化地图
function initMap() {
    console.log('开始初始化ECharts地图...');
    
    // 检查ECharts是否已加载
    if (typeof echarts === 'undefined') {
        console.error('ECharts库未加载');
        return;
    }
    
    // 初始化ECharts实例
    const chartDom = document.getElementById('chinaMap');
    if (!chartDom) {
        console.error('找不到地图容器元素');
        return;
    }
    
    // 如果已有实例，先销毁
    if (myChart) {
        myChart.dispose();
    }
    
    myChart = echarts.init(chartDom);
    
    // 准备省份数据
    const provinceData = [];
    for (const provinceId in mapData) {
        const province = provincesData.find(p => p.id === provinceId);
        if (province) {
            provinceData.push({
                name: province.name.replace(/省|市|自治区|特别行政区/g, ''),
                value: mapData[provinceId].actualUsers || 0,
                extra: {
                    approvedUsers: mapData[provinceId].approvedUsers || 0,
                    actualUsers: mapData[provinceId].actualUsers || 0
                }
            });
        }
    }
    
    // 配置选项
    const option = {
        title: {
            text: '中国省份数据分布图',
            subtext: '双击省份可编辑数据',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                if (params.data) {
                    const data = params.data;
                    const approvedUsers = data.extra ? data.extra.approvedUsers : 0;
                    const actualUsers = data.value || 0;
                    const usageRate = approvedUsers > 0 ? (actualUsers / approvedUsers * 100).toFixed(2) : 0;
                    
                    return `
                        <div>
                            <div><strong>${params.name}</strong></div>
                            <div>核定户数: ${approvedUsers}</div>
                            <div>使用户数: ${actualUsers}</div>
                            <div>使用率: ${usageRate}%</div>
                        </div>
                    `;
                }
                return params.name;
            }
        },
        visualMap: {
            min: 0,
            max: 100000,
            left: 'left',
            top: 'bottom',
            text: ['高', '低'],
            calculable: true,
            orient: 'horizontal',
            inRange: {
                color: ['#cccccc', '#6baed6', '#3182bd', '#08519c', '#08306b']
            },
            textStyle: {
                color: '#000'
            }
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            right: 'right',
            top: 'top',
            feature: {
                dataView: { readOnly: false },
                restore: {},
                saveAsImage: {}
            }
        },
        series: [
            {
                name: '用户数量',
                type: 'map',
                map: 'china',
                roam: true, // 允许缩放和平移
                zoom: 1.2, // 初始缩放级别
                center: [104.114129, 37.550339], // 中国中心坐标
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 0.5
                },
                emphasis: {
                    itemStyle: {
                        areaColor: '#f3f300',
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        shadowBlur: 20,
                        borderWidth: 1,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                data: provinceData,
                // 设置点击事件
                selectedMode: 'single'
            }
        ]
    };

    // 设置配置项并渲染
    myChart.setOption(option);
    
    // 处理地图点击事件
    myChart.on('dblclick', function(params) {
        if (params.name && params.data) {
            handleProvinceDoubleClick(params);
        }
    });
    
    // 窗口大小改变时调整图表大小
    window.addEventListener('resize', function() {
        if (myChart) {
            myChart.resize();
        }
    });
    
    console.log('ECharts地图初始化完成');
    
    // 绑定UI事件
    bindMapEvents();
}

// 处理省份双击事件
function handleProvinceDoubleClick(params) {
    // 根据省份名称查找ID
    const province = provincesData.find(p => p.name.replace(/省|市|自治区|特别行政区/g, '') === params.name);
    if (!province) {
        console.error('未找到对应的省份:', params.name);
        return;
    }
    
    const provinceId = province.id;
    
    // 获取省份数据，如果没有则初始化为空
    const provinceData = mapData[provinceId] || { approvedUsers: 0, actualUsers: 0 };
    
    // 显示编辑弹窗
    document.getElementById('provinceName').value = province.name;
    document.getElementById('approvedUsers').value = provinceData.approvedUsers;
    document.getElementById('actualUsers').value = provinceData.actualUsers;
    
    document.getElementById('editModal').classList.add('active');
    document.getElementById('editModalOverlay').classList.add('active');
    
    // 保存当前编辑的省份ID
    document.getElementById('editModal').setAttribute('data-editing-province', provinceId);
}

// 绑定地图UI事件
function bindMapEvents() {
    console.log('绑定地图事件');
    
    // 文件导入按钮
    const importBtn = document.getElementById('importBtn');
    const csvFileInput = document.getElementById('csvFileInput');
    
    if(importBtn) {
        importBtn.addEventListener('click', importCsvData);
    } else {
        console.error('找不到导入按钮');
    }
    
    if(csvFileInput) {
        csvFileInput.addEventListener('change', handleFileSelect);
    } else {
        console.error('找不到文件输入元素');
    }
    
    // 导出按钮
    const exportBtn = document.getElementById('exportBtn');
    if(exportBtn) {
        exportBtn.addEventListener('click', exportMap);
    }
    
    // 编辑弹窗事件
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editModalOverlay = document.getElementById('editModalOverlay');
    
    if(saveEditBtn) {
        saveEditBtn.addEventListener('click', saveProvinceData);
    }
    if(cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }
    if(editModalOverlay) {
        editModalOverlay.addEventListener('click', closeEditModal);
    }
    
    // 阻止点击弹窗内容时关闭弹窗
    const editModal = document.getElementById('editModal');
    if(editModal) {
        editModal.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    console.log('地图事件绑定完成');
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('importInfo').textContent = `已选择: ${file.name}`;
    }
}

// 导入CSV数据
function importCsvData() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('请选择一个CSV文件');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        parseCsvData(content);
        // 重新初始化地图以反映新数据
        setTimeout(refreshMap, 100);
    };
    reader.readAsText(file);
}

// 解析CSV数据
function parseCsvData(csvContent) {
    const lines = csvContent.split(/\r?\n/); // 支持Windows和Unix换行符
    
    // 跳过标题行
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // 分割CSV行（处理带引号的值）
        const values = parseCsvLine(line);
        
        if (values.length >= 3) {
            const provinceName = values[0].trim();
            const approvedUsers = parseInt(values[1]) || 0;
            const actualUsers = parseInt(values[2]) || 0;
            
            // 查找匹配的省份ID
            const matchedProvince = provincesData.find(p => 
                p.name.includes(provinceName) || provinceName.includes(p.name)
            );
            
            if (matchedProvince) {
                mapData[matchedProvince.id] = {
                    approvedUsers: approvedUsers,
                    actualUsers: actualUsers
                };
            } else {
                console.warn(`未找到匹配的省份: ${provinceName}`);
            }
        }
    }
    
    document.getElementById('importInfo').textContent += ' - 导入完成';
    
    // 刷新地图显示
    refreshMap();
}

// 解析CSV行
function parseCsvLine(line) {
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    
    values.push(currentValue.trim());
    return values;
}

// 保存省份数据
function saveProvinceData() {
    const provinceId = document.getElementById('editModal').getAttribute('data-editing-province');
    const approvedUsers = parseInt(document.getElementById('approvedUsers').value) || 0;
    const actualUsers = parseInt(document.getElementById('actualUsers').value) || 0;
    
    // 更新地图数据
    mapData[provinceId] = {
        approvedUsers: approvedUsers,
        actualUsers: actualUsers
    };
    
    // 刷新地图显示
    refreshMap();
    
    // 关闭弹窗
    closeEditModal();
}

// 关闭编辑弹窗
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editModalOverlay').classList.remove('active');
}

// 导出地图功能（简化版，仅提示功能）
function exportMap() {
    alert('地图导出功能正在开发中...\n此功能将允许您将当前地图保存为图片。');
    
    // 这里可以集成html2canvas或其他截图库来实现真正的导出功能
    // 示例：
    /*
    html2canvas(document.getElementById('mapContainer')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'map.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
    */
}

// 刷新地图显示
function refreshMap() {
    if (!myChart) {
        console.error('ECharts实例未初始化');
        return;
    }

    // 准备省份数据
    const provinceData = [];
    let maxValue = 0;
    for (const provinceId in mapData) {
        const province = provincesData.find(p => p.id === provinceId);
        if (province) {
            const value = mapData[provinceId].actualUsers || 0;
            provinceData.push({
                name: province.name.replace(/省|市|自治区|特别行政区/g, ''),
                value: value,
                extra: {
                    approvedUsers: mapData[provinceId].approvedUsers || 0,
                    actualUsers: value
                }
            });
            // 记录最大值用于visualMap调整
            if (value > maxValue) {
                maxValue = value;
            }
        }
    }

    // 动态调整visualMap范围
    const option = myChart.getOption();
    option.visualMap[0].max = Math.max(100000, maxValue * 1.2); // 略高于最大值
    option.series[0].data = provinceData;
    
    // 使用setOption更新数据
    myChart.setOption(option, { notMerge: false });
}

// 省份数据（仅用于ID映射）
const provincesData = [
    { id: '110000', name: '北京市' },
    { id: '120000', name: '天津市' },
    { id: '130000', name: '河北省' },
    { id: '140000', name: '山西省' },
    { id: '150000', name: '内蒙古自治区' },
    { id: '210000', name: '辽宁省' },
    { id: '220000', name: '吉林省' },
    { id: '230000', name: '黑龙江省' },
    { id: '310000', name: '上海市' },
    { id: '320000', name: '江苏省' },
    { id: '330000', name: '浙江省' },
    { id: '340000', name: '安徽省' },
    { id: '350000', name: '福建省' },
    { id: '360000', name: '江西省' },
    { id: '370000', name: '山东省' },
    { id: '410000', name: '河南省' },
    { id: '420000', name: '湖北省' },
    { id: '430000', name: '湖南省' },
    { id: '440000', name: '广东省' },
    { id: '450000', name: '广西壮族自治区' },
    { id: '460000', name: '海南省' },
    { id: '500000', name: '重庆市' },
    { id: '510000', name: '四川省' },
    { id: '520000', name: '贵州省' },
    { id: '530000', name: '云南省' },
    { id: '540000', name: '西藏自治区' },
    { id: '610000', name: '陕西省' },
    { id: '620000', name: '甘肃省' },
    { id: '630000', name: '青海省' },
    { id: '640000', name: '宁夏回族自治区' },
    { id: '650000', name: '新疆维吾尔自治区' },
    { id: '710000', name: '台湾省' },
    { id: '810000', name: '香港特别行政区' },
    { id: '820000', name: '澳门特别行政区' }
];

// 页面加载完成后初始化地图
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM内容加载完成');
    
    // 加载中国地图数据
    loadChinaMapData();
});

// 加载中国地图数据
function loadChinaMapData() {
    // 创建XMLHttpRequest对象来加载地图JSON数据
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'js/china.json', true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const chinaJson = JSON.parse(xhr.responseText);
                    echarts.registerMap('china', chinaJson);
                    console.log('中国地图数据加载并注册成功');
                    
                    // 地图数据加载完成后，初始化地图
                    initMapWhenReady();
                } catch (e) {
                    console.error('解析地图JSON数据时出错:', e);
                    alert('地图数据加载失败，请检查网络连接');
                }
            } else {
                console.error('加载地图数据失败，HTTP状态码:', xhr.status);
                alert('地图数据加载失败，请检查网络连接');
            }
        }
    };
    
    xhr.onerror = function() {
        console.error('加载地图数据时发生网络错误');
        alert('地图数据加载失败，请检查网络连接');
    };
    
    xhr.send();
}

// 当地图数据准备就绪时初始化地图
function initMapWhenReady() {
    // 立即尝试初始化地图（如果标签页是活跃的）
    const tabMapElement = document.getElementById('tab-map');
    if (tabMapElement && tabMapElement.classList.contains('active')) {
        console.log('地图标签页当前处于活跃状态，立即初始化');
        setTimeout(initMap, 100);
    }
    
    // 监听地图标签页是否被激活
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active') && target.id === 'tab-map') {
                    console.log('地图标签页被激活，初始化地图');
                    // 延迟初始化以确保DOM完全渲染
                    setTimeout(initMap, 100);
                }
            }
        });
    });

    if (tabMapElement) {
        observer.observe(tabMapElement, { attributes: true, attributeFilter: ['class'] });
    } else {
        console.error('无法找到地图标签页元素');
    }
}

//AI生成 - 395行