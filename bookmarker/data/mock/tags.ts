/**
 * Mock data for bookmark tags
 */

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

// All available tags for bookmarks
export const tags: Record<string, Tag> = {
  // Programming languages
  "react": { id: 'tag-1', name: 'react' },
  "frontend": { id: 'tag-2', name: 'frontend' },
  "javascript": { id: 'tag-3', name: 'javascript' },
  "nextjs": { id: 'tag-4', name: 'nextjs' },
  "framework": { id: 'tag-5', name: 'framework' },
  "css": { id: 'tag-6', name: 'css' },
  "design": { id: 'tag-7', name: 'design' },
  "html": { id: 'tag-8', name: 'html' },
  "typescript": { id: 'tag-9', name: 'typescript' },
  "programming": { id: 'tag-11', name: 'programming' },
  
  // Design related
  "ui": { id: 'tag-13', name: 'ui' },
  "tool": { id: 'tag-14', name: 'tool' },
  
  // Project specific
  "github": { id: 'tag-15', name: 'github' },
  "obiako": { id: 'tag-16', name: 'obiako' },
  "code": { id: 'tag-17', name: 'code' },
  "api": { id: 'tag-18', name: 'api' },
  "documentation": { id: 'tag-19', name: 'documentation' },
  
  // Unsorted examples
  "example": { id: 'tag-20', name: 'example' },
  "unsorted": { id: 'tag-21', name: 'unsorted' },
  "uncategorized": { id: 'tag-22', name: 'uncategorized' },
  "new": { id: 'tag-23', name: 'new' },
  
  // More design tags
  "inspiration": { id: 'tag-24', name: 'inspiration' },
  
  // Additional tags
  "tutorial": { id: 'tag-30', name: 'tutorial' },
  "reference": { id: 'tag-31', name: 'reference' },
  "mdn": { id: 'tag-32', name: 'mdn' },
  "nodejs": { id: 'tag-34', name: 'nodejs' },
  "backend": { id: 'tag-35', name: 'backend' },
  "python": { id: 'tag-36', name: 'python' },
  "django": { id: 'tag-37', name: 'django' },
  "web-framework": { id: 'tag-38', name: 'web-framework' },
  "vuejs": { id: 'tag-39', name: 'vuejs' },
  "frontend-framework": { id: 'tag-40', name: 'frontend-framework' },
  "angular": { id: 'tag-41', name: 'angular' },
  "ts": { id: 'tag-42', name: 'typescript' },
  "svelte": { id: 'tag-43', name: 'svelte' },
  "reactive": { id: 'tag-44', name: 'reactive' },
  "docker": { id: 'tag-45', name: 'docker' },
  "containers": { id: 'tag-46', name: 'containers' },
  "devops": { id: 'tag-47', name: 'devops' },
  "git": { id: 'tag-48', name: 'git' },
  "version-control": { id: 'tag-49', name: 'version-control' },
  "portfolio": { id: 'tag-51', name: 'portfolio' },
  "creative": { id: 'tag-52', name: 'creative' },
  "web-design": { id: 'tag-53', name: 'web-design' },
  "awards": { id: 'tag-54', name: 'awards' },
  "adobe": { id: 'tag-56', name: 'adobe' },
  "prototyping": { id: 'tag-57', name: 'prototyping' },
  "sketch": { id: 'tag-58', name: 'sketch' },
  "mac": { id: 'tag-59', name: 'mac' },
  "ux": { id: 'tag-60', name: 'ux' },
  "usability": { id: 'tag-61', name: 'usability' },
  "research": { id: 'tag-62', name: 'research' },
  "articles": { id: 'tag-63', name: 'articles' },
  "medium": { id: 'tag-64', name: 'medium' },
  "design-system": { id: 'tag-65', name: 'design-system' },
  "figma": { id: 'tag-66', name: 'figma' },
  "storybook": { id: 'tag-67', name: 'storybook' },
  "components": { id: 'tag-68', name: 'components' },
  "guidelines": { id: 'tag-69', name: 'guidelines' },
  "pr": { id: 'tag-70', name: 'pr' },
  "database": { id: 'tag-71', name: 'database' },
  "schema": { id: 'tag-72', name: 'schema' },
  "testing": { id: 'tag-73', name: 'testing' },
  "api-docs": { id: 'tag-74', name: 'api-docs' },
  "requirements": { id: 'tag-75', name: 'requirements' },
  "docs": { id: 'tag-76', name: 'docs' },
  "read-later": { id: 'tag-77', name: 'read-later' },
  "article": { id: 'tag-78', name: 'article' },
  "dev-tool": { id: 'tag-79', name: 'dev-tool' },
  "utility": { id: 'tag-80', name: 'utility' },
  "mobile": { id: 'tag-81', name: 'mobile' },
  "quick-save": { id: 'tag-82', name: 'quick-save' },
};

// Helper function to get tags by their names
export function getTagsByNames(tagNames: string[]): Tag[] {
  return tagNames.map(name => tags[name] || { id: `tag-${name}`, name });
}
