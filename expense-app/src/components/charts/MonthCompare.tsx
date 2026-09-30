import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatMoney, monthLabel } from '../../lib/format';
import './MonthCompare.css';

export interface MonthCompareItem {
  monthKey: string;
  incomeMinor: number;
  expenseMinor: number;
}

export interface MonthCompareProps {
  data: MonthCompareItem[];
  currency?: string;
  height?: number;
}

export default function MonthCompare({
  data,
  currency = 'INR',
  height = 240,
}: MonthCompareProps) {
  if (data.length === 0) {
    return (
      <div className="month-compare-empty" style={{ height }}>
        <span>No data</span>
      </div>
    );
  }

  return (
    <div className="month-compare" data-testid="month-compare">
      <div className="month-compare-legend">
        <span className="mc-legend-item">
          <span className="mc-dot mc-dot-income" /> Income
        </span>
        <span className="mc-legend-item">
          <span className="mc-dot mc-dot-expense" /> Expense
        </span>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          barGap={2}
          barCategoryGap="20%"
        >
          <CartesianGrid vertical={false} stroke="#eef4f9" />

          <XAxis
            dataKey="monthKey"
            tickFormatter={(key: string) => format(parseISO(`${key}-01`), 'MMM')}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#7c8ea0' }}
          />

          <YAxis hide domain={[0, 'dataMax']} />

          <Tooltip
            cursor={{ fill: 'rgba(166,209,234,0.15)' }}
            content={(props) => {
              const { active, payload } = props;
              if (!active || !payload || !payload.length) return null;
              const row = payload[0].payload as MonthCompareItem;
              return (
                <div className="mc-tooltip">
                  <div className="mc-tooltip-title">{monthLabel(row.monthKey)}</div>
                  <div className="mc-tooltip-row">
                    <span className="mc-dot mc-dot-income" />
                    <span className="mc-tooltip-label">Income</span>
                    <span className="mc-tooltip-value">
                      {formatMoney(row.incomeMinor, currency)}
                    </span>
                  </div>
                  <div className="mc-tooltip-row">
                    <span className="mc-dot mc-dot-expense" />
                    <span className="mc-tooltip-label">Expense</span>
                    <span className="mc-tooltip-value">
                      {formatMoney(row.expenseMinor, currency)}
                    </span>
                  </div>
                </div>
              );
            }}
          />

          <Bar dataKey="incomeMinor" fill="#85BC20" radius={[6, 6, 0, 0]} barSize={10} />
          <Bar dataKey="expenseMinor" fill="#E5202E" radius={[6, 6, 0, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}