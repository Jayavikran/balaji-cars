const Car = require('../models/Car');

/**
 * Scores a candidate car against the reference car across weighted
 * dimensions. Higher score = more similar. This lets us do a single
 * broad DB query, then rank in-memory rather than running many
 * increasingly loose queries.
 */
function scoreCandidate(ref, candidate) {
  let score = 0;

  if (candidate.location && ref.location && candidate.location === ref.location) score += 25; // highest priority
  if (candidate.brand === ref.brand) score += 20;
  if (candidate.model === ref.model) score += 15;
  if (candidate.bodyType === ref.bodyType) score += 12;
  if (candidate.fuelType === ref.fuelType) score += 8;
  if (candidate.transmission === ref.transmission) score += 6;
  if (candidate.seats === ref.seats) score += 4;

  if (ref.price) {
    const priceDiff = Math.abs(candidate.price - ref.price) / ref.price;
    if (priceDiff <= 0.2) score += 15 * (1 - priceDiff / 0.2);
  }

  if (ref.manufacturingYear) {
    const yearDiff = Math.abs(candidate.manufacturingYear - ref.manufacturingYear);
    if (yearDiff <= 3) score += 10 * (1 - yearDiff / 3);
  }

  if (ref.kilometersDriven) {
    const kmDiff = Math.abs(candidate.kilometersDriven - ref.kilometersDriven) / Math.max(ref.kilometersDriven, 1);
    if (kmDiff <= 0.5) score += 8 * (1 - kmDiff / 0.5);
  }

  return score;
}

/**
 * Finds similar cars to `refCar`, gradually widening the pool if not
 * enough strong matches exist. Never includes the reference car itself,
 * and only returns Available/Reserved cars (not Sold) by default.
 *
 * @param {object} refCar - mongoose Car document (or plain object) being viewed
 * @param {object} options - { limit, excludeSold }
 */
async function findSimilarCars(refCar, options = {}) {
  const { limit = 8, excludeSold = true } = options;

  const baseFilter = { _id: { $ne: refCar._id } };
  if (excludeSold) baseFilter.status = { $ne: 'Sold' };

  // Tier 1: tight match - same brand+model, close price/year band.
  // Tier 2: same brand or same body type.
  // Tier 3: broad fallback - same fuel/transmission or just active listings.
  const tiers = [
    {
      ...baseFilter,
      brand: refCar.brand,
      $or: [{ model: refCar.model }, { bodyType: refCar.bodyType }],
    },
    {
      ...baseFilter,
      $or: [{ brand: refCar.brand }, { bodyType: refCar.bodyType }, { fuelType: refCar.fuelType }],
    },
    { ...baseFilter },
  ];

  const collected = new Map();

  for (const filter of tiers) {
    if (collected.size >= limit * 3) break; // gather a decent candidate pool before scoring

    const results = await Car.find(filter).limit(50).lean();
    for (const car of results) {
      collected.set(car._id.toString(), car);
    }
    if (collected.size >= 16) break; // enough candidates to rank meaningfully
  }

  const scored = Array.from(collected.values())
    .map((car) => ({ car, score: scoreCandidate(refCar, car) }))
    .sort((a, b) => b.score - a.score);

  return {
    total: scored.length,
    cars: scored.slice(0, limit).map((s) => s.car),
  };
}

module.exports = { findSimilarCars, scoreCandidate };
