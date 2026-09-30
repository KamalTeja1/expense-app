import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney } from '../../lib/format';
import './DonutChart.css';

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutSlice[];
  currency?: string;
  height?: number;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  currency: string;
}

function CustomTooltip({ active, payload, currency }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="donut-tooltip">
        <span className="donut-tooltip-name">{payload[0].name}</span>
        <span className="donut-tooltip-value">
          {formatMoney(payload[0].value ?? 0, currency)}
        </span>
      </div>
    );
  }
  return null;
}

export default function DonutChart({
  data,
  currency = 'INR',
  height = 220,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="donut-empty" style={{ height }}>
        <span>No data</span>
      </div>
    );
  }

  return (
    <div className="donut-wrap" data-testid="donut-chart">
      <div className="donut-chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} />} cursor={false} />
          </PieChart>
        </ResponsiveContainer>

        <div className="donut-center">
          <div className="donut-total">{formatMoney(total, currency)}</div>
          <div className="donut-total-label">Total</div>
        </div>
      </div>

      <ul className="donut-legend">
        {data.map((d, i) => {
          const pct = ((d.value / total) * 100).toFixed(1);
          return (
            <li key={i} className="donut-legend-item">
              <span className="donut-dot" style={{ background: d.color }} />
              <span className="donut-legend-name">{d.name}</span>
              <span className="donut-legend-value">
                {formatMoney(d.value, currency)}
              </span>
              <span className="donut-legend-pct">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}