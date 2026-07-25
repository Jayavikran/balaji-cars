import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { calculateEmi, DEFAULT_EMI_ASSUMPTIONS } from '@/utils/emi';

const TENURE_OPTIONS = [12, 24, 36, 48, 60, 72, 84];
const COLORS = ['#0E9F6E', '#0F1B2D'];

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
    <div className="surface-card rounded-card p-5 sm:p-6">
      <h3 className="font-display font-semibold text-lg text-ink dark:text-white mb-1">EMI Calculator</h3>
      <p className="text-xs text-body mb-5">Estimate your monthly payment. Actual rates depend on your lender and credit profile.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      ? 'bg-navy dark:bg-emerald text-white border-navy dark:border-emerald'
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
          <div className="w-full h-44 relative">
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
              <p className="text-[10px] text-body uppercase tracking-wide">per month</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-4 text-center">
            <div className="bg-surface dark:bg-white/5 rounded-xl py-2.5">
              <p className="text-[10px] text-body uppercase tracking-wide">Total Interest</p>
              <p className="text-sm font-semibold text-ink dark:text-white">{formatINR(result.totalInterest)}</p>
            </div>
            <div className="bg-surface dark:bg-white/5 rounded-xl py-2.5">
              <p className="text-[10px] text-body uppercase tracking-wide">Total Amount</p>
              <p className="text-sm font-semibold text-ink dark:text-white">{formatINR(result.totalAmount)}</p>
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
        <span className="text-sm font-semibold text-ink dark:text-white">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald"
        aria-label={label}
      />
    </div>
  );
}
