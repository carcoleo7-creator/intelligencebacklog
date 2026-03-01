import { RoutingPanel } from "@/components/routing/RoutingPanel";
import { AuditLog } from "@/components/routing/AuditLog";

export const metadata = { title: "Routing Panel | Feedback Intelligence" };

export default function RoutingPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Routing Panel</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Route processed feedback to the right queue
          </p>
        </div>
        <RoutingPanel />
      </div>
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Audit Log</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            All actions taken on feedback items
          </p>
        </div>
        <AuditLog />
      </div>
    </div>
  );
}
