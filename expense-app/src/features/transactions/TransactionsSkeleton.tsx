import { Card, CardBody } from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import './TransactionsSkeleton.css';

export default function TransactionsSkeleton() {
  return (
    <div role="status" aria-label="Loading transactions">
      <Card>
        <CardBody>
          <div className="tx-skel-list" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="tx-skel-row"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <div className="tx-skel-left">
                  <Skeleton w={42} h={42} radius={14} />
                  <div className="tx-skel-lines">
                    <Skeleton w={`${112 + (index % 3) * 20}px`} h={12} />
                    <Skeleton w={76} h={9} />
                  </div>
                </div>
                <Skeleton w={64} h={13} />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
