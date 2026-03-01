import { Suspense } from "react";
import { FeedbackFilters } from "@/components/feedback/FeedbackFilters";
import { FeedbackList } from "@/components/feedback/FeedbackList";

export const metadata = { title: "Inbox | Feedback Intelligence" };

export default function InboxPage() {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Inbox</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          All ingested feedback, classified and scored by AI
        </p>
      </div>
      <Suspense>
        <FeedbackFilters />
      </Suspense>
      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        }
      >
        <FeedbackList />
      </Suspense>
    </div>
  );
}
