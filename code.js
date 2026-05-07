/* 加载外部 JSON 数据 */
let SHOOTS = [];
let MONTH_NAMES = ['','一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
let YEARS = [2024, 2025, 2026];
let monthSet = new Set();
const app = document.getElementById('app');

/* 从 shoots.json 读取数据 */
fetch('shoots.json')
    .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    })
    .then(data => {
        SHOOTS = data;
        monthSet = new Set(SHOOTS.map(s => s.year + '-' + s.month));
        buildNav();
        router();
    })
    .catch(err => {
        console.error('加载数据失败:', err);
        app.innerHTML = '<div style="text-align:center;padding:200px 20px;color:#86868b">'
            + '<p style="font-size:1.2rem">数据加载失败</p>'
            + '<p style="font-size:14px;margin-top:8px">请确认 shoots.json 与 index.html 在同一文件夹</p>'
            + '<p style="font-size:12px;margin-top:4px;color:#aaa">错误: ' + err.message + '</p>'
            + '</div>';
    });
