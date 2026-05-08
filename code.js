/* ===== 连接 Supabase ===== */
const SUPABASE_URL = 'https://ohxezoxiuxbqrzfomdyt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oeGV6b3hpdXhicXJ6Zm9tZHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzIwNTEsImV4cCI6MjA5Mzc0ODA1MX0.f4XCp9NammBkHsv72a2-iSQogqw6l2qOi2rLpZk5SLQ';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let SHOOTS = [];
const MONTH_NAMES = ['','一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const YEARS = [2024, 2025, 2026];
let monthSet = new Set();
const app = document.getElementById('app');

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&q=85';

/* 从 Supabase 加载数据 */
async function loadData() {
    try {
        const { data: shoots, error } = await db
            .from('shoots')
            .select('*')
            .order('shoot_date', { ascending: true });

        if (error) throw error;

        console.log('加载成功，共', shoots.length, '条');

        SHOOTS = shoots.map(s => {
            const d = new Date(s.shoot_date);
            return {
                slug: s.slug,
                date: s.shoot_date,
                dateDisplay: d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日',
                year: s.year_num,
                month: s.month_num,
                title: s.title,
                description: s.description || '',
                people: s.people || [],
                equipment: s.equipment || '',
                drive: s.drive_link,
                cover: s.cover_url || DEFAULT_COVER,
                images: [s.cover_url || DEFAULT_IMAGE]
            };
        });

        monthSet = new Set(SHOOTS.map(s => s.year + '-' + s.month));
        buildNav();
        router();
    } catch (err) {
        console.error('加载失败:', err);
        app.innerHTML = '<div style="text-align:center;padding:200px 20px;color:#86868b">'
            + '<p style="font-size:1.2rem">数据加载失败</p>'
            + '<p style="font-size:13px;margin-top:8px;color:red">' + err.message + '</p></div>';
    }
}

function shootsByMonth(y, m) { return SHOOTS.filter(s => s.year === y && s.month === m); }
function shootBySlug(slug)   { return SHOOTS.find(s => s.slug === slug); }

/* NAV */
function buildNav() {
    const center = document.getElementById('navCenter');
    center.innerHTML = YEARS.map(y => `
        <div class="nav-dd" data-year="${y}">
            <button class="nav-trigger">${y}
                <svg viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="dd-panel">
                ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
                    const has = monthSet.has(y + '-' + m);
                    return '<button class="dd-month' + (has ? ' has-data' : '') + '" data-year="' + y + '" data-month="' + m + '">' + MONTH_NAMES[m] + '</button>';
                }).join('')}
            </div>
        </div>
    `).join('');

    center.querySelectorAll('.nav-dd').forEach(dd => {
        let timer;
        dd.addEventListener('mouseenter', () => { clearTimeout(timer); dd.classList.add('open'); });
        dd.addEventListener('mouseleave', () => { timer = setTimeout(() => dd.classList.remove('open'), 180); });
        dd.querySelector('.nav-trigger').addEventListener('click', e => {
            e.preventDefault();
            const wasOpen = dd.classList.contains('open');
            center.querySelectorAll('.nav-dd').forEach(d => d.classList.remove('open'));
            if (!wasOpen) dd.classList.add('open');
        });
    });

    center.querySelectorAll('.dd-month.has-data').forEach(btn => {
        btn.addEventListener('click', () => {
            const y = btn.dataset.year, m = btn.dataset.month;
            center.querySelectorAll('.nav-dd').forEach(d => d.classList.remove('open'));
            window.location.hash = '#/month/' + y + '/' + m;
        });
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('.nav-dd')) {
            center.querySelectorAll('.nav-dd').forEach(d => d.classList.remove('open'));
        }
    });
}

document.getElementById('logoLink').addEventListener('click', e => {
    e.preventDefault();
    window.location.hash = '#/';
});

/* ROUTER */
function router() {
    const hash = window.location.hash || '#/';
    const mm = hash.match(/^#\/month\/(\d{4})\/(\d{1,2})$/);
    const sm = hash.match(/^#\/shoot\/(.+)$/);
    if (mm) renderMonth(+mm[1], +mm[2]);
    else if (sm) renderDetail(sm[1]);
    else renderHome();
    window.scrollTo({ top: 0, behavior: 'instant' });
}
window.addEventListener('hashchange', router);

function animateCards() {
    app.querySelectorAll('.card.hidden').forEach((c, i) =>
        setTimeout(() => c.classList.add('visible'), 60 * i));
}

/* HOME */
function renderHome() {
    const recent = [...SHOOTS].reverse().slice(0, 9);
    app.innerHTML = `
        <header class="hero">
            <div class="hero-bg" id="heroBg"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">Photography<br>Collection</h1>
                <p class="hero-sub">精选摄影素材 · 自由浏览 · 即刻获取</p>
            </div>
            <div class="hero-scroll"><span></span></div>
        </header>
        <section class="home-section page-enter">
            <h2 class="home-section-title">近期素材</h2>
            <div class="card-grid">${recent.map(cardHTML).join('')}</div>
        </section>`;
    requestAnimationFrame(animateCards);
    initParallax();
}

/* MONTH PAGE */
function renderMonth(year, month) {
    const list = shootsByMonth(year, month);
    app.innerHTML = `
        <div class="breadcrumb page-enter">
            <a href="#/">首页</a><span class="sep">/</span>
            <span>${year}年 ${MONTH_NAMES[month]}</span>
        </div>
        <div class="sec-header page-enter">
            <h1>${year}年 ${MONTH_NAMES[month]}</h1>
            <p>共 ${list.length} 组素材</p>
        </div>
        <div class="card-grid page-enter" style="padding-bottom:100px">
            ${list.length ? list.map(cardHTML).join('') : '<div class="empty"><p>暂无素材</p></div>'}
        </div>`;
    requestAnimationFrame(animateCards);
}

/* DETAIL PAGE */
function renderDetail(slug) {
    const s = shootBySlug(slug);
    if (!s) { app.innerHTML = '<div class="empty page-enter" style="padding-top:140px"><p>未找到该素材</p></div>'; return; }
    app.innerHTML = `
        <div class="breadcrumb page-enter">
            <a href="#/">首页</a><span class="sep">/</span>
            <a href="#/month/${s.year}/${s.month}">${s.year}年 ${MONTH_NAMES[s.month]}</a><span class="sep">/</span>
            <span>${s.title}</span>
        </div>
        <div class="detail-wrap page-enter">
            <button class="back-btn" id="backBtn">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                返回
            </button>
            <div class="detail-layout">
                <div class="gallery">
                    <div class="gal-main">
                        <img class="gal-main-img" src="${s.images[0]}" alt="${s.title}">
                        <button class="gal-arrow gal-prev" id="galPrev">
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <button class="gal-arrow gal-next" id="galNext">
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                    </div>
                    <div class="gal-thumbs" id="galThumbs">
                        ${s.images.map((img, i) => '<img class="gal-thumb' + (i===0?' active':'') + '" src="' + img + '" data-i="' + i + '">').join('')}
                    </div>
                </div>
                <div class="detail-info">
                    <h1>${s.title}</h1>
                    <div class="detail-date">${s.dateDisplay}</div>
                    <div class="info-block">
                        <div class="info-label">简介</div>
                        <div class="info-value">${s.description}</div>
                    </div>
                    <div class="info-block">
                        <div class="info-label">主要人物</div>
                        <div class="tag-row">${s.people.map(p => '<span class="tag">' + p + '</span>').join('')}</div>
                    </div>
                    <div class="info-block">
                        <div class="info-label">拍摄设备</div>
                        <div class="tag-equip">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="17" r="1.5" fill="currentColor"/><line x1="10" y1="5" x2="14" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                            ${s.equipment}
                        </div>
                    </div>
                    <div class="info-block">
                        <a class="drive-link" href="${s.drive}" target="_blank" rel="noopener noreferrer">
                            前往 Google Drive 下载素材
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
    document.getElementById('backBtn').addEventListener('click', () => {
        if (window.history.length > 1) window.history.back();
        else window.location.hash = '#/month/' + s.year + '/' + s.month;
    });
    initGallery(s.images);
}

function cardHTML(s) {
    const shortDate = s.dateDisplay.replace(/^\d{4}年/, '');
    return '<a class="card hidden" href="#/shoot/' + s.slug + '">'
        + '<div class="card-img-wrap"><img class="card-img" src="' + s.cover + '" alt="' + s.title + '" loading="lazy">'
        + '<div class="card-date-badge">' + shortDate + '</div></div>'
        + '<div class="card-body"><h3 class="card-title">' + s.title + '</h3>'
        + '<p class="card-desc">' + s.description + '</p>'
        + '<div class="card-link-row">查看详情 <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
        + '</div></a>';
}

function initGallery(images) {
    let current = 0;
    const mainImg = document.querySelector('.gal-main-img');
    const thumbs = document.querySelectorAll('.gal-thumb');
    if (!mainImg || !images.length) return;
    function goTo(i) {
        current = ((i % images.length) + images.length) % images.length;
        mainImg.style.opacity = '0';
        setTimeout(() => { mainImg.src = images[current]; mainImg.style.opacity = '1'; }, 200);
        thumbs.forEach((t, j) => t.classList.toggle('active', j === current));
    }
    document.getElementById('galPrev').addEventListener('click', () => goTo(current - 1));
    document.getElementById('galNext').addEventListener('click', () => goTo(current + 1));
    thumbs.forEach(t => t.addEventListener('click', () => goTo(+t.dataset.i)));
    function onKey(e) { if (e.key === 'ArrowLeft') goTo(current - 1); if (e.key === 'ArrowRight') goTo(current + 1); }
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', () => document.removeEventListener('keydown', onKey), { once: true });
}

function initParallax() {
    const bg = document.getElementById('heroBg');
    if (!bg) return;
    function onScroll() { if (window.scrollY < window.innerHeight) bg.style.transform = 'translateY(' + (window.scrollY * 0.3) + 'px) scale(1.05)'; }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', () => window.removeEventListener('scroll', onScroll), { once: true });
}

/* 启动 */
loadData();
