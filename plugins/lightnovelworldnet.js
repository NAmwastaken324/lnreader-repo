"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fetch_1 = require("@libs/fetch");
var filterInputs_1 = require("@libs/filterInputs");
var cheerio_1 = require("cheerio");
var defaultCover_1 = require("@libs/defaultCover");
var novelStatus_1 = require("@libs/novelStatus");
/**
 * LightNovelWorld (.net) — WordPress "LightNovel" theme.
 * Novel pages:   https://lightnovelworld.net/novel/<slug>/
 * Chapter pages: https://lightnovelworld.net/<slug>-chapter-<n>/
 * Selectors include fallbacks so small theme changes don't break it.
 */
var LightNovelWorldNetPlugin = /** @class */ (function () {
    function LightNovelWorldNetPlugin() {
        var _this = this;
        this.id = 'lightnovelworldnet';
        this.name = 'LightNovelWorld (.net)';
        this.icon = 'src/en/lightnovelworldnet/icon.png';
        this.site = 'https://lightnovelworld.net/';
        this.version = '1.0.0';
        this.filters = {
            order: {
                label: 'Order by',
                value: 'popular',
                options: [
                    { label: 'Popular', value: 'popular' },
                    { label: 'Latest update', value: 'update' },
                    { label: 'Latest added', value: 'latest' },
                    { label: 'Rating', value: 'rating' },
                    { label: 'A-Z', value: 'title' },
                    { label: 'Z-A', value: 'titlereverse' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            status: {
                label: 'Status',
                value: '',
                options: [
                    { label: 'All', value: '' },
                    { label: 'Ongoing', value: 'ongoing' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Hiatus', value: 'hiatus' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            genre: {
                label: 'Genre',
                value: [],
                options: [
                    'Action',
                    'Adult',
                    'Adventure',
                    'Comedy',
                    'Drama',
                    'Ecchi',
                    'Fantasy',
                    'Gender Bender',
                    'Harem',
                    'Historical',
                    'Horror',
                    'Josei',
                    'Martial Arts',
                    'Mature',
                    'Mecha',
                    'Mystery',
                    'Psychological',
                    'Romance',
                    'School Life',
                    'Sci-fi',
                    'Seinen',
                    'Shoujo',
                    'Shounen',
                    'Slice of Life',
                    'Sports',
                    'Supernatural',
                    'Tragedy',
                    'Wuxia',
                    'Xianxia',
                    'Xuanhuan',
                ].map(function (g) { return ({
                    label: g,
                    value: g.toLowerCase().replace(/\s+/g, '-'),
                }); }),
                type: filterInputs_1.FilterTypes.CheckboxGroup,
            },
        };
        this.resolveUrl = function (path) { return _this.abs(path); };
    }
    // ---------- helpers ----------
    LightNovelWorldNetPlugin.prototype.abs = function (url) {
        if (!url)
            return '';
        if (url.startsWith('//'))
            return 'https:' + url;
        if (/^https?:\/\//i.test(url))
            return url;
        return this.site + url.replace(/^\//, '');
    };
    LightNovelWorldNetPlugin.prototype.toPath = function (url) {
        return url
            .replace(/^https?:\/\/(www\.)?lightnovelworld\.net\/?/i, '')
            .replace(/^\//, '');
    };
    LightNovelWorldNetPlugin.prototype.getHtml = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var res, html, title;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(url)];
                    case 1:
                        res = _b.sent();
                        return [4 /*yield*/, res.text()];
                    case 2:
                        html = _b.sent();
                        title = (((_a = html.match(/<title>([^<]*)<\/title>/i)) === null || _a === void 0 ? void 0 : _a[1]) || '').trim();
                        if (/just a moment|attention required|bot verification|un instant/i.test(title)) {
                            throw new Error('Cloudflare check — open the site in WebView once, then retry.');
                        }
                        if (!res.ok) {
                            throw new Error("Could not reach site (HTTP ".concat(res.status, ") \u2014 try opening it in WebView."));
                        }
                        return [2 /*return*/, html];
                }
            });
        });
    };
    LightNovelWorldNetPlugin.prototype.imgSrc = function ($, el) {
        var img = $(el);
        var src = img.attr('data-src') ||
            img.attr('data-lazy-src') ||
            img.attr('data-original') ||
            img.attr('src') ||
            '';
        return src.startsWith('data:') ? '' : this.abs(src);
    };
    LightNovelWorldNetPlugin.prototype.parseNovelList = function (html) {
        var _this = this;
        var $ = (0, cheerio_1.load)(html);
        var novels = [];
        var seen = new Set();
        var add = function (href, name, cover) {
            if (!href || !name)
                return;
            var path = _this.toPath(_this.abs(href));
            if (!path.startsWith('novel/') || seen.has(path))
                return;
            seen.add(path);
            novels.push({
                name: name.trim(),
                path: path,
                cover: cover || defaultCover_1.defaultCover,
            });
        };
        // Theme cards: <article class="bs"><div class="bsx"><a href title>...<img>
        $('article .bsx, article.bs, .listupd article, .bs').each(function (_, el) {
            var card = $(el);
            var a = card.find('a[href*="/novel/"]').first();
            var name = a.attr('title') ||
                card.find('.tt, .ntitle, h2, h3').first().text() ||
                card.find('img').first().attr('alt');
            add(a.attr('href'), name, _this.imgSrc($, card.find('img').first()));
        });
        // Generic fallback: any link to /novel/<slug>/ that has a cover image
        if (!novels.length) {
            $('a[href*="/novel/"]').each(function (_, el) {
                var a = $(el);
                var href = a.attr('href') || '';
                if (!/\/novel\/[^/?#]+\/?$/.test(href))
                    return;
                var img = a.find('img').first();
                var name = a.attr('title') || img.attr('alt') || a.text().trim() || '';
                if (!img.length && !a.attr('title'))
                    return;
                add(href, name, img.length ? _this.imgSrc($, img) : '');
            });
        }
        return novels;
    };
    // ---------- browse ----------
    LightNovelWorldNetPlugin.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var params, order, _i, _c, g, html;
            var _d, _e, _f;
            var showLatestNovels = _b.showLatestNovels, filters = _b.filters;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        params = ['page=' + pageNo];
                        order = showLatestNovels
                            ? 'update'
                            : ((_d = filters === null || filters === void 0 ? void 0 : filters.order) === null || _d === void 0 ? void 0 : _d.value) || 'popular';
                        params.push('order=' + order);
                        if ((_e = filters === null || filters === void 0 ? void 0 : filters.status) === null || _e === void 0 ? void 0 : _e.value)
                            params.push('status=' + filters.status.value);
                        for (_i = 0, _c = ((_f = filters === null || filters === void 0 ? void 0 : filters.genre) === null || _f === void 0 ? void 0 : _f.value) || []; _i < _c.length; _i++) {
                            g = _c[_i];
                            params.push('genre%5B%5D=' + encodeURIComponent(g));
                        }
                        return [4 /*yield*/, this.getHtml(this.site + 'novel/?' + params.join('&'))];
                    case 1:
                        html = _g.sent();
                        return [2 /*return*/, this.parseNovelList(html)];
                }
            });
        });
    };
    LightNovelWorldNetPlugin.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var url, html, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.site + 'page/' + pageNo + '/?s=' + encodeURIComponent(searchTerm);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getHtml(url)];
                    case 2:
                        html = _a.sent();
                        return [2 /*return*/, this.parseNovelList(html)];
                    case 3:
                        e_1 = _a.sent();
                        if (pageNo > 1)
                            return [2 /*return*/, []];
                        throw e_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ---------- novel ----------
    LightNovelWorldNetPlugin.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var html, $, novel, coverImg, summaryEl, paragraphs, genres, info, statusText;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getHtml(this.abs(novelPath))];
                    case 1:
                        html = _b.sent();
                        $ = (0, cheerio_1.load)(html);
                        novel = {
                            path: novelPath,
                            name: $('h1.entry-title').first().text().trim() ||
                                $('.infox h1, h1').first().text().trim() ||
                                'Untitled',
                        };
                        coverImg = $('.sertothumb img, .thumb img, img.ts-post-image, .wp-post-image').first();
                        novel.cover = (coverImg.length && this.imgSrc($, coverImg)) || defaultCover_1.defaultCover;
                        summaryEl = $('.entry-content[itemprop="description"], [itemprop="description"], .sersys, .synp .entry-content, .entry-content').first();
                        summaryEl.find('script, style').remove();
                        paragraphs = summaryEl
                            .find('p')
                            .map(function (_, p) { return $(p).text().trim(); })
                            .get()
                            .filter(Boolean);
                        novel.summary = (paragraphs.length ? paragraphs.join('\n\n') : summaryEl.text()).trim();
                        genres = $('.genxed a, .sertogenre a, a[rel="tag"][href*="/genre/"]')
                            .map(function (_, a) { return $(a).text().trim(); })
                            .get()
                            .filter(Boolean);
                        novel.genres = Array.from(new Set(genres)).join(', ');
                        info = {};
                        $('.spe span, .serl, .info-content span, .tsinfo .imptdt').each(function (_, el) {
                            var text = $(el).text().replace(/\s+/g, ' ').trim();
                            var m = text.match(/^([^:]{2,30}):\s*(.+)$/);
                            if (m)
                                info[m[1].toLowerCase().trim()] = m[2].trim();
                            else {
                                var label = $(el).find('b, .serl-title').first().text().trim();
                                var value = text.replace(label, '').trim();
                                if (label)
                                    info[label.toLowerCase().replace(':', '')] = value;
                            }
                        });
                        novel.author = info['author'] || info['authors'] || undefined;
                        novel.artist = info['artist'] || undefined;
                        statusText = (info['status'] ||
                            $('.sertostat, .status').first().text() ||
                            ((_a = $('h1')
                                .first()
                                .parent()
                                .text()
                                .match(/\b(Ongoing|Completed|Hiatus)\b/i)) === null || _a === void 0 ? void 0 : _a[1]) ||
                            '').toLowerCase();
                        novel.status = statusText.includes('complet')
                            ? novelStatus_1.NovelStatus.Completed
                            : statusText.includes('ongoing')
                                ? novelStatus_1.NovelStatus.Ongoing
                                : statusText.includes('hiatus')
                                    ? novelStatus_1.NovelStatus.OnHiatus
                                    : novelStatus_1.NovelStatus.Unknown;
                        novel.chapters = this.parseChapterList($);
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    LightNovelWorldNetPlugin.prototype.parseChapterList = function ($) {
        var _this = this;
        var chapters = [];
        var seen = new Set();
        var items = $('.eplister li, .eplisterfull li');
        if (!items.length)
            items = $('#chapterlist li, .chapter-list li, ul.chapters li');
        items.each(function (_, li) {
            var el = $(li);
            var a = el.find('a[href]').first();
            var href = a.attr('href');
            if (!href)
                return;
            var path = _this.toPath(_this.abs(href));
            if (!path || path.startsWith('novel/') || seen.has(path))
                return;
            seen.add(path);
            var num = el.find('.epl-num').text().replace(/\s+/g, ' ').trim();
            var title = el.find('.epl-title').text().replace(/\s+/g, ' ').trim();
            title = title.replace(/\[\s*\.\.\.\s*words\s*\]\s*$/i, '').trim();
            var date = el.find('.epl-date').text().trim();
            var locked = /🔒/.test(num) || /premium|locked/i.test(el.find('.epl-price').text());
            var chMatch = num.match(/ch(?:apter)?\.?\s*(\d+(?:\.\d+)?)/i) ||
                path.match(/chapter-(\d+(?:\.\d+)?)/i);
            var chapterNumber = chMatch ? parseFloat(chMatch[1]) : undefined;
            var name = title || a.text().replace(/\s+/g, ' ').trim() || num;
            if (chapterNumber !== undefined && !/\d/.test(name.slice(0, 12)))
                name = "Ch. ".concat(chapterNumber, " - ").concat(name);
            if (locked)
                name = '🔒 ' + name;
            chapters.push({
                name: name,
                path: path,
                releaseTime: date || undefined,
                chapterNumber: chapterNumber,
            });
        });
        // The site lists newest first — reading order is oldest first.
        chapters.reverse();
        return chapters;
    };
    // ---------- chapter ----------
    LightNovelWorldNetPlugin.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var html, $, content, blocks, out;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getHtml(this.abs(chapterPath))];
                    case 1:
                        html = _a.sent();
                        $ = (0, cheerio_1.load)(html);
                        content = $('.epcontent').first();
                        if (!content.length)
                            content = $('#chapter-content, .chapter-content, .text-left, .reading-content, article .entry-content').first();
                        if (!content.length)
                            throw new Error('Chapter text not found — open in WebView.');
                        content
                            .find('script, style, noscript, iframe, ins, .ads, .adsbygoogle, .code-block, .sharedaddy, .wp-block-buttons, .bottomnav, .naveps')
                            .remove();
                        // Drop the site's promo line ("Lightnovelworld.net presents: ...")
                        content.find('p, em, i, div').each(function (_, el) {
                            var t = $(el).text().trim();
                            if (/lightnovelworld\.net/i.test(t) &&
                                t.length < 250 &&
                                !$(el).find('p').length)
                                $(el).remove();
                        });
                        content.find('img').each(function (_, el) {
                            var img = $(el);
                            var src = _this.imgSrc($, el);
                            if (src)
                                img.attr('src', src);
                            else
                                img.remove();
                        });
                        content.find('*').each(function (_, el) {
                            for (var _i = 0, _a = Object.keys(el.attribs || {}); _i < _a.length; _i++) {
                                var attr = _a[_i];
                                if (/^on/i.test(attr) || attr === 'style')
                                    $(el).removeAttr(attr);
                            }
                        });
                        blocks = [];
                        content.find('p, img, h2, h3, hr').each(function (_, el) {
                            var node = $(el);
                            if (node.is('img') && node.parents('p').length)
                                return;
                            if (node.is('p') && !node.text().trim() && !node.find('img').length)
                                return;
                            blocks.push($.html(node));
                        });
                        out = blocks.length
                            ? blocks.join('\n')
                            : (content.html() || '').trim();
                        if (!out)
                            throw new Error('Empty chapter — open in WebView.');
                        return [2 /*return*/, out];
                }
            });
        });
    };
    return LightNovelWorldNetPlugin;
}());
exports.default = new LightNovelWorldNetPlugin();
