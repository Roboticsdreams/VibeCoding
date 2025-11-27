"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookmarkIcon, FolderIcon, PlusCircle, TagIcon, Search } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";


export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("User");

  // This is a mock implementation - in a real app, we'd fetch the user from an API or context
  useEffect(() => {
    // Simulate fetching the user name
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    } else {
      // Default to "User" if no name is stored
      setUserName("User");
    }
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
              </svg>
              Bookmarker
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold">Welcome, {userName}!</h1>
          <p className="text-muted-foreground mt-1">Manage your bookmarks efficiently</p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              className="w-full rounded-md border border-input pl-8 py-2 text-sm"
            />
          </div>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Bookmark
          </Button>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2">
            <div className="rounded-lg border bg-card shadow-sm p-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="rounded-full bg-primary/10 p-6">
                  <BookmarkIcon className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-center">No Bookmarks Yet</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  You haven&apos;t added any bookmarks yet. Get started by clicking the &quot;Add Bookmark&quot; button.                  
                </p>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Bookmark
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium">Categories</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Work</span>
                    </div>
                    <span className="text-xs text-muted-foreground">0</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Personal</span>
                    </div>
                    <span className="text-xs text-muted-foreground">0</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Learning</span>
                    </div>
                    <span className="text-xs text-muted-foreground">0</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t">
                <Button variant="ghost" size="sm" className="w-full">
                  <PlusCircle className="mr-2 h-3 w-3" />
                  Add Category
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium">Tags</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                    <TagIcon className="mr-1 h-3 w-3" />React
                  </span>
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <TagIcon className="mr-1 h-3 w-3" />JavaScript
                  </span>
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                    <TagIcon className="mr-1 h-3 w-3" />Tutorial
                  </span>
                </div>
              </div>
              <div className="p-4 border-t">
                <Button variant="ghost" size="sm" className="w-full">
                  <PlusCircle className="mr-2 h-3 w-3" />
                  Add Tag
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
