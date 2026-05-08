/* 加载外部 JSON 数据 */
let SHOOTS = [];
let MONTH_NAMES = ['','一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
let YEARS = [2024, 2025, 2026];
let monthSet = new Set();
const app = document.getElementById('app');

/* 从 shoots.json 读取数据 */
/* ===== 连接 Supabase ===== */
const SUPABASE_URL = 'https://ohxezoxiuxbqrzfomdyt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oeGV6b3hpdXhicXJ6Zm9tZHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzIwNTEsImV4cCI6MjA5Mzc0ODA1MX0.f4XCp9NammBkHsv72a2-iSQogqw6l2qOi2rLpZk5SLQ';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let SHOOTS = [];
let MONTH_NAMES = ['','一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
let YEARS = [2024, 2025, 2026];
let monthSet = new Set();
const app = document.getElementById('app');

async function loadData() {
    const { data: shoots, error } = await db
        .from('shoots')
        .select('*, shoot_images(*)')
        .order('shoot_date', { ascending: true });

    if (error) {
        app.innerHTML = '<div style="text-align:center;padding:200px 20px;color:#86868b">'
            + '<p>数据加载失败: ' + error.message + '</p></div>';
        return;
    }

    SHOOTS = shoots.map(s => ({
        slug: s.slug,
        date: s.shoot_date,
        dateDisplay: new Date(s.shoot_date).getFullYear() + '年'
            + (new Date(s.shoot_date).getMonth() + 1) + '月'
            + new Date(s.shoot_date).getDate() + '日',
        year: s.year_num,
        month: s.month_num,
        title: s.title,
        description: s.description || '',
        people: s.people || [],
        equipment: s.equipment || '',
        drive: s.drive_link,
        cover: s.cover_url || 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80',
        images: s.shoot_images && s.shoot_images.length
            ? s.shoot_images.sort((a, b) => a.sort_order - b.sort_order).map(i => i.image_url)
            : [s.cover_url || 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&q=85']
    }));

    monthSet = new Set(SHOOTS.map(s => s.year + '-' + s.month));
    buildNav();
    router();
}

loadData();

