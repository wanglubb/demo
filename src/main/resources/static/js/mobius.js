/* 简化版莫比乌斯环 · 纯线条线框渲染（Canvas 2D 手写投影，无第三方依赖） */
(function () {
    'use strict';

    var canvas = document.getElementById('mobius-canvas');
    if (!canvas) { return; }
    var ctx = canvas.getContext('2d');

    /* ---------- 几何与视觉参数 ---------- */
    var R = 1.0;            // 中心圆半径
    var HALF_W = 0.38;      // 带宽的一半（v 的取值范围 ±HALF_W）
    var EDGE_STEPS = 560;   // 边界曲线采样段数（u 从 0 走到 4π 才闭合）
    var MID_STEPS = 300;    // 纵向辅助线采样段数
    var RULINGS = 56;       // 横向母线数量
    var CAM_Z = 3.5;        // 相机距离（透视投影用）
    var FOV = 2.15;         // 视野系数
    var DEPTH_BUCKETS = 10; // 深度分层数：同层线段合并成一次 stroke，避免逐段描边

    /* 三组线的视觉层级：边界最亮最粗，母线最弱最细；curve 控制远近明暗过渡的陡缓 */
    var STYLES = {
        edge: { alphaFar: 0.30, alphaNear: 1.0, widthFar: 0.8, widthNear: 1.9, curve: 1.0 },
        mid: { alphaFar: 0.14, alphaNear: 0.64, widthFar: 0.55, widthNear: 1.1, curve: 1.3 },
        rule: { alphaFar: 0.10, alphaNear: 0.46, widthFar: 0.5, widthNear: 0.9, curve: 1.5 }
    };

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var state = {
        spin: 0.6,                                  // 绕竖直轴的自转角
        tilt: -0.46,                                // 俯仰角
        spinSpeed: reduceMotion ? 0.00008 : 0.00028, // 每毫秒自转弧度（降低动效偏好时放慢）
        dragging: false,
        lastX: 0,
        lastY: 0,
        dragSpin: 0,                                // 拖拽产生的额外角速度（带惯性衰减）
        tracer: 0,                                  // 沿边界行走的高亮标记位置（u 值）
        w: 0,
        h: 0,
        dpr: 1
    };

    /* ---------- 莫比乌斯环参数方程 ---------- */
    /* u 为沿环行进的角度，v 为横向位置；u 每走 2π，横截面翻转 180°，
       因此 v=常数 的曲线需要 u 走满 4π 才会闭合——这正是「只有一条边」的由来。 */
    function surface(u, v, out) {
        var half = u * 0.5;
        var r = R + v * Math.cos(half);
        out[0] = r * Math.cos(u);
        out[1] = r * Math.sin(u);
        out[2] = v * Math.sin(half);
        return out;
    }

    /* ---------- 预生成所有线段（模型空间，只构建一次） ---------- */
    /* 每条线段用 6 个数字紧凑存放：x1,y1,z1,x2,y2,z2 */
    function buildLoop(v, steps, span) {
        var seg = new Float32Array(steps * 6);
        var a = [0, 0, 0], b = [0, 0, 0];
        surface(0, v, a);
        for (var i = 1; i <= steps; i++) {
            surface(span * i / steps, v, b);
            var o = (i - 1) * 6;
            seg[o] = a[0]; seg[o + 1] = a[1]; seg[o + 2] = a[2];
            seg[o + 3] = b[0]; seg[o + 4] = b[1]; seg[o + 5] = b[2];
            a[0] = b[0]; a[1] = b[1]; a[2] = b[2];
        }
        return seg;
    }

    /* 横向母线：把带面切成一根根细横线，保证「线条感」而不是实体块 */
    function buildRulings() {
        var seg = new Float32Array(RULINGS * 6);
        var a = [0, 0, 0], b = [0, 0, 0];
        for (var i = 0; i < RULINGS; i++) {
            var u = Math.PI * 2 * i / RULINGS;
            surface(u, -HALF_W, a);
            surface(u, HALF_W, b);
            var o = i * 6;
            seg[o] = a[0]; seg[o + 1] = a[1]; seg[o + 2] = a[2];
            seg[o + 3] = b[0]; seg[o + 4] = b[1]; seg[o + 5] = b[2];
        }
        return seg;
    }

    var TWO_PI = Math.PI * 2;
    var geometry = [
        { style: 'rule', data: buildRulings() },
        { style: 'mid', data: buildLoop(0, MID_STEPS, TWO_PI) },                    // 中线
        { style: 'mid', data: buildLoop(HALF_W * 0.55, MID_STEPS * 2, TWO_PI * 2) },
        { style: 'edge', data: buildLoop(HALF_W, EDGE_STEPS, TWO_PI * 2) }          // 唯一的边界（走两圈才闭合）
    ];

    /* ---------- 投影 ---------- */
    var proj = { x: 0, y: 0, depth: 0 };
    var cs, ss, ct, st, scale, cx, cy;

    /* 每帧刷新旋转量与画布中心，避免在内层循环里重复计算三角函数 */
    function updateCamera() {
        cs = Math.cos(state.spin); ss = Math.sin(state.spin);
        ct = Math.cos(state.tilt); st = Math.sin(state.tilt);
        cx = state.w * 0.5;
        cy = state.h * 0.475; // 略微上移，抵消透视下近处放大带来的视觉下坠
        scale = Math.min(state.w, state.h) * 0.40;
    }

    /* 先绕竖直轴自转，再俯仰，最后透视投影；depth 为 0(最远)~1(最近) */
    function project(x, y, z) {
        var x1 = x * cs + y * ss;
        var y1 = -x * ss + y * cs;
        var y2 = y1 * ct - z * st;
        var z2 = y1 * st + z * ct;
        var f = FOV / (CAM_Z - z2);
        proj.x = cx + x1 * f * scale;
        proj.y = cy - y2 * f * scale;
        proj.depth = (z2 + 1.45) / 2.9;
        if (proj.depth < 0) { proj.depth = 0; } else if (proj.depth > 1) { proj.depth = 1; }
        return proj;
    }

    /* ---------- 绘制 ---------- */
    var lineRGB = '236 236 233';
    var gain = 1;

    /* 线条颜色与不透明度增益都取自 CSS 变量：深底靠微光、浅底需要更实的墨色 */
    function syncColor() {
        var style = getComputedStyle(canvas);
        var v = style.getPropertyValue('--mobius-line').trim();
        if (v) { lineRGB = v; }
        var g = parseFloat(style.getPropertyValue('--mobius-gain'));
        gain = isNaN(g) ? 1 : g;
    }

    /* 按深度分层收集线段，再由远及近整层描边：既有前后遮挡观感，一帧又只需十几次 stroke */
    var buckets = [];
    for (var i = 0; i < DEPTH_BUCKETS; i++) { buckets.push([]); }

    function drawGroup(seg, style) {
        for (var b = 0; b < DEPTH_BUCKETS; b++) { buckets[b].length = 0; }

        for (var s = 0; s < seg.length; s += 6) {
            var p = project(seg[s], seg[s + 1], seg[s + 2]);
            var x1 = p.x, y1 = p.y, d1 = p.depth;
            p = project(seg[s + 3], seg[s + 4], seg[s + 5]);
            var idx = (((d1 + p.depth) * 0.5) * (DEPTH_BUCKETS - 1)) | 0;
            buckets[idx].push(x1, y1, p.x, p.y);
        }

        for (var b2 = 0; b2 < DEPTH_BUCKETS; b2++) {
            var list = buckets[b2];
            if (!list.length) { continue; }
            var t = b2 / (DEPTH_BUCKETS - 1);
            var e = Math.pow(t, style.curve);
            ctx.beginPath();
            for (var k = 0; k < list.length; k += 4) {
                ctx.moveTo(list[k], list[k + 1]);
                ctx.lineTo(list[k + 2], list[k + 3]);
            }
            var alpha = Math.min(1, (style.alphaFar + (style.alphaNear - style.alphaFar) * e) * gain);
            ctx.strokeStyle = 'rgb(' + lineRGB + ' / ' + alpha.toFixed(3) + ')';
            ctx.lineWidth = style.widthFar + (style.widthNear - style.widthFar) * t;
            ctx.stroke();
        }
    }

    /* 沿唯一边界滑动的一小段高亮弧：要走满两圈才回到原点，直观说明「单边」 */
    function drawTracer() {
        var span = 0.6, steps = 28;
        var pt = [0, 0, 0];
        ctx.beginPath();
        for (var i = 0; i <= steps; i++) {
            surface(state.tracer + span * i / steps, HALF_W, pt);
            var p = project(pt[0], pt[1], pt[2]);
            if (i === 0) { ctx.moveTo(p.x, p.y); } else { ctx.lineTo(p.x, p.y); }
        }
        ctx.strokeStyle = 'rgb(' + lineRGB + ' / 1)';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        surface(state.tracer + span, HALF_W, pt);
        var head = project(pt[0], pt[1], pt[2]);
        ctx.beginPath();
        ctx.arc(head.x, head.y, 3.4, 0, TWO_PI);
        ctx.strokeStyle = 'rgb(' + lineRGB + ' / 0.9)';
        ctx.lineWidth = 1.1;
        ctx.stroke();
    }

    function render() {
        ctx.clearRect(0, 0, state.w, state.h);
        updateCamera();
        ctx.lineCap = 'round';
        for (var i = 0; i < geometry.length; i++) {
            drawGroup(geometry[i].data, STYLES[geometry[i].style]);
        }
        drawTracer();
    }

    /* ---------- 主循环 ---------- */
    var last = 0;

    function frame(now) {
        var dt = last ? Math.min(now - last, 48) : 16;
        last = now;

        if (!state.dragging) {
            state.spin += (state.spinSpeed + state.dragSpin) * dt;
            state.dragSpin *= Math.pow(0.94, dt / 16); // 拖拽惯性缓慢衰减，回到匀速自转
        }
        state.tracer = (state.tracer + 0.00055 * dt) % (TWO_PI * 2);

        render();
        requestAnimationFrame(frame);
    }

    /* ---------- 尺寸与交互 ---------- */
    function resize() {
        var rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) { return; }
        state.dpr = Math.min(window.devicePixelRatio || 1, 2);
        state.w = rect.width;
        state.h = rect.height;
        canvas.width = Math.round(rect.width * state.dpr);
        canvas.height = Math.round(rect.height * state.dpr);
        ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
        render();
    }

    canvas.addEventListener('pointerdown', function (e) {
        state.dragging = true;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        canvas.classList.add('is-grabbing');
    });

    /* 横向拖拽改变自转角并留下惯性，纵向拖拽调整俯角（限制在合理范围内） */
    canvas.addEventListener('pointermove', function (e) {
        if (!state.dragging) { return; }
        var dx = e.clientX - state.lastX;
        var dy = e.clientY - state.lastY;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        state.spin += dx * 0.007;
        state.tilt = Math.max(-1.35, Math.min(1.35, state.tilt + dy * 0.006));
        state.dragSpin = Math.max(-0.004, Math.min(0.004, dx * 0.0002));
        render();
    });

    function endDrag(e) {
        if (!state.dragging) { return; }
        state.dragging = false;
        if (e && e.pointerId != null && canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
        }
        canvas.classList.remove('is-grabbing');
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    /* 明暗反相：只切换 data 属性，颜色全部由 CSS 变量驱动 */
    var invertBtn = document.getElementById('invert-btn');
    if (invertBtn) {
        invertBtn.addEventListener('click', function () {
            var root = document.documentElement;
            var next = root.getAttribute('data-theme') === 'paper' ? 'ink' : 'paper';
            root.setAttribute('data-theme', next);
            invertBtn.setAttribute('aria-pressed', String(next === 'paper'));
            syncColor();
            render();
        });
    }

    if (window.ResizeObserver) {
        new ResizeObserver(resize).observe(canvas);
    } else {
        window.addEventListener('resize', resize);
    }

    syncColor();
    resize();
    requestAnimationFrame(frame);
})();
