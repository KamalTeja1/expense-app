import { Card, CardBody } from '../../components/ui/Card';

export default function TransactionsSkeleton() {
  return (
    <Card>
      <CardBody>
        <div style={{ display: 'grid', gap: 12 }} aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                padding: '10px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: '#dbeafe' }} />
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ width: 160, height: 10, borderRadius: 99, background: '#bfdbfe' }} />
                  <div style={{ width: 100, height: 10, borderRadius: 99, background: '#dbeafe' }} />
                </div>
              </div>
              <div style={{ width: 90, height: 10, borderRadius: 99, background: '#bfdbfe' }} />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
