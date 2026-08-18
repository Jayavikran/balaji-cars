const asyncHandler = require('express-async-handler');
const Car = require('../models/Car');

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function getSiteUrl(req) {
  const configured = (process.env.CLIENT_URL || '').replace(/\/$/, '');
  if (configured) return configured;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host');
  return host ? `${protocol}://${host}`.replace(/\/$/, '') : 'https://www.balajicars.in';
}

// GET /api/sitemap.xml — dynamically generated so it always reflects the
// current inventory (car listings change far too often for a static file).
// In production, route your domain's /sitemap.xml to this endpoint (see
// README > SEO & Sitemap).
const getSitemap = asyncHandler(async (req, res) => {
  const siteUrl = getSiteUrl(req);

  const cars = await Car.find({ status: { $ne: 'Sold' } })
    .select('slug updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

  const staticEntries = [
    urlEntry(`${siteUrl}/`, new Date(), 'daily', '1.0'),
    urlEntry(`${siteUrl}/about`, new Date(), 'monthly', '0.7'),
    urlEntry(`${siteUrl}/contact`, new Date(), 'monthly', '0.8'),
    urlEntry(`${siteUrl}/privacy-policy`, new Date(), 'yearly', '0.3'),
    urlEntry(`${siteUrl}/terms-of-service`, new Date(), 'yearly', '0.3'),
  ];

  const carEntries = cars.map((car) =>
    urlEntry(`${siteUrl}/cars/${car.slug}`, car.updatedAt, 'weekly', '0.8')
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...carEntries].join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

module.exports = { getSitemap };
