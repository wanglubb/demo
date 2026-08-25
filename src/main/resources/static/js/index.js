/**
 * 工作台主脚本：标签页切换、快捷功能入口、模态框统一管理。
 * 页面结构中不再写内联 onclick，全部通过 data-* 属性 + 事件委托绑定。
 */

/* ------------------------------------------------------------------ *
 * 模态框统一管理
 * 只接管由 Modal.open 打开的弹窗，地图模块自行用 .active 控制的
 * #editModalOverlay 不受影响。
 * ------------------------------------------------------------------ */
var Modal = (function () {
	// 记录当前处于打开状态的弹窗 id，后开的排在末尾
	var openStack = [];

	function remember(id) {
		forget(id);
		openStack.push(id);
	}

	function forget(id) {
		var i = openStack.indexOf(id);
		if (i !== -1) openStack.splice(i, 1);
	}

	function open(id) {
		var el = document.getElementById(id);
		if (!el) {
			console.warn('模态框不存在:', id);
			return;
		}
		el.style.display = 'flex';
		remember(id);
	}

	function close(id) {
		if (!id) return;
		var el = document.getElementById(id);
		if (el) el.style.display = 'none';
		forget(id);
	}

	// 关闭最上层弹窗，供 Esc 使用
	function closeTop() {
		if (openStack.length) close(openStack[openStack.length - 1]);
	}

	function isManaged(el) {
		return !!el && openStack.indexOf(el.id) !== -1;
	}

	document.addEventListener('click', function (e) {
		// 任意带 data-modal-close 的元素都可关闭其所在弹窗
		var closer = e.target.closest ? e.target.closest('[data-modal-close]') : null;
		if (closer) {
			var explicitId = closer.getAttribute('data-modal-close');
			var host = closer.closest('.modal-overlay');
			close(explicitId || (host && host.id));
			return;
		}
		// 点击遮罩空白区域关闭
		if (e.target.classList && e.target.classList.contains('modal-overlay') && isManaged(e.target)) {
			close(e.target.id);
		}
	});

	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') closeTop();
	});

	return { open: open, close: close, closeTop: closeTop };
})();

/* ------------------------------------------------------------------ *
 * 标签页切换
 * ------------------------------------------------------------------ */
function openTab(tabId, anchor) {
	// 切换主体面板
	document.querySelectorAll('.tab-content').forEach(function (el) {
		el.classList.remove('active');
	});
	var target = document.getElementById(tabId);
	if (target) target.classList.add('active');

	// 切换侧边栏样式；未传入 anchor 时按 tabId 反查
	var activeAnchor = anchor || document.querySelector('.sidebar nav a[data-tab="' + tabId + '"]');
	document.querySelectorAll('.sidebar nav a').forEach(function (a) {
		a.classList.remove('active');
	});
	if (activeAnchor) activeAnchor.classList.add('active');
}

/* ------------------------------------------------------------------ *
 * 快捷功能
 * ------------------------------------------------------------------ */
function quickFunction(methodName) {
	if (methodName === 'checkTax') {
		Modal.open('tax-query-modal');
	} else if (methodName === 'getHomeUrl') {
		window.open('http://8.163.1.140:8080/router/toBJ');
	} else if (methodName === 'checkName') {
		showCheckNameModal();
	} else {
		alert('功能未开放');
	}
}

// 打开企业核名模态框，打开前清空上一次填写的内容
function showCheckNameModal() {
	var form = document.getElementById('check-name-form');
	if (form) form.reset();
	Modal.open('check-name-modal');
}

/* ------------------------------------------------------------------ *
 * 事件绑定
 * ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', function () {
	// 侧边栏导航：委托到 nav 上，新增菜单项无需再改 JS
	var nav = document.querySelector('.sidebar nav');
	if (nav) {
		nav.addEventListener('click', function (e) {
			var anchor = e.target.closest('a[data-tab]');
			if (!anchor) return;
			e.preventDefault();
			openTab(anchor.dataset.tab, anchor);
		});
	}

	// 快捷功能卡片：委托到卡片容器
	var grid = document.querySelector('.features-grid');
	if (grid) {
		grid.addEventListener('click', function (e) {
			var card = e.target.closest('[data-quick]');
			if (!card) return;
			quickFunction(card.dataset.quick);
		});
	}

	// 核名表单：按钮点击与回车提交走同一条路径
	var submitCheckName = document.getElementById('submit-check-name');
	if (submitCheckName) {
		submitCheckName.addEventListener('click', performCheckName);
	}

	var checkNameForm = document.getElementById('check-name-form');
	if (checkNameForm) {
		checkNameForm.addEventListener('submit', function (e) {
			e.preventDefault();
			performCheckName();
		});
	}
});

/* ------------------------------------------------------------------ *
 * 企业核名
 * ------------------------------------------------------------------ */
function performCheckName() {
	var areaname = document.getElementById('areaname').value.trim();
	var entname = document.getElementById('entname').value.trim();
	var enttra = document.getElementById('enttra').value.trim();
	var traind = document.getElementById('traind').value.trim();
	var dmvalue = document.getElementById('dmvalue').value.trim();

	if (!areaname || !entname || !enttra || !traind || !dmvalue) {
		alert('请填写所有必填项！');
		return;
	}

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
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			if (data.success) {
				showCheckNameResult(data.data, true);
			} else {
				showCheckNameResult(data.message, false);
			}
		})
		.catch(function (error) {
			console.error('Error:', error);
			showCheckNameResult('请求失败: ' + error.message, false);
		});
}

// 展示核名结果，非字符串结果统一序列化后按纯文本输出
function showCheckNameResult(message, isSuccess) {
	var text = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
	var messageEl = document.getElementById('check-name-result-message');
	if (messageEl) {
		messageEl.textContent = text || '';
		messageEl.className = 'result-message ' + (isSuccess ? 'result-message--success' : 'result-message--error');
	}

	Modal.close('check-name-modal');
	Modal.open('check-name-result-modal');
}
