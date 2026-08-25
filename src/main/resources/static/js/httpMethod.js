// 新增：缓存后端返回的示例参数（如果有）
                const methodExamples = {};

                // 以纯文本方式渲染响应内容，避免接口返回的 HTML 被当作标签解析
                function renderResponse(target, text, level) {
                    if (!target) return;
                    target.textContent = '';
                    const span = document.createElement('span');
                    if (level) span.className = level;
                    span.textContent = text;
                    target.appendChild(span);
                }

                // 后端方法列表拿不到时的兜底选项
                function applyFallbackMethods(select) {
                    select.textContent = '';
                    [
                        { value: 'createOrder', label: '创建订单 (createOrder)' },
                        { value: 'custom', label: '自定义方法' }
                    ].forEach(item => {
                        const opt = document.createElement('option');
                        opt.value = item.value;
                        opt.textContent = item.label;
                        select.appendChild(opt);
                    });

                    methodExamples['createOrder'] = {
                        "method": "createOrder",
                        "params": {
                            "orderId": `ORDER_${Date.now()}`,
                            "amount": 100.00,
                            "productName": "测试商品"
                        }
                    };
                }

                // 获取方法列表并填充下拉框
                async function fetchMethods() {
                    const select = document.getElementById('method-select');

                    try {
                        const resp = await fetch('/router/methods', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        const json = await resp.json();

                        let list = [];
                        if (json && json.code === 200 && Array.isArray(json.data)) {
                            list = json.data;
                        }

                        // 清空并填充
                        select.textContent = '';
                        if (list.length === 0) {
                            // 后端未返回或为空，回退到默认选项
                            applyFallbackMethods(select);
                            return;
                        }

                        // 处理后端返回的各种格式：字符串或对象 { name, example }
                        list.forEach(item => {
                            if (typeof item === 'string') {
                                const opt = document.createElement('option');
                                opt.value = item;
                                opt.textContent = item;
                                select.appendChild(opt);
                            } else if (item && typeof item === 'object') {
                                const name = item.name || item.method || item.id;
                                if (!name) return;
                                const opt = document.createElement('option');
                                opt.value = name;
                                opt.textContent = name + (item.title ? ` — ${item.title}` : '');
                                select.appendChild(opt);
                                if (item.example) {
                                    methodExamples[name] = item.example;
                                } else if (item.exampleParams) {
                                    methodExamples[name] = item.exampleParams;
                                }
                            }
                        });

                        // 添加自定义选项
                        const customOpt = document.createElement('option');
                        customOpt.value = 'custom';
                        customOpt.textContent = '自定义方法';
                        select.appendChild(customOpt);

                        // 选中第一个（如果有）并触发参数填充
                        select.selectedIndex = 0;
                        updateMethodParams();
                    } catch (err) {
                        // 失败时回退到默认选项
                        applyFallbackMethods(select);
                        console.error('获取方法列表失败:', err);
                    }
                }

                // 复制到剪贴板功能
                async function copyToClipboard(contentId) {
                    const contentElement = contentId ? document.getElementById(contentId) : null;
                    if (!contentElement) return;
                    const textToCopy = contentElement.textContent || contentElement.innerText;

                    try {
                        await navigator.clipboard.writeText(textToCopy);
                        alert('已复制到剪贴板！');
                    } catch (err) {
                        // 降级方案：使用传统方法
                        const textArea = document.createElement('textarea');
                        textArea.value = textToCopy;
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {
                            document.execCommand('copy');
                            alert('已复制到剪贴板！');
                        } catch (err) {
                            alert('复制失败，请手动复制');
                        }
                        document.body.removeChild(textArea);
                    }
                }


                // 获取版本信息
                async function getVersion() {
                    const responseDiv = document.getElementById('version-response');
                    const contentDiv = document.getElementById('version-content');
                    if (!responseDiv || !contentDiv) return;

                    responseDiv.style.display = 'block';
                    renderResponse(contentDiv, '正在获取版本信息...', 'loading');

                    try {
                        const response = await fetch('/router/getVersion', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        const data = await response.json();
                        renderResponse(contentDiv, JSON.stringify(data, null, 2), 'success');
                    } catch (error) {
                        renderResponse(contentDiv, `请求失败: ${error.message}`, 'error');
                    }
                }

                // 调用开放接口
                async function callOpenApi() {
                    const method = document.getElementById('method-input').value.trim();
                    const paramsText = document.getElementById('params-input').value.trim();
                    const responseDiv = document.getElementById('open-response');
                    const contentDiv = document.getElementById('open-content');

                    if (!method) {
                        alert('请输入方法名称');
                        return;
                    }

                    let params;
                    try {
                        params = paramsText ? JSON.parse(paramsText) : {};
                    } catch (error) {
                        alert('参数格式错误，请输入有效的JSON格式');
                        return;
                    }

                    // 确保method参数存在
                    if (!params.method) {
                        params.method = method;
                    }

                    responseDiv.style.display = 'block';
                    renderResponse(contentDiv, '正在调用接口...', 'loading');

                    try {
                        const response = await fetch('/router/open', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(params)
                        });

                        const data = await response.json();
                        const statusClass = data.code === 200 ? 'success' : 'error';
                        renderResponse(contentDiv, JSON.stringify(data, null, 2), statusClass);
                    } catch (error) {
                        renderResponse(contentDiv, `请求失败: ${error.message}`, 'error');
                    }
                }

                // 修改：在更新方法参数时优先使用缓存的示例
                function updateMethodParams() {
                    const select = document.getElementById('method-select');
                    const methodInput = document.getElementById('method-input');
                    const paramsInput = document.getElementById('params-input');

                    const selectedValue = select.value;

                    if (selectedValue === 'custom') {
                        methodInput.value = '';
                        paramsInput.value = `{
  "method": "yourMethodName",
  "params": {
    "key1": "value1",
    "key2": "value2"
  }
}`;
                        return;
                    }

                    // 使用后端示例（如果存在）
                    if (methodExamples[selectedValue]) {
                        const example = methodExamples[selectedValue];
                        // 如果示例本身就是字符串/简单结构，保证method字段被设置
                        if (typeof example === 'string') {
                            methodInput.value = selectedValue;
                            paramsInput.value = example;
                        } else {
                            // 确保 example 中包含 method 字段
                            if (!example.method) {
                                example.method = selectedValue;
                            }
                            methodInput.value = selectedValue;
                            paramsInput.value = JSON.stringify(example, null, 2);
                        }
                        return;
                    }

                    // 无示例时使用通用模板（兼容原先 createOrder 行为）
                    methodInput.value = selectedValue;
                    if (selectedValue === 'createOrder') {
                        paramsInput.value = `{
  "method": "createOrder",
  "params": {
    "orderId": "ORDER_${Date.now()}",
    "amount": 100.00,
    "productName": "测试商品"
  }
}`;
                    } else if (selectedValue === 'findOrder') {
                        paramsInput.value = `{
  "method": "findOrder",
  "params": {
    "orderId": "ORDER_${Date.now()}"
  }
}`;
                    } else if (selectedValue === 'getSigner') {
                        paramsInput.value = `{
  "method": "getSigner",
  "params": {
    "test":"需要签名示例报文"
  }
}`;
                    }else if (selectedValue === 'homePageUrl') {
                        paramsInput.value = `{
  "method": "homePageUrl",
  "params": {
    "password":"密码",
    "username":"用户名"
  }
}`;
                    }
                    else {
                        paramsInput.value = `{
  "method": "${selectedValue}",
  "params": {
    "key1": "value1"
  }
}`;
                    }
                }

                // 清空响应结果
                function clearResponse(responseId) {
                    const responseDiv = responseId ? document.getElementById(responseId) : null;
                    if (responseDiv) responseDiv.style.display = 'none';
                }

                // 登出功能
                async function logout() {

                    stopHeartbeat(); // 停止心跳检测

                    try {
                        const response = await fetch('/auth/logout', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        const data = await response.json();
                        if (data.code === 200) {
                            alert('登出成功');
                            window.location.href = '/mobius.html';
                        } else {
                            alert('登出失败: ' + data.message);
                        }
                    } catch (error) {
                        alert('登出失败: ' + error.message);
                    }
                }


                // 执行税务检查
                async function performTaxCheck() {
                    const entName = document.getElementById('ent-name').value;
                    const taxNumber = document.getElementById('tax-number').value;
                    
                    if (!entName && !taxNumber) {
                        alert('请填写完整的企业信息');
                        return;
                    }

                    try {
                        const response = await fetch('/router/open', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                method: 'enttraCheck',
                                params: {
                                    entName: entName,
                                    taxNumber: taxNumber
                                }
                            })
                        });

                        const result = await response.json();

                        if (result.code === 200) {
                            // 显示查询结果
                            displayTaxResult(result);
                        } else {
                            alert(`查询失败: ${result.message || '未知错误'}`);
                        }
                    } catch (error) {
                        console.error('查询错误:', error);
                        alert(`查询失败: ${error.message}`);
                    }
                }

                // 显示查询结果
                function displayTaxResult(data) {
                    // 隐藏查询输入模态框
                    Modal.close('tax-query-modal');
                    
                    // 解析响应数据，提取Result中的指定字段
                    let nsrmc = '';
                    let nsrsbh = '';
                    let nsrztMc = '';
                    let swjgmc = '';
                    
                    // 数据结构是 data.data.Response.Data.Result (数组)
                    if (data && data.data && data.data.Response && data.data.Response.Data && data.data.Response.Data.Result) {
                        const result = data.data.Response.Data.Result;
                        
                        // Result 是一个数组
                        if (Array.isArray(result) && result.length > 0) {
                            const firstItem = result[0];
                            nsrmc = firstItem.nsrmc || '';
                            nsrsbh = firstItem.nsrsbh || '';
                            nsrztMc = firstItem.nsrztMc || '';
                            swjgmc = firstItem.swjgmc || '';
                        } else {
                            // 如果不是数组（虽然按文档应该是数组）
                            nsrmc = result.nsrmc || '';
                            nsrsbh = result.nsrsbh || '';
                            nsrztMc = result.nsrztMc || '';
                            swjgmc = result.swjgmc || '';
                        }
                    }

                    // 更新结果显示区域
                    document.getElementById('nsrmc-value').textContent = nsrmc;
                    document.getElementById('nsrsbh-value').textContent = nsrsbh;
                    document.getElementById('nsrztmc-value').textContent = nsrztMc;
                    document.getElementById('swjgmc-value').textContent = swjgmc;
                    
                    // 显示结果模态框
                    Modal.open('tax-result-modal');
                }

                // 检查登录状态（登录后调用 fetchMethods）
                async function checkLoginStatus() {
                    try {
                        const response = await fetch('/auth/status');
                        const data = await response.json();

                        if (data.code === 200 && data.data.isLoggedIn) {
                            // 显示用户信息
                            const userInfo = document.getElementById('user-info');
                            const logoutBtn = document.getElementById('logout-btn');

                            if (userInfo) userInfo.textContent = `欢迎，${data.data.username}`;
                            if (logoutBtn) logoutBtn.style.display = 'inline-block';

                            // 登录后获取方法列表
                            fetchMethods();
                        } else {
                            // 未登录，重定向到登录页面
                            window.location.href = '/mobius.html';
                        }
                    } catch (error) {
                        console.error('检查登录状态失败:', error);
                        window.location.href = '/mobius.html';
                    }
                }

                // 面板按钮统一走 data-action 委托，避免在 HTML 里写内联 onclick
                document.addEventListener('click', function (e) {
                    const trigger = e.target.closest ? e.target.closest('[data-action]') : null;
                    if (!trigger) return;

                    switch (trigger.dataset.action) {
                        case 'call-open-api':
                            callOpenApi();
                            break;
                        case 'clear-response':
                            clearResponse(trigger.dataset.target);
                            break;
                        case 'copy':
                            copyToClipboard(trigger.dataset.target);
                            break;
                        case 'logout':
                            logout();
                            break;
                        default:
                            break;
                    }
                });

                // 初始化事件监听器
                document.addEventListener('DOMContentLoaded', function () {
                    console.log('API测试工具已加载完成');

                    // 方法下拉框切换时同步填充示例参数
                    const methodSelect = document.getElementById('method-select');
                    if (methodSelect) {
                        methodSelect.addEventListener('change', updateMethodParams);
                    }

                    // 企业状态查询提交（关闭动作由 data-modal-close 统一处理）
                    const submitTaxQuery = document.getElementById('submit-tax-query');
                    if (submitTaxQuery) {
                        submitTaxQuery.addEventListener('click', performTaxCheck);
                    }

                    checkLoginStatus(); // 检查登录状态并在成功后加载方法列表
                    startHeartbeat();   // 开始心跳检测
                });