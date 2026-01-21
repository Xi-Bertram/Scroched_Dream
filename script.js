/* ================== 基础初始化 ================== */
const canvas = document.getElementById("pvCanvas");
const ctx = canvas.getContext("2d");
canvas.width = canvas.parentElement.clientWidth;
canvas.height = 420;
const R = 8.314;
const n = 1;
const gamma = 1.4;
let currentData = [];
let currentScale = {};
let currentCycleSegments = [];
// 活塞动画相关变量（新增核心）
let pistonAnimationId = null;
let currentAnimationFrame = 0;
// 新增：高亮模式状态变量（false=曲线颜色模式，true=活塞同步高亮模式）
let highlightMode = false;
/* ================== DOM元素获取 ================== */
// 基础元素
const cycleType = document.getElementById("cycleType");
const processType = document.getElementById("processType");
const processTypeLabel = document.getElementById("processTypeLabel");
const P1 = document.getElementById("P1");
const V1 = document.getElementById("V1");
const P2 = document.getElementById("P2");
const V2 = document.getElementById("V2");
const carnotP1 = document.getElementById("carnotP1");
const carnotV1 = document.getElementById("carnotV1");
const carnotTh = document.getElementById("carnotTh");
const carnotTc = document.getElementById("carnotTc");
const carnotExpansionRatio = document.getElementById("carnotExpansionRatio");
const ottoP1 = document.getElementById("ottoP1");
const ottoV1 = document.getElementById("ottoV1");
const ottoCompressionRatio = document.getElementById("ottoCompressionRatio");
const ottoPressureRatio = document.getElementById("ottoPressureRatio");
const runBtn = document.getElementById("runBtn");
const Wout = document.getElementById("Wout");
const Uout = document.getElementById("Uout");
const Qout = document.getElementById("Qout");
const etaOut = document.getElementById("etaOut");
// 新增：高亮切换按钮
const toggleHighlightBtn = document.getElementById("toggleHighlightBtn");
// 活塞动画元素（新增）
const pistonCylinder = document.getElementById("pistonCylinder");
const pistonHead = document.getElementById("pistonHead");
const pistonPressure = document.getElementById("pistonPressure");
// 知识点面板元素（新增）
const knowledgeContent = document.getElementById("knowledgeContent");
/* ================== 知识点数据（新增） ================== */
const knowledgePoints = {
    isothermal: [
        { title: "玻意耳定律", content: "一定质量的气体，在温度不变时，压强与体积成反比（P₁V₁ = P₂V₂）" },
        { title: "内能变化", content: "理想气体内能只与温度有关，等温过程中ΔU = 0" },
        { title: "能量关系", content: "Q = W，吸收的热量全部用于对外做功" }
    ],
    isobaric: [
        { title: "盖-吕萨克定律", content: "等压过程中，体积与热力学温度成正比（V₁/T₁ = V₂/T₂）" },
        { title: "做功计算", content: "W = PΔV，功等于压强乘以体积变化量" },
        { title: "热量计算", content: "Q = nCpΔT，Cp为定压摩尔热容" }
    ],
    isochoric: [
        { title: "查理定律", content: "等容过程中，压强与热力学温度成正比（P₁/T₁ = P₂/T₂）" },
        { title: "做功特点", content: "体积不变，不对外做功（W = 0）" },
        { title: "能量关系", content: "Q = ΔU，吸收的热量全部用于增加内能" }
    ],
    adiabatic: [
        { title: "绝热方程", content: "PV^γ = 常数，γ为比热容比" },
        { title: "热量特点", content: "与外界无热量交换（Q = 0）" },
        { title: "能量关系", content: "ΔU = -W，内能变化等于外界对系统做的功" }
    ],
    carnot: [
        { title: "循环组成", content: "由两个等温过程和两个绝热过程组成" },
        { title: "效率公式", content: "η = 1 - Tc/Th，仅与高低温热源温度有关" },
        { title: "可逆性", content: "理想的可逆循环，是热机效率的理论上限" }
    ],
    otto: [
        { title: "循环组成", content: "由两个绝热过程和两个等容过程组成" },
        { title: "应用场景", content: "汽油机的工作原理基础" },
        { title: "效率公式", content: "η = 1 - 1/r^(γ-1)，r为压缩比" }
    ]
};
/* ================== 介绍文本数据 ================== */
const processIntroductions = {
    isothermal: {
        title: "等温过程",
        content: "等温过程是指热力学系统在恒定温度下发生的过程。在理想气体的等温过程中，压强与体积成反比，满足玻意耳定律：P₁V₁ = P₂V₂。此过程中系统的内能保持不变，吸收的热量全部用于对外做功。"
    },
    isobaric: {
        title: "等压过程",
        content: "等压过程是指热力学系统在压强保持不变的条件下发生的过程。在等压过程中，系统体积的变化与温度变化成正比，遵循盖-吕萨克定律。此过程中系统对外做功，同时内能发生变化，吸收或放出的热量等于内能变化与做功之和。"
    },
    isochoric: {
        title: "等容过程",
        content: "等容过程是指热力学系统体积保持不变的过程，也称为等体过程。在等容过程中，系统不对外做功，吸收或放出的热量全部用于改变系统的内能。理想气体的等容过程遵循查理定律，压强与温度成正比。"
    },
    adiabatic: {
        title: "绝热过程",
        content: "绝热过程是指系统与外界没有热量交换的过程。在绝热过程中，系统对外做功全部来自内能的减少，或外界对系统做功全部转化为系统的内能。理想气体的绝热过程满足PV^γ = 常数，其中γ为比热容比。"
    }
};
const cycleIntroductions = {
    single: {
        title: "单一过程",
        content: "单一过程是指系统从初始状态经过一个热力学过程到达终态的变化。可以是等温、等压、等容或绝热过程中的一种，用于研究特定条件下系统的能量变化和做功情况。"
    },
    carnot: {
        title: "卡诺循环",
        content: "卡诺循环是一种理想的热机循环，由两个等温过程和两个绝热过程组成。它是热力学中效率最高的循环，其效率仅与高温热源和低温热源的温度有关，为1-Tc/Th。卡诺循环为热机效率设立了理论上限。"
    },
    otto: {
        title: "奥托循环",
        content: "奥托循环是四冲程内燃机的工作循环，由两个绝热过程和两个等容过程组成。包括进气、压缩、做功和排气四个冲程，是汽油机的工作原理基础。其热效率主要取决于压缩比，压缩比越高效率越高。"
    }
};
/* ================== 类型选择与参数组联动 ================== */
function updateParamGroupVisibility() {
    const cycle = cycleType.value;
    // 隐藏所有参数组
    document.querySelectorAll('.param-group').forEach(group => {
        group.classList.remove('active');
    });
    // 显示当前循环类型对应的参数组
    document.getElementById(`${cycle}ParamGroup`).classList.add('active');
    // 控制过程类型选择的显示/隐藏
    if (cycle === 'single') {
        processType.style.display = 'block';
        processTypeLabel.style.display = 'block';
    } else {
        processType.style.display = 'none';
        processTypeLabel.style.display = 'none';
    }
    // 更新介绍文本和知识点
    updateIntroduction();
    updateKnowledgePoints();
    // 单一过程时更新输入框状态
    if (cycle === 'single') {
        updateSingleProcessInputs();
    }
    // 隐藏/显示效率结果
    etaOut.parentElement.style.display = cycle === 'single' ? 'none' : 'inline-block';
}
// 单一过程输入框联动更新
function updateSingleProcessInputs() {
    const type = processType.value;
    P2.disabled = false;
    V2.disabled = false;
    P2.value = "";
    if (type === "isothermal") {
        P2.disabled = true;
        P2.value = "由等温方程计算";
    }
    if (type === "isobaric") {
        P2.disabled = true;
        P2.value = P1.value;
    }
    if (type === "isochoric") {
        V2.disabled = true;
        V2.value = V1.value;
    }
    if (type === "adiabatic") {
        P2.disabled = true;
        P2.value = "由绝热方程计算";
    }
}
// 更新介绍文本
function updateIntroduction() {
    const cycle = cycleType.value;
    let intro;
    if (cycle === 'single') {
        intro = processIntroductions[processType.value];
    } else {
        intro = cycleIntroductions[cycle];
    }
    // 淡入淡出动画
    const introContent = document.getElementById('introContent');
    introContent.classList.add('fade-out');
    setTimeout(() => {
        document.getElementById('introTitle').textContent = intro.title;
        introContent.textContent = intro.content;
        introContent.classList.remove('fade-out');
    }, 500);
}
// 更新知识点面板（新增）
function updateKnowledgePoints() {
    const cycle = cycleType.value;
    let points;
    
    if (cycle === 'single') {
        points = knowledgePoints[processType.value];
    } else {
        points = knowledgePoints[cycle];
    }
    
    knowledgeContent.innerHTML = '';
    points.forEach(point => {
        const item = document.createElement('div');
        item.className = 'knowledge-item';
        item.innerHTML = `<strong>${point.title}</strong>：${point.content}`;
        knowledgeContent.appendChild(item);
    });
}
/* ================== 坐标映射 ================== */
function xMap(V, Vmin, Vmax) {
    return 60 + (V - Vmin) / (Vmax - Vmin) * (canvas.width - 120);
}
function yMap(P, Pmin, Pmax) {
    return canvas.height - 50 - (P - Pmin) / (Pmax - Pmin) * (canvas.height - 100);
}
/* ================== 绘制坐标轴 ================== */
function drawAxes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 绘制坐标轴
    ctx.strokeStyle = "#E6F5E6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 50);
    ctx.lineTo(canvas.width - 30, canvas.height - 50);
    ctx.moveTo(50, canvas.height - 50);
    ctx.lineTo(50, 30);
    ctx.stroke();
    // 绘制坐标轴标签
    ctx.fillStyle = "#555555";
    ctx.font = "14px 'Noto Sans SC', sans-serif";
    ctx.fillText("V (m³)", canvas.width - 40, canvas.height - 35);
    ctx.save();
    ctx.translate(35, canvas.height - 60);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("P (Pa)", 0, 0);
    ctx.restore();
}
/* ================== 生成过程数据 ================== */
// 等温过程
function genIsothermal(P1, V1, V2, steps = 150) {
    let arr = [];
    for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let V = V1 + (V2 - V1) * t;
        let P = P1 * V1 / V;
        arr.push({ P, V });
    }
    return { data: arr, type: 'isothermal' };
}
// 等压过程
function genIsobaric(P, V1, V2, steps = 150) {
    let arr = [];
    for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let V = V1 + (V2 - V1) * t;
        arr.push({ P, V });
    }
    return { data: arr, type: 'isobaric' };
}
// 等容过程
function genIsochoric(P1, P2, V, steps = 150) {
    let arr = [];
    for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let P = P1 + (P2 - P1) * t;
        arr.push({ P, V });
    }
    return { data: arr, type: 'isochoric' };
}
// 绝热过程
function genAdiabatic(P1, V1, V2, steps = 150) {
    let arr = [];
    for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let V = V1 + (V2 - V1) * t;
        let P = P1 * Math.pow(V1 / V, gamma);
        arr.push({ P, V });
    }
    return { data: arr, type: 'adiabatic' };
}
/* ================== 循环生成 ================== */
// 卡诺循环
function simulateCarnot() {
    const P1v = +carnotP1.value;
    const V1v = +carnotV1.value;
    const Th = +carnotTh.value;
    const Tc = +carnotTc.value;
    const expansionRatio = +carnotExpansionRatio.value;
    const V2v = V1v * expansionRatio;
    const P2v = P1v * V1v / V2v;
    const V3v = V2v * Math.pow(Th / Tc, 1 / (gamma - 1));
    const P3v = P2v * Math.pow(V2v / V3v, gamma);
    const V4v = V1v * Math.pow(Th / Tc, 1 / (gamma - 1));
    const P4v = P3v * V3v / V4v;
    const segment1 = genIsothermal(P1v, V1v, V2v);
    const segment2 = genAdiabatic(P2v, V2v, V3v);
    const segment3 = genIsothermal(P3v, V3v, V4v);
    const segment4 = genAdiabatic(P4v, V4v, V1v);
    return [segment1, segment2, segment3, segment4];
}
// 奥托循环
function simulateOtto() {
    const P1v = +ottoP1.value;
    const V1v = +ottoV1.value;
    const compressionRatio = +ottoCompressionRatio.value;
    const pressureRatio = +ottoPressureRatio.value;
    const V2v = V1v / compressionRatio;
    const P2v = P1v * Math.pow(V1v / V2v, gamma);
    const P3v = P2v * pressureRatio;
    const V3v = V2v;
    const V4v = V1v;
    const P4v = P3v * Math.pow(V3v / V4v, gamma);
    const segment1 = genAdiabatic(P1v, V1v, V2v);
    const segment2 = genIsochoric(P2v, P3v, V2v);
    const segment3 = genAdiabatic(P3v, V3v, V4v);
    const segment4 = genIsochoric(P4v, P1v, V4v);
    return [segment1, segment2, segment3, segment4];
}
/* ================== 活塞动画核心函数（新增） ================== */
// 初始化活塞动画
function initPistonAnimation() {
    // 停止当前动画
    if (pistonAnimationId) {
        cancelAnimationFrame(pistonAnimationId);
    }
    
    currentAnimationFrame = 0;
    animatePiston();
}
// 活塞动画主函数
function animatePiston() {
    if (currentData.length === 0) {
        pistonAnimationId = requestAnimationFrame(animatePiston);
        return;
    }
    
    // 计算当前帧在数据中的位置（循环播放）
    const frameIndex = currentAnimationFrame % currentData.length;
    const dataPoint = currentData[frameIndex];
    
    // 更新活塞位置（体积越大，活塞位置越靠上）
    const Vmin = currentScale.Vmin;
    const Vmax = currentScale.Vmax;
    const volumeRatio = (dataPoint.V - Vmin) / (Vmax - Vmin);
    const maxPistonTop = pistonCylinder.clientHeight - 30;
    pistonHead.style.bottom = `${(1 - volumeRatio) * maxPistonTop + 10}px`;
    
    // 更新压强显示
    pistonPressure.textContent = `${Math.round(dataPoint.P)} Pa`;
    
    // 根据温度变化更新活塞内部颜色（冷→蓝，热→红）
    const temperature = (dataPoint.P * dataPoint.V) / (n * R);
    const tempMin = (currentScale.Pmin * currentScale.Vmin) / (n * R);
    const tempMax = (currentScale.Pmax * currentScale.Vmax) / (n * R);
    const tempRatio = (temperature - tempMin) / (tempMax - tempMin);
    const hue = 240 - tempRatio * 240; // 蓝色(240) → 红色(0)
    pistonCylinder.style.background = `hsl(${hue}, 60%, 85%)`;
    
    // 新增：只有高亮模式开启时才更新PV图高亮点
    if (highlightMode) {
        highlightCurrentPoint(frameIndex);
    } else if (currentCycleSegments.length > 0) {
        // 高亮模式关闭时，绘制原始彩色曲线
        redrawOriginalCurves();
    }
    
    // 继续动画
    currentAnimationFrame++;
    pistonAnimationId = requestAnimationFrame(animatePiston);
}
// PV图高亮点绘制（同步活塞动画）
function highlightCurrentPoint(index) {
    // 重新绘制曲线和坐标轴
    drawAxes();
    // 高亮模式下使用统一曲线颜色
    ctx.strokeStyle = "#F8E0E6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    currentData.forEach((d, i) => {
        const x = xMap(d.V, currentScale.Vmin, currentScale.Vmax);
        const y = yMap(d.P, currentScale.Pmin, currentScale.Pmax);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // 绘制起点和终点
    drawPoint(currentData[0], "起点");
    drawPoint(currentData.at(-1), "终点", true);
    
    // 绘制当前高亮点（脉冲动画）
    const currentPoint = currentData[index];
    const x = xMap(currentPoint.V, currentScale.Vmin, currentScale.Vmax);
    const y = yMap(currentPoint.P, currentScale.Pmin, currentScale.Pmax);
    
    ctx.fillStyle = "#f8b195";
    ctx.strokeStyle = "#e6616b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 绘制过程标签
    drawSegmentLabels(currentCycleSegments);
}
// 新增：重新绘制原始彩色曲线
function redrawOriginalCurves() {
    drawAxes();
    currentCycleSegments.forEach((segment, index) => {
        const color = getProcessColor(segment.type);
        const data = segment.data;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        data.forEach((d, i) => {
            const x = xMap(d.V, currentScale.Vmin, currentScale.Vmax);
            const y = yMap(d.P, currentScale.Pmin, currentScale.Pmax);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    });
    drawSegmentLabels(currentCycleSegments);
    drawPoint(currentData[0], "起点");
    drawPoint(currentData.at(-1), "终点", true);
}
/* ================== 新增：高亮模式切换函数 ================== */
function toggleHighlightMode() {
    highlightMode = !highlightMode;
    if (highlightMode) {
        toggleHighlightBtn.textContent = "关闭活塞同步高亮";
        toggleHighlightBtn.style.background = "linear-gradient(135deg, #F8E0E6, #E6616B)";
        // 立即更新视图
        if (currentData.length > 0) {
            highlightCurrentPoint(currentAnimationFrame % currentData.length);
        }
    } else {
        toggleHighlightBtn.textContent = "开启活塞同步高亮";
        toggleHighlightBtn.style.background = "linear-gradient(135deg, #E6F5E6, #6C5B7B)";
        // 恢复原始彩色曲线
        if (currentData.length > 0) {
            redrawOriginalCurves();
        }
    }
}
/* ================== 主模拟 ================== */
function startSimulation() {
    // 修复问题2：重置核心数据，避免缓存影响
    currentData = [];
    currentScale = {};
    currentCycleSegments = [];
    currentAnimationFrame = 0;
    
    let segments = [];
    const cycle = cycleType.value;
    // 生成模拟数据
    if (cycle === "carnot") {
        segments = simulateCarnot();
    } else if (cycle === "otto") {
        segments = simulateOtto();
    } else {
        const type = processType.value;
        const P1v = +P1.value;
        const V1v = +V1.value;
        const P2v = +P2.value;
        const V2v = +V2.value;
        switch(type) {
            case "isothermal":
                segments.push(genIsothermal(P1v, V1v, V2v));
                break;
            case "isobaric":
                segments.push(genIsobaric(P1v, V1v, V2v));
                break;
            case "isochoric":
                segments.push(genIsochoric(P1v, P2v, V1v));
                break;
            case "adiabatic":
                segments.push(genAdiabatic(P1v, V1v, V2v));
                break;
        }
    }
    currentCycleSegments = segments;
    const allData = segments.flatMap(segment => segment.data);
    
    // 计算坐标范围
    const Ps = allData.map(d => d.P);
    const Vs = allData.map(d => d.V);
    const Pmin = Math.min(...Ps) * 0.9;
    const Pmax = Math.max(...Ps) * 1.1;
    const Vmin = Math.min(...Vs) * 0.9;
    const Vmax = Math.max(...Vs) * 1.1;
    currentData = allData;
    currentScale = { Pmin, Pmax, Vmin, Vmax };
    // 绘制并动画
    drawAxes();
    let totalSteps = allData.length - 1;
    const animationDuration = 1200;
    const frameInterval = animationDuration / totalSteps;
    let i = 0;
    let currentSegmentIndex = 0;
    let segmentData = segments[currentSegmentIndex].data;
    let segmentEndIndex = segmentData.length - 1;
    // 绘制各段的过程标签
    drawSegmentLabels(segments);
    function animate() {
        if (i >= totalSteps) {
            drawPoint(allData[0], "起点");
            drawPoint(allData.at(-1), "终点", true);
            calculateAndUpdateResults(segments);
            // 启动活塞动画（核心联动）
            initPistonAnimation();
            return;
        }
        if (i > segmentEndIndex && currentSegmentIndex < segments.length - 1) {
            currentSegmentIndex++;
            segmentData = segments[currentSegmentIndex].data;
            segmentEndIndex += segmentData.length;
        }
        const color = getProcessColor(segments[currentSegmentIndex].type);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(xMap(allData[i].V, Vmin, Vmax), yMap(allData[i].P, Pmin, Pmax));
        ctx.lineTo(xMap(allData[i + 1].V, Vmin, Vmax), yMap(allData[i + 1].P, Pmin, Pmax));
        ctx.stroke();
        i++;
        setTimeout(animate, frameInterval);
    }
    animate();
}
/* ================== 辅助函数 ================== */
// 获取不同过程的颜色
function getProcessColor(processType) {
    const colors = {
        isothermal: "#F8B195",
        isobaric: "#6C5B7B",
        isochoric: "#355C7D",
        adiabatic: "#F67280"
    };
    return colors[processType] || "#F8E0E6";
}
// 绘制各段的过程标签
function drawSegmentLabels(segments) {
    const processLabels = {
        isothermal: "等温",
        isobaric: "等压",
        isochoric: "等容",
        adiabatic: "绝热"
    };
    segments.forEach((segment, index) => {
        const midIndex = Math.floor(segment.data.length / 2);
        const midPoint = segment.data[midIndex];
        const x = xMap(midPoint.V, currentScale.Vmin, currentScale.Vmax);
        const y = yMap(midPoint.P, currentScale.Pmin, currentScale.Pmax);
        
        ctx.fillStyle = "#555555";
        ctx.font = "13px 'Noto Sans SC', sans-serif";
        const offsetX = (index % 2 === 0) ? 10 : -60;
        const offsetY = (index < 2) ? -15 : 15;
        ctx.fillText(
            processLabels[segment.type], 
            x + offsetX, 
            y + offsetY
        );
    });
}
// 绘制起点/终点
function drawPoint(d, label, isPulse = false) {
    const x = xMap(d.V, currentScale.Vmin, currentScale.Vmax);
    const y = yMap(d.P, currentScale.Pmin, currentScale.Pmax);
    ctx.fillStyle = isPulse ? "#F8E0E6" : "#F0E6D2";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    if (isPulse) {
        const pulseCircle = new Path2D();
        pulseCircle.arc(x, y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = "#F8E0E6";
        ctx.lineWidth = 2;
        ctx.stroke(pulseCircle);
        
        let pulseAlpha = 1;
        function pulseAnimation() {
            ctx.save();
            ctx.globalAlpha = pulseAlpha;
            const pulse = new Path2D();
            pulse.arc(x, y, 8 + (1 - pulseAlpha) * 4, 0, Math.PI * 2);
            ctx.strokeStyle = "#F8E0E6";
            ctx.lineWidth = 1;
            ctx.stroke(pulse);
            ctx.restore();
            
            pulseAlpha -= 0.02;
            if (pulseAlpha > 0) {
                requestAnimationFrame(pulseAnimation);
            } else {
                setTimeout(() => pulseAnimation(), 300);
            }
        }
        pulseAnimation();
    }
    ctx.fillStyle = "#555555";
    ctx.font = "12px 'Noto Sans SC', sans-serif";
    ctx.fillText(label, x + 6, y - 6);
}
// 计算并更新结果
function calculateAndUpdateResults(segments) {
    let totalW = 0;
    let totalQ = 0;
    let Q_absorbed = 0;
    let Q_released = 0;
    segments.forEach(segment => {
        const data = segment.data;
        const type = segment.type;
        let segmentW = 0;
        let segmentQ = 0;
        // 计算功
        for (let i = 1; i < data.length; i++) {
            segmentW += data[i].P * (data[i].V - data[i - 1].V);
        }
        totalW += segmentW;
        // 计算热量
        if (type === 'isothermal') {
            segmentQ = segmentW;
        } else if (type === 'isobaric') {
            const T1 = data[0].P * data[0].V / (n * R);
            const T2 = data.at(-1).P * data.at(-1).V / (n * R);
            const Cp = (gamma * R) / (gamma - 1);
            segmentQ = n * Cp * (T2 - T1);
        } else if (type === 'isochoric') {
            const T1 = data[0].P * data[0].V / (n * R);
            const T2 = data.at(-1).P * data.at(-1).V / (n * R);
            const Cv = R / (gamma - 1);
            segmentQ = n * Cv * (T2 - T1);
        } else if (type === 'adiabatic') {
            segmentQ = 0;
        }
        totalQ += segmentQ;
        
        if (segmentQ > 0) {
            Q_absorbed += segmentQ;
        } else if (segmentQ < 0) {
            Q_released += Math.abs(segmentQ);
        }
    });
    // 计算内能变化和效率
    const T1 = currentData[0].P * currentData[0].V / (n * R);
    const T2 = currentData.at(-1).P * currentData.at(-1).V / (n * R);
    const dU = n * (R / (gamma - 1)) * (T2 - T1);
    let eta = 0;
    if (cycleType.value !== 'single' && Q_absorbed > 0) {
        eta = (totalW / Q_absorbed) * 100;
    }
    // 更新结果显示
    Wout.innerText = totalW.toFixed(2);
    Uout.innerText = dU.toFixed(2);
    Qout.innerText = totalQ.toFixed(2);
    etaOut.innerText = eta.toFixed(2);
}
/* ================== 鼠标悬停读数 ================== */
const tooltip = document.getElementById("tooltip");
canvas.addEventListener("mousemove", e => {
    if (!currentData.length) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best = null;
    let minDist = 10;
    for (let d of currentData) {
        const x = xMap(d.V, currentScale.Vmin, currentScale.Vmax);
        const y = yMap(d.P, currentScale.Pmin, currentScale.Pmax);
        const dist = Math.hypot(mx - x, my - y);
        if (dist < minDist) {
            minDist = dist;
            best = d;
        }
    }
    if (best) {
        tooltip.style.display = "block";
        tooltip.style.left = e.pageX + 12 + "px";
        tooltip.style.top = e.pageY + 12 + "px";
        tooltip.innerHTML = `V = ${best.V.toFixed(3)} m³<br>P = ${best.P.toFixed(0)} Pa`;
    } else {
        tooltip.style.display = "none";
    }
});
canvas.addEventListener("mouseleave", () => tooltip.style.display = "none");
/* ================== 事件绑定 ================== */
cycleType.addEventListener("change", updateParamGroupVisibility);
processType.addEventListener("change", updateSingleProcessInputs);
processType.addEventListener("change", updateIntroduction);
processType.addEventListener("change", updateKnowledgePoints);
window.addEventListener("resize", () => {
    canvas.width = canvas.parentElement.clientWidth;
    if (currentData.length) {
        drawAxes();
        // 窗口 resize 时根据当前模式重新绘制
        if (highlightMode) {
            highlightCurrentPoint(currentAnimationFrame % currentData.length);
        } else {
            currentCycleSegments.forEach((segment, index) => {
                const color = getProcessColor(segment.type);
                const data = segment.data;
                
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                data.forEach((d, i) => {
                    if (i === 0) {
                        ctx.moveTo(xMap(d.V, currentScale.Vmin, currentScale.Vmax), yMap(d.P, currentScale.Pmin, currentScale.Pmax));
                    } else {
                        ctx.lineTo(xMap(d.V, currentScale.Vmin, currentScale.Vmax), yMap(d.P, currentScale.Pmin, currentScale.Pmax));
                    }
                });
                ctx.stroke();
            });
            drawSegmentLabels(currentCycleSegments);
            drawPoint(currentData[0], "起点");
            drawPoint(currentData.at(-1), "终点", true);
        }
    }
});
runBtn.addEventListener("click", startSimulation);
// 新增：绑定高亮切换按钮事件
toggleHighlightBtn.addEventListener("click", toggleHighlightMode);
// 监听页面滚动，实现背景视差移动
window.addEventListener('scroll', function() {
  // 1. 获取滚动距离（页面向下滚动的像素值）
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  // 2. 获取页面总高度（用于计算移动比例）
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  
  // 3. 计算背景移动比例（数值越小，背景移动越慢，视差效果越自然）
  // 移动范围：背景Y轴位置在 50% ± 10% 之间，可调整10这个数值改变幅度
  const moveRatio = (scrollTop / pageHeight) * 20 - 10; 
  
  // 4. 应用到背景图的位置（仅Y轴移动，也可加X轴：${50 + moveRatio/2}% ${50 + moveRatio}%）
  document.querySelector('.bg-blur').style.backgroundPosition = `50% ${50 + moveRatio}%`;
});
/* ================== 初始化 ================== */
updateParamGroupVisibility();
updateSingleProcessInputs();
updateIntroduction();
updateKnowledgePoints();
drawAxes();
