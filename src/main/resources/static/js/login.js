// 页面加载完成后检查登录状态
document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();
});

// 检查登录状态
async function checkLoginStatus() {
    try {
        const response = await fetch('/auth/status');
        const data = await response.json();

        if (data.code === 200 && data.data.isLoggedIn) {
            // 已登录，重定向到首页
            window.location.href = '/';
        }
    } catch (error) {
        console.log('检查登录状态失败:', error);
    }
}

// 登录表单提交处理
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');

    // 隐藏之前的消息
    hideMessage();

    // 验证输入
    if (!username || !password) {
        showError('请输入用户名和密码');
        return;
    }

    // 显示加载状态
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loading"></span>登录中...';

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (data.code === 200) {
            // 登录成功
            showSuccess('登录成功，正在跳转...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            // 登录失败
            showError(data.message || '登录失败');
        }
    } catch (error) {
        showError('网络错误，请稍后重试');
        console.error('登录请求失败:', error);
    } finally {
        // 恢复按钮状态
        loginBtn.disabled = false;
        loginBtn.innerHTML = '登录';
    }
});

// 显示错误消息
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// 显示成功消息
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

// 隐藏消息
/**
 * 隐藏错误和成功消息的函数
 * 该函数通过获取页面上ID为'error-message'和'success-message'的元素
 * 并将它们的display样式设置为'none'来实现消息的隐藏
 */
/**
    // 获取ID为'error-message'的元素并将其隐藏
 * 隐藏错误消息和成功消息的函数
    // 获取ID为'success-message'的元素并将其隐藏
 * 该函数通过获取DOM元素并修改其style.display属性来实现消息的隐藏
 */
function hideMessage() {
    // 隐藏错误消息元素，将其display样式设置为'none'
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('success-message').style.display = 'none';
}

// 回车键登录
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});