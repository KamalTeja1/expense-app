import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatMoney } from '../../lib/format';
import './TrendArea.css';

export interface TrendPoint {
  date: string;
  expenseMinor: number;
}

export interface TrendAreaProps {
  data: TrendPoint[];
  currency?: string;
  height?: number;
}

export default function TrendArea({
  data,
  currency = 'INR',
  height = 220,
}: TrendAreaProps) {
  if (data.length === 0) {
    return (
      <div className="trend-empty" style={{ height }}>
        <span>No data</span>
      </div>
    );
  }

  return (
    <div className="trend-wrap" data-testid="trend-area">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#409BD2" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#409BD2" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="#eef4f9" />

          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => format(parseISO(v), 'd')}
            interval="preserveStartEnd"
            minTickGap={28}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#7c8ea0' }}
          />

          <YAxis hide domain={[0, 'dataMax']} />

          <Tooltip
            cursor={{ stroke: '#A6D1EA', strokeWidth: 1 }}
            content={(props) => {
              const { active, payload } = props;
              if (!active || !payload || !payload.length) return null;
              const point = payload[0].payload as TrendPoint;
              return (
                <div className="trend-tooltip">
                  <span className="trend-tooltip-date">
                    {format(parseISO(point.date), 'd MMM')}
                  </span>
                  <span className="trend-tooltip-value">
                    {formatMoney(point.expenseMinor, currency)}
                  </span>
                </div>
              );
            }}
          />

          <Area
            type="monotone"
            dataKey="expenseMinor"
            stroke="#007AC3"
            strokeWidth={2.5}
            fill="url(#trendFill)"
            dot={false}
            activeDot={{ r: 5, fill: 'white', stroke: '#007AC3', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}