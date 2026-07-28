import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { calculateEmi, DEFAULT_EMI_ASSUMPTIONS } from '@/utils/emi';

const TENURE_OPTIONS = [12, 24, 36, 48, 60, 72, 84];
const COLORS = ['#F4B400', '#0F0F10'];

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function EMICalculator({ carPrice }: { carPrice: number }) {
  const [price, setPrice] = useState(carPrice);
  const [downPayment, setDownPayment] = useState(Math.round(carPrice * DEFAULT_EMI_ASSUMPTIONS.downPaymentRatio));
  const [rate, setRate] = useState(DEFAULT_EMI_ASSUMPTIONS.annualRatePercent);
  const [tenure, setTenure] = useState(DEFAULT_EMI_ASSUMPTIONS.tenureMonths);

  const result = useMemo(
    () => calculateEmi({ price, downPayment, annualRatePercent: rate, tenureMonths: tenure }),
    [price, downPayment, rate, tenure]
  );

  const chartData = [
    { name: 'Principal', value: result.principal },
    { name: 'Interest', value: Math.max(result.totalInterest, 0) },
  ];

  return (
    <div className="rounded-[28px] border border-line bg-white p-5 shadow-card">
      <div className="rounded-2xl bg-surface px-4 py-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Finance</p>
        <h3 className="mt-2 font-display text-lg font-bold text-ink">EMI Calculator</h3>
        <p className="mt-1 text-xs leading-6 text-body">Estimate your monthly payment. Actual rates depend on your lender and credit profile.</p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-5">
          <FieldSlider
            label="Vehicle Price" value={price} min={50000} max={10000000} step={5000}
            format={formatINR} onChange={setPrice}
          />
          <FieldSlider
            label="Down Payment" value={downPayment} min={0} max={price} step={5000}
            format={formatINR} onChange={setDownPayment}
          />
          <FieldSlider
            label="Interest Rate (p.a.)" value={rate} min={5} max={18} step={0.1}
            format={(v) => `${v.toFixed(1)}%`} onChange={setRate}
          />
          <div>
            <label className="text-xs font-medium text-body block mb-2">Loan Duration</label>
            <div className="flex flex-wrap gap-2">
              {TENURE_OPTIONS.map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setTenure(months)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    tenure === months
                      ? 'bg-[#F4B400] text-black border-[#F4B400]'
                      : 'bg-white dark:bg-transparent text-ink dark:text-white/80 border-line dark:border-white/15'
                  }`}
                >
                  {months / 12} yr{months / 12 !== 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  isAnimationActive
                  animationDuration={600}
                >
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatINR(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.p
                key={Math.round(result.monthlyEmi)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-bold text-xl text-ink dark:text-white"
              >
                {formatINR(result.monthlyEmi)}
              </motion.p>
              <p className="text-[10px] uppercase tracking-wide text-body">per month</p>
            </div>
          </div>

          <div className="mt-4 grid w-full grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-surface py-2.5">
              <p className="text-[10px] text-body uppercase tracking-wide">Total Interest</p>
              <p className="text-sm font-semibold text-ink">{formatINR(result.totalInterest)}</p>
            </div>
            <div className="rounded-2xl bg-surface py-2.5">
              <p className="text-[10px] text-body uppercase tracking-wide">Total Amount</p>
              <p className="text-sm font-semibold text-ink">{formatINR(result.totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldSlider({
  label, value, min, max, step, format, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-medium text-body">{label}</label>
        <span className="text-sm font-semibold text-ink">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#F4B400]"
        aria-label={label}
      />
    </div>
  );
}
