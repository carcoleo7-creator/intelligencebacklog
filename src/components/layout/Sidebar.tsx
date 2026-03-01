"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, TrendingUp, GitBranch, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/opportunities", label: "Top Opportunities", icon: TrendingUp },
  { href: "/routing", label: "Routing Panel", icon: GitBranch },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-200">
        <Zap className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-gray-900 text-sm">Feedback Intel</span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href)
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 px-3">Powered by Claude AI</p>
      </div>
    </aside>
  );
}
