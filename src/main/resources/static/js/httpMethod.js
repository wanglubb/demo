// 新增：缓存后端返回的示例参数（如果有）
                const methodExamples = {};

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
                        select.innerHTML = '';
                        if (list.length === 0) {
                            // 后端未返回或为空，回退到默认选项
                            select.innerHTML = `
                        <option value="createOrder">创建订单 (createOrder)</option>
                        <option value="custom">自定义方法</option>
                    `;
                            // 保持默认示例
                            methodExamples['createOrder'] = {
                                "method": "createOrder",
                                "params": {
                                    "orderId": `ORDER_${Date.now()}`,
                                    "amount": 100.00,
                                    "productName": "测试商品"
                                }
                            };
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
                        select.innerHTML = `
                    <option value="createOrder">创建订单 (createOrder)</option>
                    <option value="custom">自定义方法</option>
                `;
                        methodExamples['createOrder'] = {
                            "method": "createOrder",
                            "params": {
                                "orderId": `ORDER_${Date.now()}`,
                                "amount": 100.00,
                                "productName": "测试商品"
                            }
                        };
                        console.error('获取方法列表失败:', err);
                    }
                }

                // 复制到剪贴板功能
                async function copyToClipboard(contentId) {
                    const contentElement = document.getElementById(contentId);
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

                    responseDiv.style.display = 'block';
                    contentDiv.innerHTML = '<span class="loading">正在获取版本信息...</span>';

                    try {
                        const response = await fetch('/router/getVersion', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        const data = await response.json();
                        contentDiv.innerHTML = `<span class="success">${JSON.stringify(data, null, 2)}</span>`;
                    } catch (error) {
                        contentDiv.innerHTML = `<span class="error">请求失败: ${error.message}</span>`;
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
                    contentDiv.innerHTML = '<span class="loading">正在调用接口...</span>';

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
                        contentDiv.innerHTML = `<span class="${statusClass}">${JSON.stringify(data, null, 2)}</span>`;
                    } catch (error) {
                        contentDiv.innerHTML = `<span class="error">请求失败: ${error.message}</span>`;
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
                    const responseDiv = document.getElementById(responseId);
                    responseDiv.style.display = 'none';
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
                            window.location.href = '/login.html';
                        } else {
                            alert('登出失败: ' + data.message);
                        }
                    } catch (error) {
                        alert('登出失败: ' + error.message);
                    }
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

                            userInfo.textContent = `欢迎，${data.data.username}`;
                            logoutBtn.style.display = 'inline-block';

                            // 登录后获取方法列表
                            fetchMethods();
                        } else {
                            // 未登录，重定向到登录页面
                            window.location.href = '/login.html';
                        }
                    } catch (error) {
                        console.error('检查登录状态失败:', error);
                        window.location.href = '/login.html';
                    }
                }

                // 加载页面检查登录状态
                document.addEventListener('DOMContentLoaded', function () {
                    console.log('API测试工具已加载完成');
                    checkLoginStatus(); // 检查登录状态并在成功后加载方法列表
                    startHeartbeat();   // 开始心跳检测
                });