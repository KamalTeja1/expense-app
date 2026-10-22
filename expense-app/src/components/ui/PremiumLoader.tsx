import './PremiumLoader.css';

interface PremiumLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export default function PremiumLoader({
  label = 'Preparing your view…',
  fullScreen = false,
}: PremiumLoaderProps) {
  return (
    <div
      className={`premium-loader${fullScreen ? ' premium-loader--fullscreen' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="premium-loader__panel">
        <div className="premium-loader__visual" aria-hidden="true">
          <div className="premium-loader__halo" />
          <div className="premium-loader__orbit premium-loader__orbit--outer" />
          <div className="premium-loader__orbit premium-loader__orbit--inner" />
          <div className="premium-loader__core">
            <span /><span /><span /><span />
          </div>
        </div>
        <div className="premium-loader__eyebrow">EXPENSE APP</div>
        <p className="premium-loader__label">{label}</p>
        <div className="premium-loader__track" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
