import type { ChangeEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { getSettings, saveSettings } from '../../lib/db';
import { useAppStore } from '../../store/useAppStore';
import type { AppSettings } from '../../lib/types';
import './PreferencesPanel.css';

export default function PreferencesPanel() {
  const setCurrency = useAppStore((s) => s.setCurrency);
  const setLocale = useAppStore((s) => s.setLocale);
  const settings = useLiveQuery(() => getSettings(), []) as AppSettings | undefined;

  const onCurrency = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
  };
  const onLocale = (e: ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value);
  };
  const onMonthStart = async (e: ChangeEvent<HTMLSelectElement>) => {
    await saveSettings({ monthStartDay: Number(e.target.value) });
  };

  return (
    <Card>
      <CardHeader title="Preferences" />
      <CardBody>
        <div className="pp-root">
          <label className="pp-field">
            <span className="pp-label">Currency</span>
            <select className="pp-input" value={settings?.currency ?? 'INR'} onChange={onCurrency}>
              <option value="INR">₹ Indian Rupee</option>
              <option value="USD">$ US Dollar</option>
              <option value="EUR">€ Euro</option>
              <option value="GBP">£ Pound Sterling</option>
              <option value="AED">AED Dirham</option>
              <option value="SGD">S$ Singapore Dollar</option>
            </select>
          </label>

          <label className="pp-field">
            <span className="pp-label">Locale</span>
            <select className="pp-input" value={settings?.locale ?? 'en-IN'} onChange={onLocale}>
              <option value="en-IN">English (India)</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="de-DE">German (Germany)</option>
              <option value="fr-FR">French (France)</option>
            </select>
          </label>

          <label className="pp-field">
            <span className="pp-label">Month starts on</span>
            <select
              className="pp-input"
              value={settings?.monthStartDay ?? 1}
              onChange={(e) => void onMonthStart(e)}
            >
              <option value={1}>1st</option>
              <option value={5}>5th</option>
              <option value={15}>15th</option>
              <option value={25}>25th</option>
              <option value={28}>28th</option>
            </select>
          </label>
        </div>
      </CardBody>
    </Card>
  );
}