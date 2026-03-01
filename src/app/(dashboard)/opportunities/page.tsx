import { OpportunitiesList } from "@/components/opportunities/OpportunitiesList";

export const metadata = { title: "Top Opportunities | Feedback Intelligence" };

export default function OpportunitiesPage() {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Top Opportunities</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Product opportunities with a score ≥ 60, sorted by product potential
        </p>
      </div>
      <OpportunitiesList />
    </div>
  );
}
