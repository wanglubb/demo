function openTab(tabId, anchor) {
	// 切换主体面板
	document.querySelectorAll('.tab-content').forEach(function (el) {
		el.classList.remove('active');
	});
	var target = document.getElementById(tabId);
	if (target) target.classList.add('active');

	// 切换侧边栏样式
	document.querySelectorAll('.sidebar nav a').forEach(function (a) {
		a.classList.remove('active');
	});
	if (anchor) anchor.classList.add('active');
}

// 为快捷功能添加处理函数
function quickFunction(methodName) {

	if (methodName === 'checkTax') {
		showTaxQueryModal();
	} else if (methodName === 'getHomeUrl') {
		window.open('http://8.163.1.140:8080/router/toBJ');
	} else if (methodName === 'checkName') {
		showCheckNameModal();
	} else {
		alert('功能未开放');
		// 跳转到API测试页面并预设参数
		/* document.getElementById('method-input').value = methodName;
		openTab('tab-api', document.querySelector('[data-tab="tab-api"]')); */
	}


}

// 显示企业状态查询模态框
function showTaxQueryModal() {
	const modal = document.getElementById('tax-query-modal');
	modal.style.display = 'flex';
}

// 显示企业核名模态框
function showCheckNameModal() {
	// 清空表单
	document.getElementById('areaname').value = '';
	document.getElementById('entname').value = '';
	document.getElementById('enttra').value = '';
	document.getElementById('traind').value = '';
	document.getElementById('dmvalue').value = '';
	
	const modal = document.getElementById('check-name-modal');
	modal.style.display = 'flex';
}

// 保证在移动端或小屏下也能把主面板显示出来（当侧边栏被隐藏时）
window.addEventListener('resize', function () {
	// noop for now, placeholder for future extension
});

// 页面加载完成后绑定事件
document.addEventListener('DOMContentLoaded', function() {
	// 企业核名模态框相关事件
	const closeCheckNameModal = document.getElementById('close-check-name-modal');
	const cancelCheckName = document.getElementById('cancel-check-name');
	const submitCheckName = document.getElementById('submit-check-name');
	const checkNameResultModal = document.getElementById('check-name-result-modal');
	const closeCheckNameResultModal = document.getElementById('close-check-name-result-modal');
	const closeCheckNameAndBack = document.getElementById('close-check-name-and-back');
	
	if (closeCheckNameModal) {
		closeCheckNameModal.addEventListener('click', function() {
			document.getElementById('check-name-modal').style.display = 'none';
		});
	}
	
	if (cancelCheckName) {
		cancelCheckName.addEventListener('click', function() {
			document.getElementById('check-name-modal').style.display = 'none';
		});
	}
	
	if (submitCheckName) {
		submitCheckName.addEventListener('click', function() {
			performCheckName();
		});
	}
	
	if (closeCheckNameResultModal) {
		closeCheckNameResultModal.addEventListener('click', function() {
			document.getElementById('check-name-result-modal').style.display = 'none';
		});
	}
	
	if (closeCheckNameAndBack) {
		closeCheckNameAndBack.addEventListener('click', function() {
			document.getElementById('check-name-result-modal').style.display = 'none';
		});
	}
	
	// 监听表单提交事件
	const checkNameForm = document.getElementById('check-name-form');
	if (checkNameForm) {
		checkNameForm.addEventListener('submit', function(e) {
			e.preventDefault(); // 阻止默认表单提交行为
			performCheckName();
		});
	}
});

// 执行企业核名检查
function performCheckName() {
	const areaname = document.getElementById('areaname').value.trim();
	const entname = document.getElementById('entname').value.trim();
	const enttra = document.getElementById('enttra').value.trim();
	const traind = document.getElementById('traind').value.trim();
	const dmvalue = document.getElementById('dmvalue').value.trim();
	
	if (!areaname || !entname || !enttra || !traind || !dmvalue) {
		alert('请填写所有必填项！');
		return;
	}
	
	// 调用API接口进行核名检查
	fetch('/router/open', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			method: 'checkCompanyNameForBJ',
			params: {
				entname: entname,
				enttra: enttra,
				traind: traind,
				dmvalue: dmvalue
			}
		})
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			showCheckNameResult(data.data, true);
		} else {
			showCheckNameResult(data.message, false);
		}
	})
	.catch(error => {
		console.error('Error:', error);
		showCheckNameResult('请求失败: ' + error.message, false);
	});
}

// 显示核名结果
function showCheckNameResult(message, isSuccess) {
	document.getElementById('check-name-result-message').textContent = message;
	document.getElementById('check-name-result-message').style.color = isSuccess ? '#28a745' : '#dc3545';
	
	const modal = document.getElementById('check-name-result-modal');
	modal.style.display = 'flex';
	
	// 关闭核名输入模态框
	document.getElementById('check-name-modal').style.display = 'none';
}