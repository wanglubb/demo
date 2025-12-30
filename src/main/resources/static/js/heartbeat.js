// 心跳检测间隔（毫秒）
const HEARTBEAT_INTERVAL = 5000;
let heartbeatTimer = null;

// 开始心跳检测
function startHeartbeat() {
    // 立即执行一次
    checkHeartbeat();
    
    // 设置定时器
    heartbeatTimer = setInterval(checkHeartbeat, HEARTBEAT_INTERVAL);
}

// 停止心跳检测
function stopHeartbeat() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}

// 检查心跳
async function checkHeartbeat() {
    const statusIndicator = document.getElementById('status-indicator');
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = document.getElementById('status-text');

    try {
        const response = await fetch('/router/getVersion', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok) {
            // 更新状态指示器
            statusDot.classList.add('online');
            statusDot.classList.remove('offline');
            statusText.textContent = '在线';
            
        } else {
            // 更新状态指示器
            statusDot.classList.remove('online');
            statusDot.classList.add('offline');
            statusText.textContent = '离线';
            
        }
        
        
    } catch (error) {
        // 更新状态指示器
        statusDot.classList.remove('online');
        statusDot.classList.add('offline');
        statusText.textContent = '离线';
        
    }
}