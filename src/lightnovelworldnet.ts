import { fetchApi } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { Filters, FilterTypes } from '@libs/filterInputs';
import { load as loadCheerio, CheerioAPI } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

/**
 * LightNovelWorld (.net) — WordPress "LightNovel" theme.
 * Novel pages:   https://lightnovelworld.net/novel/<slug>/
 * Chapter pages: https://lightnovelworld.net/<slug>-chapter-<n>/
 * Selectors include fallbacks so small theme changes don't break it.
 */
class LightNovelWorldNetPlugin implements Plugin.PluginBase {
  id = 'lightnovelworldnet';
  name = 'LightNovelWorld (.net)';
  icon = 'src/en/lightnovelworldnet/icon.png';
  site = 'https://lightnovelworld.net/';
  version = '1.0.0';

  filters = {
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
      type: FilterTypes.Picker,
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
      type: FilterTypes.Picker,
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
      ].map(g => ({
        label: g,
        value: g.toLowerCase().replace(/\s+/g, '-'),
      })),
      type: FilterTypes.CheckboxGroup,
    },
  } satisfies Filters;

  // ---------- helpers ----------

  private abs(url?: string): string {
    if (!url) return '';
    if (url.startsWith('//')) return 'https:' + url;
    if (/^https?:\/\//i.test(url)) return url;
    return this.site + url.replace(/^\//, '');
  }

  private toPath(url: string): string {
    return url
      .replace(/^https?:\/\/(www\.)?lightnovelworld\.net\/?/i, '')
      .replace(/^\//, '');
  }

  private async getHtml(url: string): Promise<string> {
    const res = await fetchApi(url);
    const html = await res.text();
    const title = (html.match(/<title>([^<]*)<\/title>/i)?.[1] || '').trim();
    if (
      /just a moment|attention required|bot verification|un instant/i.test(
        title,
      )
    ) {
      throw new Error(
        'Cloudflare check — open the site in WebView once, then retry.',
      );
    }
    if (!res.ok) {
      throw new Error(
        `Could not reach site (HTTP ${res.status}) — try opening it in WebView.`,
      );
    }
    return html;
  }

  private imgSrc($: CheerioAPI, el: any): string {
    const img = $(el);
    const src =
      img.attr('data-src') ||
      img.attr('data-lazy-src') ||
      img.attr('data-original') ||
      img.attr('src') ||
      '';
    return src.startsWith('data:') ? '' : this.abs(src);
  }

  private parseNovelList(html: string): Plugin.NovelItem[] {
    const $ = loadCheerio(html);
    const novels: Plugin.NovelItem[] = [];
    const seen = new Set<string>();

    const add = (href?: string, name?: string, cover?: string) => {
      if (!href || !name) return;
      const path = this.toPath(this.abs(href));
      if (!path.startsWith('novel/') || seen.has(path)) return;
      seen.add(path);
      novels.push({
        name: name.trim(),
        path,
        cover: cover || defaultCover,
      });
    };

    // Theme cards: <article class="bs"><div class="bsx"><a href title>...<img>
    $('article .bsx, article.bs, .listupd article, .bs').each((_, el) => {
      const card = $(el);
      const a = card.find('a[href*="/novel/"]').first();
      const name =
        a.attr('title') ||
        card.find('.tt, .ntitle, h2, h3').first().text() ||
        card.find('img').first().attr('alt');
      add(a.attr('href'), name, this.imgSrc($, card.find('img').first()));
    });

    // Generic fallback: any link to /novel/<slug>/ that has a cover image
    if (!novels.length) {
      $('a[href*="/novel/"]').each((_, el) => {
        const a = $(el);
        const href = a.attr('href') || '';
        if (!/\/novel\/[^/?#]+\/?$/.test(href)) return;
        const img = a.find('img').first();
        const name =
          a.attr('title') || img.attr('alt') || a.text().trim() || '';
        if (!img.length && !a.attr('title')) return;
        add(href, name, img.length ? this.imgSrc($, img) : '');
      });
    }
    return novels;
  }

  // ---------- browse ----------

  async popularNovels(
    pageNo: number,
    {
      showLatestNovels,
      filters,
    }: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    const params: string[] = ['page=' + pageNo];
    const order = showLatestNovels
      ? 'update'
      : filters?.order?.value || 'popular';
    params.push('order=' + order);
    if (filters?.status?.value) params.push('status=' + filters.status.value);
    for (const g of filters?.genre?.value || [])
      params.push('genre%5B%5D=' + encodeURIComponent(g));

    const html = await this.getHtml(this.site + 'novel/?' + params.join('&'));
    return this.parseNovelList(html);
  }

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    const url =
      this.site + 'page/' + pageNo + '/?s=' + encodeURIComponent(searchTerm);
    try {
      const html = await this.getHtml(url);
      return this.parseNovelList(html);
    } catch (e) {
      if (pageNo > 1) return [];
      throw e;
    }
  }

  // ---------- novel ----------

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const html = await this.getHtml(this.abs(novelPath));
    const $ = loadCheerio(html);

    const novel: Plugin.SourceNovel = {
      path: novelPath,
      name:
        $('h1.entry-title').first().text().trim() ||
        $('.infox h1, h1').first().text().trim() ||
        'Untitled',
    };

    const coverImg = $(
      '.sertothumb img, .thumb img, img.ts-post-image, .wp-post-image',
    ).first();
    novel.cover = (coverImg.length && this.imgSrc($, coverImg)) || defaultCover;

    // Summary
    const summaryEl = $(
      '.entry-content[itemprop="description"], [itemprop="description"], .sersys, .synp .entry-content, .entry-content',
    ).first();
    summaryEl.find('script, style').remove();
    const paragraphs = summaryEl
      .find('p')
      .map((_, p) => $(p).text().trim())
      .get()
      .filter(Boolean);
    novel.summary = (
      paragraphs.length ? paragraphs.join('\n\n') : summaryEl.text()
    ).trim();

    // Genres
    const genres = $('.genxed a, .sertogenre a, a[rel="tag"][href*="/genre/"]')
      .map((_, a) => $(a).text().trim())
      .get()
      .filter(Boolean);
    novel.genres = Array.from(new Set(genres)).join(', ');

    // Info rows: "Author: X", "Artist: Y", "Status: Ongoing", "Native Language", ...
    const info: Record<string, string> = {};
    $('.spe span, .serl, .info-content span, .tsinfo .imptdt').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const m = text.match(/^([^:]{2,30}):\s*(.+)$/);
      if (m) info[m[1].toLowerCase().trim()] = m[2].trim();
      else {
        const label = $(el).find('b, .serl-title').first().text().trim();
        const value = text.replace(label, '').trim();
        if (label) info[label.toLowerCase().replace(':', '')] = value;
      }
    });
    novel.author = info['author'] || info['authors'] || undefined;
    novel.artist = info['artist'] || undefined;

    const statusText = (
      info['status'] ||
      $('.sertostat, .status').first().text() ||
      $('h1')
        .first()
        .parent()
        .text()
        .match(/\b(Ongoing|Completed|Hiatus)\b/i)?.[1] ||
      ''
    ).toLowerCase();
    novel.status = statusText.includes('complet')
      ? NovelStatus.Completed
      : statusText.includes('ongoing')
        ? NovelStatus.Ongoing
        : statusText.includes('hiatus')
          ? NovelStatus.OnHiatus
          : NovelStatus.Unknown;

    novel.chapters = this.parseChapterList($);
    return novel;
  }

  private parseChapterList($: CheerioAPI): Plugin.ChapterItem[] {
    const chapters: Plugin.ChapterItem[] = [];
    const seen = new Set<string>();

    let items = $('.eplister li, .eplisterfull li');
    if (!items.length)
      items = $('#chapterlist li, .chapter-list li, ul.chapters li');

    items.each((_, li) => {
      const el = $(li);
      const a = el.find('a[href]').first();
      const href = a.attr('href');
      if (!href) return;
      const path = this.toPath(this.abs(href));
      if (!path || path.startsWith('novel/') || seen.has(path)) return;
      seen.add(path);

      const num = el.find('.epl-num').text().replace(/\s+/g, ' ').trim();
      let title = el.find('.epl-title').text().replace(/\s+/g, ' ').trim();
      title = title.replace(/\[\s*\.\.\.\s*words\s*\]\s*$/i, '').trim();
      const date = el.find('.epl-date').text().trim();
      const locked =
        /🔒/.test(num) || /premium|locked/i.test(el.find('.epl-price').text());

      const chMatch =
        num.match(/ch(?:apter)?\.?\s*(\d+(?:\.\d+)?)/i) ||
        path.match(/chapter-(\d+(?:\.\d+)?)/i);
      const chapterNumber = chMatch ? parseFloat(chMatch[1]) : undefined;

      let name = title || a.text().replace(/\s+/g, ' ').trim() || num;
      if (chapterNumber !== undefined && !/\d/.test(name.slice(0, 12)))
        name = `Ch. ${chapterNumber} - ${name}`;
      if (locked) name = '🔒 ' + name;

      chapters.push({
        name,
        path,
        releaseTime: date || undefined,
        chapterNumber,
      });
    });

    // The site lists newest first — reading order is oldest first.
    chapters.reverse();
    return chapters;
  }

  // ---------- chapter ----------

  async parseChapter(chapterPath: string): Promise<string> {
    const html = await this.getHtml(this.abs(chapterPath));
    const $ = loadCheerio(html);

    let content = $('.epcontent').first();
    if (!content.length)
      content = $(
        '#chapter-content, .chapter-content, .text-left, .reading-content, article .entry-content',
      ).first();
    if (!content.length)
      throw new Error('Chapter text not found — open in WebView.');

    content
      .find(
        'script, style, noscript, iframe, ins, .ads, .adsbygoogle, .code-block, .sharedaddy, .wp-block-buttons, .bottomnav, .naveps',
      )
      .remove();

    // Drop the site's promo line ("Lightnovelworld.net presents: ...")
    content.find('p, em, i, div').each((_, el) => {
      const t = $(el).text().trim();
      if (
        /lightnovelworld\.net/i.test(t) &&
        t.length < 250 &&
        !$(el).find('p').length
      )
        $(el).remove();
    });

    content.find('img').each((_, el) => {
      const img = $(el);
      const src = this.imgSrc($, el);
      if (src) img.attr('src', src);
      else img.remove();
    });
    content.find('*').each((_, el: any) => {
      for (const attr of Object.keys(el.attribs || {}))
        if (/^on/i.test(attr) || attr === 'style') $(el).removeAttr(attr);
    });

    const blocks: string[] = [];
    content.find('p, img, h2, h3, hr').each((_, el) => {
      const node = $(el);
      if (node.is('img') && node.parents('p').length) return;
      if (node.is('p') && !node.text().trim() && !node.find('img').length)
        return;
      blocks.push($.html(node));
    });

    const out = blocks.length
      ? blocks.join('\n')
      : (content.html() || '').trim();
    if (!out) throw new Error('Empty chapter — open in WebView.');
    return out;
  }

  resolveUrl = (path: string) => this.abs(path);
}

export default new LightNovelWorldNetPlugin();
