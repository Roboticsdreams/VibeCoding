import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Bookmarker",
  description: "Manage your bookmarks efficiently",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
