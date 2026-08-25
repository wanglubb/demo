// 页面加载完成后检查登录状态和版本号
document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();
    loadVersion();
});

// 获取并显示版本号（优先接口；失败则保留 HTML 构建期写入的版本）
async function loadVersion() {
    const el = document.getElementById('versionInfo');
    if (!el) return;

    // IDE 未走 Gradle expand 时清理占位符，避免显示 ${version}
    if (/\$\{version\}/.test(el.textContent)) {
        el.textContent = '';
    }

    try {
        // 相对当前页面解析，兼容反向代理/子路径部署（勿用绝对路径 /auth/version）
        const response = await fetch(new URL('auth/version', window.location.href));
        const data = await response.json();
        if (data.code === 200 && data.data && data.data.version) {
            el.textContent = '版本号: v' + data.data.version;
        }
    } catch (error) {
        console.log('获取版本号失败:', error);
    }
}

// 已登录则跳过登录页，直接进入工作台首页
async function checkLoginStatus() {
    try {
        const response = await fetch('/auth/status');
        const data = await response.json();

        if (data.code === 200 && data.data.isLoggedIn) {
            window.location.href = '/';
        }
    } catch (error) {
        console.log('检查登录状态失败:', error);
    }
}

// 登录表单提交：校验、请求 /auth/login，成功后跳转首页
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = document.getElementById('loginBtn');
    const idleLabel = loginBtn.dataset.idleLabel || loginBtn.textContent.trim();

    hideMessage();

    if (!username || !password) {
        showError('请输入用户名和密码');
        return;
    }

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
            showSuccess('登录成功，正在跳转...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showError(data.message || '登录失败');
        }
    } catch (error) {
        showError('网络错误，请稍后重试');
        console.error('登录请求失败:', error);
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = idleLabel;
    }
});

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

function hideMessage() {
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('success-message').style.display = 'none';
}

// 回车提交登录表单（与原 login 页行为一致）
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});
