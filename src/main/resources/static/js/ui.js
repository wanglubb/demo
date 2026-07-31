/**
 * Workbench UI helpers: command palette + reduced-motion-aware polish.
 * Keep business logic in index.js / httpMethod.js.
 */
(function () {
    const COMMANDS = [
        { id: 'tab-sample1', label: '快捷功能', idx: '01' },
        { id: 'tab-api', label: 'API 测试', idx: '02' },
        { id: 'tab-map', label: '数据地图', idx: '03' },
        { id: 'tab-articles', label: '文章', idx: '04' }
    ];

    const cmdk = document.getElementById('cmdk');
    const cmdkOpen = document.getElementById('cmdk-open');
    const cmdkInput = document.getElementById('cmdk-input');
    const cmdkList = document.getElementById('cmdk-list');
    let selected = 0;
    let filtered = COMMANDS.slice();

    function isOpen() {
        return cmdk && !cmdk.hasAttribute('hidden');
    }

    function renderList() {
        if (!cmdkList) return;
        cmdkList.innerHTML = '';
        filtered.forEach(function (cmd, i) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('aria-selected', i === selected ? 'true' : 'false');
            btn.innerHTML = '<span>' + cmd.label + '</span><span class="cmd-idx">' + cmd.idx + '</span>';
            btn.addEventListener('click', function () {
                runCommand(cmd);
            });
            li.appendChild(btn);
            cmdkList.appendChild(li);
        });
    }

    function openCmdk() {
        if (!cmdk) return;
        filtered = COMMANDS.slice();
        selected = 0;
        cmdk.removeAttribute('hidden');
        renderList();
        if (cmdkInput) {
            cmdkInput.value = '';
            cmdkInput.focus();
        }
    }

    function closeCmdk() {
        if (!cmdk) return;
        cmdk.setAttribute('hidden', '');
    }

    function runCommand(cmd) {
        const anchor = document.querySelector('.sidebar nav a[data-tab="' + cmd.id + '"]');
        if (typeof openTab === 'function') {
            openTab(cmd.id, anchor);
        }
        closeCmdk();
    }

    function onFilter() {
        const q = (cmdkInput.value || '').trim().toLowerCase();
        filtered = COMMANDS.filter(function (c) {
            return !q || c.label.toLowerCase().indexOf(q) !== -1 || c.idx.indexOf(q) !== -1;
        });
        selected = 0;
        renderList();
    }

    if (cmdkOpen) {
        cmdkOpen.addEventListener('click', openCmdk);
    }

    if (cmdk) {
        cmdk.addEventListener('click', function (e) {
            if (e.target && e.target.hasAttribute('data-cmdk-close')) {
                closeCmdk();
            }
        });
    }

    if (cmdkInput) {
        cmdkInput.addEventListener('input', onFilter);
        cmdkInput.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selected = Math.min(selected + 1, Math.max(filtered.length - 1, 0));
                renderList();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selected = Math.max(selected - 1, 0);
                renderList();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered[selected]) runCommand(filtered[selected]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeCmdk();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        const key = e.key && e.key.toLowerCase();
        if ((e.metaKey || e.ctrlKey) && key === 'k') {
            e.preventDefault();
            if (isOpen()) closeCmdk();
            else openCmdk();
        } else if (e.key === 'Escape' && isOpen()) {
            closeCmdk();
        }
    });
})();
