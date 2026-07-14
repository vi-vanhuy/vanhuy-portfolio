const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/đ/g, 'd')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function escapeYaml(value) {
    return String(value || '').replace(/"/g, '\\"');
}

async function main() {
    console.log('\n=== TẠO BÀI VIẾT MỚI ===');
    const title = await question('1. Tiêu đề bài viết (vd: Sinh nhật năm 22 tuổi của Huy.): ');
    if (!title.trim()) {
        console.log('Lỗi: Tiêu đề không được để trống!');
        rl.close();
        return;
    }

    const defaultSlug = slugify(title);
    const slugAnswer = await question(`2. Slug/Tên file không dấu (Enter để dùng "${defaultSlug}"): `);
    const slug = slugAnswer.trim() || defaultSlug;
    if (!slug) {
        console.log('Lỗi: Slug không được để trống!');
        rl.close();
        return;
    }

    const defaultDate = todayIso();
    const dateAnswer = await question(`3. Ngày đăng dạng YYYY-MM-DD (Enter để dùng ${defaultDate}): `);
    const date = dateAnswer.trim() || defaultDate;
    const displayDate = await question('4. Ngày hiển thị (vd: 19 tháng 4, 2027): ');
    const desc = await question('5. Mô tả ngắn để tối ưu SEO: ');

    const contentDir = path.join(__dirname, '../_content/thoughts');
    const mdPath = path.join(contentDir, `${slug}.md`);

    if (fs.existsSync(mdPath)) {
        console.log(`Lỗi: File ${slug}.md đã tồn tại!`);
        rl.close();
        return;
    }

    const template = `---
title: "${escapeYaml(title)}"
slug: "${escapeYaml(slug)}"
date: "${escapeYaml(date)}"
displayDate: "${escapeYaml(displayDate || date)}"
order: 0
description: "${escapeYaml(desc || 'Bài viết mới chia sẻ góc nhìn và kỉ niệm của Van Huy.')}"
draft: true
ogImage: ""
---

Viết nội dung bài viết của bạn tại đây.
`;

    fs.mkdirSync(contentDir, { recursive: true });
    fs.writeFileSync(mdPath, template);

    console.log(`\nĐã tạo tệp bài viết tại: _content/thoughts/${slug}.md`);
    console.log('\nBƯỚC TIẾP THEO:');
    console.log('1. Viết nội dung trong file Markdown vừa tạo.');
    console.log('2. Đổi draft: false khi muốn đăng.');
    console.log('3. Chạy npm run build để cập nhật website.');

    rl.close();
}

main();
