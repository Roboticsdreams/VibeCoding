import Link from "next/link";
import { BookmarkIcon, TagIcon, FolderIcon, SearchIcon, LogIn, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold">
            <BookmarkIcon className="mx-auto mb-4 h-20 w-20 text-primary" />
            Bookmarker
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Your personal bookmark management system
          </p>

          <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BookmarkIcon className="h-8 w-8" />}
              title="Save Bookmarks"
              description="Store and organize your favorite links"
            />
            <FeatureCard
              icon={<TagIcon className="h-8 w-8" />}
              title="Tag & Categorize"
              description="Organize with tags and categories"
            />
            <FeatureCard
              icon={<SearchIcon className="h-8 w-8" />}
              title="Powerful Search"
              description="Find bookmarks instantly"
            />
            <FeatureCard
              icon={<FolderIcon className="h-8 w-8" />}
              title="Multiple Views"
              description="Table, cards, or tree view"
            />
          </div>

          <div className="flex justify-center gap-4">
            <Link
              href="/outlook"
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
            >
              <BookmarkIcon size={18} />
              Outlook UI
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-2 rounded-lg bg-primary/80 px-6 py-3 text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus size={18} />
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3 hover:bg-accent hover:text-accent-foreground"
            >
              <LogIn size={18} />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-2 text-primary">{icon}</div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
