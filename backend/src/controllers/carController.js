const asyncHandler = require('express-async-handler');
const Car = require('../models/Car');
const { findSimilarCars } = require('../utils/similarCars');

const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_low_high: { price: 1 },
  price_high_low: { price: -1 },
  km_low_high: { kilometersDriven: 1 },
  km_high_low: { kilometersDriven: -1 },
  year_newest: { manufacturingYear: -1 },
  year_oldest: { manufacturingYear: 1 },
  recently_added: { createdAt: -1 },
  most_viewed: { views: -1 },
  featured_first: { isFeatured: -1, createdAt: -1 },
};

/**
 * Builds a Mongo filter object from public query params.
 * Every filter is optional and additive.
 */
// Escapes regex special characters so search input can never throw or be
// interpreted as a pattern (e.g. someone searching "Swift (2020)").
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPublicFilter(query) {
  const filter = {};

  if (query.q) {
    // A plain MongoDB $text search only matches whole, stemmed words — so
    // typing "Swi" never finds "Swift" and "corol" never finds "Corolla".
    // That's what was behind the "search not working" reports. Instead,
    // match the same forgiving word-prefix regex used by the instant
    // search suggestions endpoint, so partial typing behaves like users
    // expect from a search box.
    const words = query.q.trim().split(/\s+/).filter(Boolean).map(escapeRegex);
    if (words.length) {
      const pattern = new RegExp(words.join('|'), 'i');
      filter.$or = [
        { brand: pattern },
        { model: pattern },
        { variant: pattern },
        { color: pattern },
        { location: pattern },
      ];
    }
  }
  if (query.brand) filter.brand = { $in: query.brand.split(',') };
  if (query.model) filter.model = { $in: query.model.split(',') };
  if (query.variant) filter.variant = { $in: query.variant.split(',') };
  if (query.fuelType) filter.fuelType = { $in: query.fuelType.split(',') };
  if (query.transmission) filter.transmission = { $in: query.transmission.split(',') };
  if (query.owner) filter.owner = { $in: query.owner.split(',') };
  if (query.bodyType) filter.bodyType = { $in: query.bodyType.split(',') };
  if (query.color) filter.color = { $in: query.color.split(',') };
  if (query.location) filter.location = { $in: query.location.split(',') };
  if (query.branch) filter.branch = { $in: query.branch.split(',') };
  if (query.seats) filter.seats = Number(query.seats);

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.minKm || query.maxKm) {
    filter.kilometersDriven = {};
    if (query.minKm) filter.kilometersDriven.$gte = Number(query.minKm);
    if (query.maxKm) filter.kilometersDriven.$lte = Number(query.maxKm);
  }

  if (query.manufacturingYear) filter.manufacturingYear = Number(query.manufacturingYear);
  if (query.registrationYear) filter.registrationYear = Number(query.registrationYear);

  if (query.insuranceActiveOnly === 'true') filter.insuranceActive = true;
  if (query.fcValidOnly === 'true') filter.fcValid = true;
  if (query.featuredOnly === 'true') filter.isFeatured = true;

  // Explicit status filter (Available / Sold / Reserved) takes priority over
  // everything else below — this is what powers the public status tabs and
  // the admin "Sold Cars" / "Featured Cars" sidebar links.
  if (query.status) {
    filter.status = query.status;
  } else if (query.availableOnly === 'true') {
    filter.status = 'Available';
  } else if (!query.includeSold) {
    // Public listing should never show Sold cars by default unless the
    // caller explicitly asked for a status or passed includeSold.
    filter.status = { $ne: 'Sold' };
  }

  return filter;
}

// GET /api/cars  (public: browse, search, filter, sort, paginate)
const getCars = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 12, 48);
  const filter = buildPublicFilter(req.query);
  const sort = SORT_MAP[req.query.sort] || SORT_MAP.newest;

  const [cars, total] = await Promise.all([
    Car.find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Car.countDocuments(filter),
  ]);

  res.json({
    success: true,
    cars,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    },
  });
});

// GET /api/cars/suggestions?q=  (instant search suggestions/autocomplete)
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ success: true, suggestions: [] });

  const regex = new RegExp(q.split(' ').filter(Boolean).join('|'), 'i');
  const cars = await Car.find({
    status: { $ne: 'Sold' },
    $or: [{ brand: regex }, { model: regex }, { variant: regex }],
  })
    .select('brand model variant slug')
    .limit(8)
    .lean();

  const suggestions = cars.map((c) => ({
    label: [c.brand, c.model, c.variant].filter(Boolean).join(' '),
    slug: c.slug,
  }));

  res.json({ success: true, suggestions });
});

// GET /api/cars/:idOrSlug  (public: car details; increments view count)
const getCarByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

  const car = await Car.findOneAndUpdate(
    isObjectId ? { _id: idOrSlug } : { slug: idOrSlug },
    { $inc: { views: 1 } },
    { new: true }
  ).lean();

  if (!car) {
    res.status(404);
    throw new Error('Car not found.');
  }

  res.json({ success: true, car });
});

// GET /api/cars/:id/similar  (public: smart "Similar Cars You Might Like")
const getSimilarCars = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id).lean();
  if (!car) {
    res.status(404);
    throw new Error('Car not found.');
  }

  const limit = Math.min(parseInt(req.query.limit, 10) || 8, 24);
  const { cars, total } = await findSimilarCars(car, { limit });

  res.json({ success: true, total, cars });
});

// POST /api/admin/cars  (admin only: create/upload car)
const createCar = asyncHandler(async (req, res) => {
  const images = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));

  const car = await Car.create({
    ...req.body,
    features: parseArrayField(req.body.features),
    images,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, car });
});

// PUT /api/admin/cars/:id  (admin only: edit car, add/replace/remove images)
const updateCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    res.status(404);
    throw new Error('Car not found.');
  }

  // The plain edit form must never be able to flip a car to Sold — that
  // has to go through completeSale so profit/buyer data is always
  // captured. (Saving a car that's already Sold, with status left as
  // Sold, is unaffected — this only blocks a *transition* into Sold.)
  if (req.body.status === 'Sold' && car.status !== 'Sold') {
    res.status(400);
    throw new Error('Use the Complete Sale flow to mark a car as Sold.');
  }

  const newImages = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));
  const keepImageUrls = parseArrayField(req.body.keepImages); // images the admin chose to keep
  const previousPriceValue = car.price;

  Object.assign(car, req.body);
  if (req.body.features) car.features = parseArrayField(req.body.features);

  // Auto-detect a price reduction so the public "Price Dropped" badge works
  // without the admin having to fill in a separate field.
  if (req.body.price !== undefined) {
    const newPrice = Number(req.body.price);
    if (!Number.isNaN(newPrice) && newPrice < previousPriceValue) {
      car.previousPrice = previousPriceValue;
      car.priceReducedAt = new Date();
    } else if (!Number.isNaN(newPrice) && newPrice >= previousPriceValue) {
      // Price went back up (or unchanged) — the drop is no longer relevant.
      car.previousPrice = undefined;
      car.priceReducedAt = undefined;
    }
  }

  if (newImages.length || req.body.keepImages !== undefined) {
    const kept = keepImageUrls
      ? car.images.filter((img) => keepImageUrls.includes(img.url))
      : car.images;
    car.images = [...kept, ...newImages];
  }

  await car.save();
  res.json({ success: true, car });
});

// DELETE /api/admin/cars/:id
const deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findByIdAndDelete(req.params.id);
  if (!car) {
    res.status(404);
    throw new Error('Car not found.');
  }
  res.json({ success: true, message: 'Car deleted.' });
});

// PATCH /api/admin/cars/:id/status  { status: 'Available' | 'Reserved' }
// Marking a car Sold is intentionally NOT allowed here — it must go through
// completeSale below so profit/buyer data is always captured, never skipped.
const updateCarStatus = asyncHandler(async (req, res) => {
  if (req.body.status === 'Sold') {
    res.status(400);
    throw new Error('Use the Complete Sale flow to mark a car as Sold.');
  }

  const car = await Car.findById(req.params.id);
  if (!car) {
    res.status(404);
    throw new Error('Car not found.');
  }

  car.status = req.body.status;
  // Moving a previously-sold car back to Available/Reserved (e.g. a sale
  // fell through) clears the stale sale record so it stops counting toward
  // revenue/profit analytics.
  if (car.sale?.soldPrice !== undefined) {
    car.sale = undefined;
  }
  await car.save();

  res.json({ success: true, car });
});

// PATCH /api/admin/cars/:id/complete-sale
// { soldPrice, purchasePrice, buyerName, buyerPhone, saleDate, paymentMethod, financeCompany, salesExecutive, notes }
const completeSale = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    res.status(404);
    throw new Error('Car not found.');
  }

  const { soldPrice, purchasePrice, buyerName, buyerPhone, saleDate, paymentMethod, financeCompany, salesExecutive, notes } = req.body;

  if (soldPrice === undefined || soldPrice === '' || Number.isNaN(Number(soldPrice))) {
    res.status(400);
    throw new Error('Selling price is required to complete a sale.');
  }
  if (!buyerName || !buyerName.trim()) {
    res.status(400);
    throw new Error('Buyer name is required to complete a sale.');
  }

  const soldPriceNum = Number(soldPrice);
  const purchasePriceNum = purchasePrice !== undefined && purchasePrice !== '' ? Number(purchasePrice) : undefined;

  car.status = 'Sold';
  car.sale = {
    soldPrice: soldPriceNum,
    purchasePrice: purchasePriceNum,
    profit: purchasePriceNum !== undefined ? soldPriceNum - purchasePriceNum : undefined,
    buyerName: buyerName.trim(),
    buyerPhone,
    saleDate: saleDate ? new Date(saleDate) : new Date(),
    paymentMethod,
    financeCompany,
    salesExecutive,
    notes,
  };

  await car.save();
  res.json({ success: true, car });
});

// PATCH /api/admin/cars/:id/feature  { isFeatured: boolean }
const updateCarFeatured = asyncHandler(async (req, res) => {
  const car = await Car.findByIdAndUpdate(
    req.params.id,
    { isFeatured: Boolean(req.body.isFeatured) },
    { new: true }
  );
  if (!car) {
    res.status(404);
    throw new Error('Car not found.');
  }
  res.json({ success: true, car });
});

// POST /api/admin/cars/:id/duplicate
const duplicateCar = asyncHandler(async (req, res) => {
  const original = await Car.findById(req.params.id).lean();
  if (!original) {
    res.status(404);
    throw new Error('Car not found.');
  }
  delete original._id;
  delete original.slug;
  delete original.createdAt;
  delete original.updatedAt;
  original.status = 'Available';
  original.isFeatured = false;
  original.views = 0;

  const duplicate = await Car.create({ ...original, createdBy: req.user._id });
  res.status(201).json({ success: true, car: duplicate });
});

// POST /api/admin/cars/bulk-delete  { ids: [] }
const bulkDeleteCars = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  await Car.deleteMany({ _id: { $in: ids || [] } });
  res.json({ success: true, message: `${(ids || []).length} car(s) deleted.` });
});

// POST /api/admin/cars/bulk-feature  { ids: [], isFeatured: boolean }
const bulkFeatureCars = asyncHandler(async (req, res) => {
  const { ids, isFeatured } = req.body;
  await Car.updateMany({ _id: { $in: ids || [] } }, { isFeatured: Boolean(isFeatured) });
  res.json({ success: true, message: `${(ids || []).length} car(s) updated.` });
});

// GET /api/admin/cars  (admin table view: all statuses, richer filtering)
const getAdminCars = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 20, 100);
  const filter = buildPublicFilter({ ...req.query, includeSold: true });

  const [cars, total] = await Promise.all([
    Car.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Car.countDocuments(filter),
  ]);

  res.json({
    success: true,
    cars,
    pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) },
  });
});

// GET /api/admin/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalCars, availableCars, soldCars, reservedCars, featuredCars, recentUploads] = await Promise.all([
    Car.countDocuments({}),
    Car.countDocuments({ status: 'Available' }),
    Car.countDocuments({ status: 'Sold' }),
    Car.countDocuments({ status: 'Reserved' }),
    Car.countDocuments({ isFeatured: true }),
    Car.find({}).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  // Monthly sales stats for the last 6 months (based on saleDate when status flips to Sold).
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // ✅ FIXED: Replaced `'$price'` with `'$sale.soldPrice'` to prevent counting unsold cars
  const salesStats = await Car.aggregate([
    { 
      $match: { 
        status: 'Sold', 
        'sale.soldPrice': { $ne: null },
        'sale.saleDate': { $gte: sixMonthsAgo } 
      } 
    },
    {
      $group: {
        _id: { year: { $year: '$sale.saleDate' }, month: { $month: '$sale.saleDate' } },
        count: { $sum: 1 },
        revenue: { $sum: '$sale.soldPrice' },
        profit: { $sum: '$sale.profit' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Revenue/profit analytics — only counts cars that actually went through
  // the Complete Sale flow (car.sale.soldPrice is set), keyed off saleDate.
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [revenueBuckets] = await Car.aggregate([
    { $match: { 'sale.soldPrice': { $ne: null } } },
    {
      $facet: {
        lifetime: [
          { $group: { _id: null, revenue: { $sum: '$sale.soldPrice' }, profit: { $sum: '$sale.profit' }, count: { $sum: 1 } } },
        ],
        year: [
          { $match: { 'sale.saleDate': { $gte: startOfYear } } },
          { $group: { _id: null, revenue: { $sum: '$sale.soldPrice' }, profit: { $sum: '$sale.profit' }, count: { $sum: 1 } } },
        ],
        month: [
          { $match: { 'sale.saleDate': { $gte: startOfMonth } } },
          { $group: { _id: null, revenue: { $sum: '$sale.soldPrice' }, profit: { $sum: '$sale.profit' }, count: { $sum: 1 } } },
        ],
        today: [
          { $match: { 'sale.saleDate': { $gte: startOfToday } } },
          { $group: { _id: null, revenue: { $sum: '$sale.soldPrice' }, profit: { $sum: '$sale.profit' }, count: { $sum: 1 } } },
        ],
      },
    },
  ]);

  const bucket = (key) => revenueBuckets[key][0] || { revenue: 0, profit: 0, count: 0 };
  const lifetime = bucket('lifetime');

  res.json({
    success: true,
    stats: { totalCars, availableCars, soldCars, reservedCars, featuredCars },
    recentUploads,
    salesStats,
    revenue: {
      today: bucket('today'),
      month: bucket('month'),
      year: bucket('year'),
      lifetime,
      averageSellingPrice: lifetime.count > 0 ? Math.round(lifetime.revenue / lifetime.count) : 0,
      averageProfit: lifetime.count > 0 ? Math.round(lifetime.profit / lifetime.count) : 0,
    },
  });
});

// GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const [revenueByBrand, topSellingModels, fuelDistribution, statusDistribution, revenueByExecutive] = await Promise.all([
    // Revenue + profit + units sold, grouped by brand — only cars that
    // actually went through Complete Sale.
    Car.aggregate([
      { $match: { 'sale.soldPrice': { $ne: null } } },
      {
        $group: {
          _id: '$brand',
          revenue: { $sum: '$sale.soldPrice' },
          profit: { $sum: '$sale.profit' },
          unitsSold: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),

    // Best-selling brand+model combinations by units sold.
    Car.aggregate([
      { $match: { 'sale.soldPrice': { $ne: null } } },
      {
        $group: {
          _id: { brand: '$brand', model: '$model' },
          unitsSold: { $sum: 1 },
          revenue: { $sum: '$sale.soldPrice' },
        },
      },
      { $sort: { unitsSold: -1, revenue: -1 } },
      { $limit: 8 },
    ]),

    // Fuel type split across the whole live inventory (not just sold cars).
    Car.aggregate([
      { $group: { _id: '$fuelType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Available / Sold / Reserved split.
    Car.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Revenue attributed to each named sales executive.
    Car.aggregate([
      { $match: { 'sale.soldPrice': { $ne: null }, 'sale.salesExecutive': { $nin: [null, ''] } } },
      {
        $group: {
          _id: '$sale.salesExecutive',
          revenue: { $sum: '$sale.soldPrice' },
          unitsSold: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),
  ]);

  res.json({
    success: true,
    revenueByBrand: revenueByBrand.map((r) => ({ brand: r._id, revenue: r.revenue, profit: r.profit, unitsSold: r.unitsSold })),
    topSellingModels: topSellingModels.map((r) => ({ brand: r._id.brand, model: r._id.model, unitsSold: r.unitsSold, revenue: r.revenue })),
    fuelDistribution: fuelDistribution.map((r) => ({ fuelType: r._id, count: r.count })),
    statusDistribution: statusDistribution.map((r) => ({ status: r._id, count: r.count })),
    revenueByExecutive: revenueByExecutive.map((r) => ({ salesExecutive: r._id, revenue: r.revenue, unitsSold: r.unitsSold })),
  });
});

function parseArrayField(field) {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [field];
    } catch {
      return field.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

module.exports = {
  getCars,
  getSearchSuggestions,
  getCarByIdOrSlug,
  getSimilarCars,
  createCar,
  updateCar,
  deleteCar,
  updateCarStatus,
  completeSale,
  updateCarFeatured,
  duplicateCar,
  bulkDeleteCars,
  bulkFeatureCars,
  getAdminCars,
  getDashboardStats,
  getAnalytics,
};