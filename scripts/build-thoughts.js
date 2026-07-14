const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, '..');
const SITE_URL = 'https://vanhuy.r2b.io.vn';
const CONTENT_DIR = path.join(ROOT, '_content/thoughts');
const ENTRIES_DIR = path.join(ROOT, '_pug/thoughts/entries');
const THOUGHTS_PUG = path.join(ROOT, '_pug/thoughts.pug');
const RSS_FILE = path.join(ROOT, '_rss/feed.xml');

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/đ/g, 'd')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function isoDate(value) {
    if (value instanceof Date) {
        const year = value.getUTCFullYear();
        const month = String(value.getUTCMonth() + 1).padStart(2, '0');
        const day = String(value.getUTCDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    return String(value || '').slice(0, 10);
}

function readPosts() {
    ensureDir(CONTENT_DIR);

    return fs.readdirSync(CONTENT_DIR)
        .filter((file) => file.endsWith('.md'))
        .map((file) => {
            const fullPath = path.join(CONTENT_DIR, file);
            const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'));
            const slug = slugify(data.slug || file.replace(/\.md$/, ''));
            const date = isoDate(data.date);

            if (!data.title) {
                throw new Error(`${file} is missing title`);
            }

            if (!date) {
                throw new Error(`${file} is missing date`);
            }

            return {
                ...data,
                date,
                slug,
                file,
                body: content,
                year: date.slice(0, 4)
            };
        })
        .filter((post) => process.env.HIDE_DRAFTS !== 'true' || post.draft !== true)
        .sort((a, b) => {
            const byDate = new Date(`${b.date}T00:00:00+07:00`) - new Date(`${a.date}T00:00:00+07:00`);
            if (byDate !== 0) {
                return byDate;
            }
            const byOrder = Number(b.order || 0) - Number(a.order || 0);
            if (byOrder !== 0) {
                return byOrder;
            }
            return a.title.localeCompare(b.title, 'vi');
        });
}

function pugString(value) {
    return JSON.stringify(value || '');
}

function xmlEscape(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function rssDate(value) {
    const [year, month, day] = String(value).split('-').map(Number);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekday = weekdays[new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay()];

    return `${weekday}, ${String(day).padStart(2, '0')} ${months[month - 1]} ${year} 00:00:00 +0700`;
}

function renderThoughtsIndex(posts) {
    const lines = [
        'extends _layout',
        '',
        'block vars',
        "  - var pageTitle = 'Thoughts'",
        "  - var pageDescription = 'Thoughts & writings by Van Huy — STARTUP BUILDER & DIGITAL MARKETING.'",
        "  - var pagePath = 'thoughts'",
        "  - var bodyClass = 'thoughts'",
        '',
        'mixin thought(date,title,href,source)',
        '  .thought',
        '    a.thought-title(href=href)',
        '      span= title',
        '    if source',
        '      small.external= source',
        '    //- small.date= date',
        '',
        'block header',
        '',
        '  p.chapter III',
        '  h1#content Thoughts',
        '',
        'block content',
        '',
        '  section.container',
        '',
        '    .thoughts-list'
    ];

    let lastYear = '';

    posts.forEach((post) => {
        if (post.year !== lastYear) {
            lines.push('');
            lines.push(`      h2.dateline ${post.year}`);
            lastYear = post.year;
        }

        lines.push(`      +thought(${pugString(post.displayDate || post.date)}, ${pugString(post.title)}, '/thoughts/entries/${post.slug}')`);
    });

    return `${lines.join('\n')}\n`;
}

function renderEntry(post, earlier, later) {
    const html = md.render(post.body);
    const lines = [
        'extends ../../_layout',
        '',
        'block vars',
        `  - var pageTitle = ${pugString(post.title)}`,
        `  - var pageDescription = ${pugString(post.description || '')}`,
        `  - var pagePath = ${pugString(post.slug)}`,
        "  - var bodyClass = 'thought-detail'",
        `  - var date = ${pugString(post.displayDate || post.date)}`
    ];

    if (post.ogImage) {
        lines.push(`  - var ogImage = ${pugString(post.ogImage)}`);
    }

    if (earlier) {
        lines.push(`  - var earlier = ${pugString(earlier.slug)}`);
    }

    if (later) {
        lines.push(`  - var later = ${pugString(later.slug)}`);
    }

    lines.push(`  - var articleHtml = ${pugString(html)}`);
    lines.push('');
    lines.push('block content');
    lines.push('');
    lines.push('  h2= pageTitle');
    lines.push('');
    lines.push('  small.date= date');
    lines.push('');
    lines.push('  != articleHtml');

    return `${lines.join('\n')}\n`;
}

function renderRss(posts) {
    const items = posts.map((post) => {
        const url = `${SITE_URL}/thoughts/entries/${post.slug}`;
        const pubDate = rssDate(post.date);

        return [
            '    <item>',
            `      <title>${xmlEscape(post.title)}</title>`,
            `      <link>${xmlEscape(url)}</link>`,
            `      <guid>${xmlEscape(url)}</guid>`,
            `      <pubDate>${xmlEscape(pubDate)}</pubDate>`,
            `      <description>${xmlEscape(post.description || '')}</description>`,
            '    </item>'
        ].join('\n');
    }).join('\n\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Van Huy</title>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Thoughts &amp; writings by Van Huy — STARTUP BUILDER &amp; DIGITAL MARKETING.</description>
    <language>vi-VN</language>
    <link>${SITE_URL}</link>

${items}

  </channel>
</rss>
`;
}

function main() {
    const posts = readPosts();

    ensureDir(ENTRIES_DIR);
    ensureDir(path.dirname(RSS_FILE));

    fs.readdirSync(ENTRIES_DIR)
        .filter((file) => file.endsWith('.pug'))
        .forEach((file) => fs.unlinkSync(path.join(ENTRIES_DIR, file)));

    fs.writeFileSync(THOUGHTS_PUG, renderThoughtsIndex(posts));
    fs.writeFileSync(RSS_FILE, renderRss(posts));

    posts.forEach((post, index) => {
        const later = index > 0 ? posts[index - 1] : null;
        const earlier = index < posts.length - 1 ? posts[index + 1] : null;
        fs.writeFileSync(path.join(ENTRIES_DIR, `${post.slug}.pug`), renderEntry(post, earlier, later));
    });

    console.log(`Generated ${posts.length} thoughts.`);
}

main();
