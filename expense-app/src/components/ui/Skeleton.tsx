import clsx from 'clsx';
import './Skeleton.css';

export interface SkeletonProps {
  w?: number | string;
  h?: number | string;
  radius?: number | string;
  className?: string;
}

export default function Skeleton({
  w = '100%',
  h = 16,
  radius = 8,
  className,
}: SkeletonProps) {
  return (
    <div
      className={clsx('skeleton', className)}
      style={{
        width: typeof w === 'number' ? `${w}px` : w,
        height: typeof h === 'number' ? `${h}px` : h,
        borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
      }}
      data-testid="skeleton"
    />
  );
}