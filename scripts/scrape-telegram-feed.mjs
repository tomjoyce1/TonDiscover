import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_TARGETS_FILE = path.resolve(process.cwd(), 'server', 'telegram-targets.json');
const DEFAULT_OUTPUT_FILE = path.resolve(process.cwd(), 'server', 'shared-feed.json');

const DEFAULT_TIMEOUT_MS = 12_000;
const REQUEST_HEADERS = {
  'User-Agent': 'TonDiscoverBot/1.0 (+https://t.me/tondiscover)',
  Accept: 'text/html,application/xhtml+xml',
};

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const parseArgs = () => {
  const raw = process.argv.slice(2);
  const options = {
    targetsFile: DEFAULT_TARGETS_FILE,
    outputFile: DEFAULT_OUTPUT_FILE,
    replace: false,
    handles: [],
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < raw.length; index += 1) {
    const token = raw[index];
    if (!token.startsWith('--')) {
      options.handles.push(token);
      continue;
    }

    if (token === '--replace') {
      options.replace = true;
      continue;
    }

    if (token === '--help') {
      printHelp();
      process.exit(0);
    }

    const [key, inlineValue] = token.split('=');
    const nextValue = inlineValue ?? raw[index + 1];
    const consumeNext = inlineValue === undefined;

    if (!nextValue) {
      throw new Error(`Missing value for ${key}`);
    }

    if (key === '--targets') {
      options.targetsFile = path.resolve(process.cwd(), nextValue);
      if (consumeNext) {
        index += 1;
      }
      continue;
    }

    if (key === '--out') {
      options.outputFile = path.resolve(process.cwd(), nextValue);
      if (consumeNext) {
        index += 1;
      }
      continue;
    }

    if (key === '--timeout-ms') {
      const parsed = Number(nextValue);
      if (!Number.isFinite(parsed) || parsed < 1_000) {
        throw new Error('--timeout-ms must be a number >= 1000');
      }
      options.timeoutMs = parsed;
      if (consumeNext) {
        index += 1;
      }
      continue;
    }

    throw new Error(`Unknown option: ${key}`);
  }

  return options;
};

const printHelp = () => {
  console.log('TonDiscover Telegram scraper');
  console.log('');
  console.log('Usage:');
  console.log('  npm run scrape:telegram -- [handles...] [--replace] [--targets path] [--out path]');
  console.log('');
  console.log('Examples:');
  console.log('  npm run scrape:telegram');
  console.log('  npm run scrape:telegram -- toncoin telegram wallet');
  console.log('  npm run scrape:telegram -- --replace --targets server/telegram-targets.json');
};

const normalizeHandle = (value) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('https://t.me/') || trimmed.startsWith('http://t.me/')) {
    const withoutQuery = trimmed.split('?')[0].split('#')[0];
    const parts = withoutQuery.split('/').filter(Boolean);
    return (parts[parts.length - 1] ?? '').replace(/^@+/, '').trim();
  }

  return trimmed.replace(/^@+/, '').trim();
};

const slugify = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const scoreFromHash = (seed, min, max) => {
  const spread = max - min + 1;
  return min + (seed % spread);
};

const truncate = (value, maxLength) => {
  if (!value) {
    return '';
  }
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}...`;
};

const decodeHtmlEntities = (input) => {
  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: '\'',
    nbsp: ' ',
  };

  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (match, entity) => named[entity] ?? match);
};

const stripHtml = (input) => {
  return decodeHtmlEntities(
    input
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
};

const extractMeta = (html, metaName) => {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${metaName}["'][^>]+content=(["'])([\\s\\S]*?)\\1[^>]*>`,
    'i',
  );
  const match = html.match(pattern);
  return match ? decodeHtmlEntities(match[2].trim()) : '';
};

const makeAbsoluteUrl = (value) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  return trimmed;
};

const pickCategory = (candidate, tags) => {
  const normalized = String(candidate ?? '').trim();
  if (normalized) {
    return normalized;
  }

  const lowerTags = tags.map((tag) => tag.toLowerCase());
  if (lowerTags.includes('games') || lowerTags.includes('miniapp')) {
    return 'Games';
  }
  if (lowerTags.includes('defi') || lowerTags.includes('crypto')) {
    return 'DeFi';
  }
  if (lowerTags.includes('news')) {
    return 'News';
  }
  return 'Community';
};

const cleanTitle = (title, handle) => {
  const raw = String(title ?? '').trim();
  if (!raw) {
    return handle;
  }
  if (raw.startsWith('Telegram: Contact @')) {
    return raw.replace('Telegram: Contact @', '').trim() || handle;
  }
  if (raw.endsWith(' - Telegram')) {
    return raw.slice(0, -' - Telegram'.length).trim();
  }
  return raw;
};

const extractLatestContent = (html) => {
  const textMatch = html.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const videoMatch = html.match(/<video[^>]+src="([^"]+)"/i);
  const photoMatch = html.match(/tgme_widget_message_photo_wrap[^>]+url\('([^']+)'\)/i);

  const text = textMatch ? stripHtml(textMatch[1]) : '';
  const videoUrl = videoMatch ? makeAbsoluteUrl(videoMatch[1]) : '';
  const imageUrl = photoMatch ? makeAbsoluteUrl(photoMatch[1]) : '';

  if (videoUrl) {
    return {
      contentType: 'video',
      text,
      mediaUrl: videoUrl,
    };
  }

  if (imageUrl) {
    return {
      contentType: 'image',
      text,
      mediaUrl: imageUrl,
    };
  }

  return {
    contentType: 'text',
    text,
    mediaUrl: '',
  };
};

const fetchHtml = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: REQUEST_HEADERS,
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
};

const toTargetObject = (value) => {
  if (typeof value === 'string') {
    return {
      handle: value,
      type: 'channel',
      category: '',
      tags: [],
    };
  }
  if (!isObject(value)) {
    return null;
  }
  return {
    handle: String(value.handle ?? ''),
    type: value.type === 'app' ? 'app' : 'channel',
    category: String(value.category ?? ''),
    tags: Array.isArray(value.tags) ? value.tags.filter((item) => typeof item === 'string') : [],
  };
};

const readTargets = async (targetsFile, handlesFromArgs) => {
  if (handlesFromArgs.length > 0) {
    return handlesFromArgs.map((handle) => ({
      handle,
      type: 'channel',
      category: '',
      tags: [],
    }));
  }

  const raw = await readFile(targetsFile, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Targets file must be a JSON array: ${targetsFile}`);
  }

  const targets = parsed
    .map(toTargetObject)
    .filter(Boolean)
    .map((target) => {
      const normalizedHandle = normalizeHandle(target.handle);
      return {
        ...target,
        handle: normalizedHandle,
      };
    })
    .filter((target) => Boolean(target.handle));

  return targets;
};

const readSharedFeed = async (outputFile) => {
  try {
    const raw = await readFile(outputFile, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      featuredOverrides: Array.isArray(parsed.featuredOverrides) ? parsed.featuredOverrides : [],
      registeredEntities: Array.isArray(parsed.registeredEntities) ? parsed.registeredEntities : [],
    };
  } catch {
    return {
      featuredOverrides: [],
      registeredEntities: [],
    };
  }
};

const upsertBy = (items, keySelector) => {
  const map = new Map();
  for (const item of items) {
    map.set(keySelector(item), item);
  }
  return Array.from(map.values());
};

const scrapeTarget = async (target, timeoutMs) => {
  const handle = normalizeHandle(target.handle);
  if (!handle) {
    throw new Error('Empty handle');
  }

  const profileUrl = `https://t.me/${handle}`;
  const streamUrl = `https://t.me/s/${handle}`;

  const [profileHtml, streamHtml] = await Promise.all([
    fetchHtml(profileUrl, timeoutMs),
    fetchHtml(streamUrl, timeoutMs).catch(() => ''),
  ]);

  const rawTitle = extractMeta(profileHtml, 'og:title');
  const title = cleanTitle(rawTitle, handle);
  const description = extractMeta(profileHtml, 'og:description');
  const ogImage = makeAbsoluteUrl(extractMeta(profileHtml, 'og:image'));
  const latest = streamHtml ? extractLatestContent(streamHtml) : { contentType: 'text', text: '', mediaUrl: '' };

  const previewText = truncate(latest.text || description, 220);
  const shortDescription = truncate(description || latest.text || `${title} on Telegram`, 140);
  const previewMediaUrl = latest.mediaUrl || ogImage;

  const baseSeed = hashString(handle);
  const entityId = `tg-${target.type}-${slugify(handle)}`;
  const tags = [...new Set([...(target.tags || []), 'telegram', target.type])];
  const category = pickCategory(target.category, tags);
  const hasMedia = Boolean(previewMediaUrl);
  const contentType = hasMedia ? latest.contentType === 'video' ? 'video' : 'image' : 'text';

  const entity = {
    id: entityId,
    type: target.type,
    name: title,
    category,
    tags,
    shortDescription,
    telegramUrl: profileUrl,
    contentType,
    previewText: previewText || undefined,
    previewMediaUrl: hasMedia ? previewMediaUrl : undefined,
    editorialScore: scoreFromHash(baseSeed, 55, 75),
    activityScore: scoreFromHash(baseSeed + 17, 30, 70),
    engagementScore: scoreFromHash(baseSeed + 31, 25, 65),
  };

  const featured = {
    id: `featured-${entityId}`,
    entityId,
    mode: 'manual',
    contentType,
    title: truncate(previewText || `Latest from @${handle}`, 80),
    text: contentType === 'text' ? previewText : undefined,
    mediaUrl: hasMedia ? previewMediaUrl : undefined,
  };

  return { entity, featured };
};

const filterOutTelegramGenerated = (feed) => {
  return {
    registeredEntities: feed.registeredEntities.filter((entity) => !String(entity.id).startsWith('tg-')),
    featuredOverrides: feed.featuredOverrides.filter((item) => !String(item.entityId).startsWith('tg-')),
  };
};

const run = async () => {
  const options = parseArgs();
  const targets = await readTargets(options.targetsFile, options.handles);

  if (targets.length === 0) {
    throw new Error('No Telegram targets found. Add handles or populate server/telegram-targets.json');
  }

  console.log(`Scraping ${targets.length} Telegram targets...`);

  const scrapedEntities = [];
  const scrapedFeatured = [];
  const failures = [];

  for (const target of targets) {
    try {
      const result = await scrapeTarget(target, options.timeoutMs);
      scrapedEntities.push(result.entity);
      scrapedFeatured.push(result.featured);
      console.log(`  OK @${target.handle} -> ${result.entity.name}`);
    } catch (error) {
      failures.push({
        handle: target.handle,
        reason: error instanceof Error ? error.message : String(error),
      });
      console.log(`  FAIL @${target.handle} (${failures[failures.length - 1].reason})`);
    }

    await sleep(250);
  }

  if (scrapedEntities.length === 0) {
    throw new Error('All Telegram scrapes failed. Shared feed not updated.');
  }

  const existing = await readSharedFeed(options.outputFile);
  const baseFeed = options.replace ? filterOutTelegramGenerated(existing) : existing;

  const merged = {
    registeredEntities: upsertBy([...baseFeed.registeredEntities, ...scrapedEntities], (item) => item.id),
    featuredOverrides: upsertBy([...baseFeed.featuredOverrides, ...scrapedFeatured], (item) => item.entityId),
  };

  await writeFile(options.outputFile, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');

  console.log('');
  console.log(`Updated: ${options.outputFile}`);
  console.log(`Scraped entities: ${scrapedEntities.length}`);
  console.log(`Failures: ${failures.length}`);
  if (failures.length > 0) {
    console.log('Failed handles:');
    for (const failure of failures) {
      console.log(`  - @${failure.handle}: ${failure.reason}`);
    }
  }
};

run().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
