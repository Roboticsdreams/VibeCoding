/**
 * Mock data for bookmarks
 */

import { Tag, getTagsByNames } from './tags';

export type { Tag as BookmarkTag } from './tags';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  dateAdded: string;
  category?: string; 
  subcategory?: string;
  favicon?: string;
  thumbnail?: string;
  source: string;
  tags?: Tag[];
  notes?: string;
}

// Mock bookmarks data
export const bookmarks: Bookmark[] = [
  // Development category bookmarks
  {
    id: 'bookmark-1',
    title: 'React Official Documentation',
    url: 'https://reactjs.org/docs/getting-started.html',
    description: 'Official React documentation with guides, API reference and examples',
    dateAdded: '2023-05-12T10:30:00Z',
    category: 'development',
    subcategory: 'dev-frameworks',
    favicon: 'https://reactjs.org/favicon.ico',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
    source: 'reactjs.org',
    tags: getTagsByNames(['react', 'frontend', 'javascript'])
  },
  {
    id: 'bookmark-2',
    title: 'Next.js Documentation',
    url: 'https://nextjs.org/docs',
    description: 'The React Framework for Production - Learn how to use Next.js to build full-stack web applications',
    dateAdded: '2023-06-02T15:45:00Z',
    category: 'development',
    subcategory: 'dev-frameworks',
    favicon: 'https://nextjs.org/static/favicon/favicon.ico',
    thumbnail: 'https://www.drupal.org/files/project-images/nextjs-icon-dark-background.png',
    source: 'nextjs.org',
    tags: getTagsByNames(['react', 'nextjs', 'framework'])
  },
  {
    id: 'bookmark-4',
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    description: 'The TypeScript Handbook is a comprehensive guide to the TypeScript language',
    dateAdded: '2023-04-20T14:15:00Z',
    category: 'development',
    subcategory: 'dev-javascript',
    favicon: 'https://www.typescriptlang.org/favicon.ico',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg',
    source: 'typescriptlang.org',
    tags: getTagsByNames(['typescript', 'javascript', 'programming'])
  },
  // Additional JavaScript resources
  {
    id: 'bookmark-20',
    title: 'JavaScript.info',
    url: 'https://javascript.info/',
    description: 'The Modern JavaScript Tutorial - from fundamentals to advanced topics with simple, detailed explanations',
    dateAdded: '2023-03-15T08:24:00Z',
    category: 'development',
    subcategory: 'dev-javascript',
    favicon: 'https://javascript.info/img/favicon/favicon.png',
    source: 'javascript.info',
    tags: getTagsByNames(['javascript', 'tutorial', 'reference'])
  },
  {
    id: 'bookmark-21',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    description: 'JavaScript documentation with tutorials, references, and guides for web developers',
    dateAdded: '2023-02-18T12:35:00Z',
    category: 'development',
    subcategory: 'dev-javascript',
    favicon: 'https://developer.mozilla.org/favicon.ico',
    thumbnail: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png',
    source: 'developer.mozilla.org',
    tags: getTagsByNames(['javascript', 'mdn', 'documentation'])
  },
  {
    id: 'bookmark-22',
    title: 'Node.js Documentation',
    url: 'https://nodejs.org/en/docs/',
    description: 'Official documentation for Node.js - a JavaScript runtime built on Chrome\'s V8 JavaScript engine',
    dateAdded: '2023-03-22T16:12:00Z',
    category: 'development',
    subcategory: 'dev-javascript',
    favicon: 'https://nodejs.org/static/images/favicons/favicon.ico',
    source: 'nodejs.org',
    tags: getTagsByNames(['javascript', 'nodejs', 'backend'])
  },
  // Python resources
  {
    id: 'bookmark-23',
    title: 'Python Documentation',
    url: 'https://docs.python.org/3/',
    description: 'Official Python documentation with tutorials, library reference, and language reference',
    dateAdded: '2023-01-30T09:45:00Z',
    category: 'development',
    subcategory: 'dev-python',
    favicon: 'https://docs.python.org/3/_static/py.svg',
    source: 'docs.python.org',
    tags: getTagsByNames(['python', 'documentation', 'programming'])
  },
  {
    id: 'bookmark-24',
    title: 'Django Project',
    url: 'https://www.djangoproject.com/',
    description: 'Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design',
    dateAdded: '2023-02-12T14:23:00Z',
    category: 'development',
    subcategory: 'dev-python',
    favicon: 'https://static.djangoproject.com/img/favicon.6dbf28c0dad0.ico',
    source: 'djangoproject.com',
    tags: getTagsByNames(['python', 'django', 'web-framework'])
  },
  // Framework resources
  {
    id: 'bookmark-25',
    title: 'Vue.js Documentation',
    url: 'https://vuejs.org/guide/introduction.html',
    description: 'Vue.js - The Progressive JavaScript Framework',
    dateAdded: '2023-04-05T11:32:00Z',
    category: 'development',
    subcategory: 'dev-frameworks',
    favicon: 'https://vuejs.org/logo.svg',
    source: 'vuejs.org',
    tags: getTagsByNames(['javascript', 'vuejs', 'frontend-framework'])
  },
  {
    id: 'bookmark-26',
    title: 'Angular Documentation',
    url: 'https://angular.io/docs',
    description: 'Angular is a platform for building mobile and desktop web applications',
    dateAdded: '2023-04-08T13:42:00Z',
    category: 'development',
    subcategory: 'dev-frameworks',
    favicon: 'https://angular.io/assets/images/favicons/favicon.ico',
    source: 'angular.io',
    tags: getTagsByNames(['javascript', 'angular', 'ts'])
  },
  {
    id: 'bookmark-27',
    title: 'Svelte Documentation',
    url: 'https://svelte.dev/docs',
    description: 'Cybernetically enhanced web apps with less code',
    dateAdded: '2023-05-22T09:18:00Z',
    category: 'development',
    subcategory: 'dev-frameworks',
    favicon: 'https://svelte.dev/favicon.png',
    source: 'svelte.dev',
    tags: getTagsByNames(['javascript', 'svelte', 'reactive'])
  },
  {
    id: 'bookmark-45',
    title: 'Advanced React Hooks Patterns',
    url: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
    description: 'Best practices and advanced scenarios for composing custom React hooks',
    dateAdded: '2023-06-30T10:45:00Z',
    category: 'development',
    subcategory: 'react-hooks',
    favicon: 'https://react.dev/favicon.ico',
    source: 'react.dev',
    tags: getTagsByNames(['react', 'hooks', 'patterns'])
  },
  {
    id: 'bookmark-46',
    title: 'React Performance Checklist',
    url: 'https://kentcdodds.com/blog/optimize-react-re-renders',
    description: 'Practical guide for diagnosing and improving React performance issues',
    dateAdded: '2023-07-12T12:10:00Z',
    category: 'development',
    subcategory: 'react-performance',
    favicon: 'https://kentcdodds.com/favicon-32x32.png',
    source: 'kentcdodds.com',
    tags: getTagsByNames(['react', 'performance', 'optimization'])
  },
  {
    id: 'bookmark-47',
    title: 'Next.js Deployment Recipes',
    url: 'https://vercel.com/guides/deploying-nextjs',
    description: 'Step-by-step deployment approaches for Next.js apps across different platforms',
    dateAdded: '2023-08-01T09:00:00Z',
    category: 'development',
    subcategory: 'nextjs-deployment',
    favicon: 'https://vercel.com/favicon.ico',
    source: 'vercel.com',
    tags: getTagsByNames(['nextjs', 'deployment', 'guides'])
  },
  {
    id: 'bookmark-48',
    title: 'UI Design System Gallery',
    url: 'https://designsystemsrepo.com/',
    description: 'Collection of publicly available design systems and UI kits for inspiration',
    dateAdded: '2023-05-02T08:05:00Z',
    category: 'design',
    subcategory: 'design-ui-systems',
    favicon: 'https://designsystemsrepo.com/favicon.ico',
    source: 'designsystemsrepo.com',
    tags: getTagsByNames(['design-system', 'ui', 'reference'])
  },
  {
    id: 'bookmark-49',
    title: 'Award-Winning Website Showcase',
    url: 'https://www.cssdesignawards.com/',
    description: 'Daily inspiration of award-winning interactive experiences and portfolios',
    dateAdded: '2023-09-14T17:20:00Z',
    category: 'design',
    subcategory: 'design-inspiration-awards',
    favicon: 'https://www.cssdesignawards.com/favicon.ico',
    source: 'cssdesignawards.com',
    tags: getTagsByNames(['design', 'awards', 'inspiration'])
  },
  {
    id: 'bookmark-50',
    title: 'Reusable UI Component Libraries',
    url: 'https://storybook.js.org/showcase',
    description: 'Showcase of real-world products built with component-driven development',
    dateAdded: '2023-08-22T13:35:00Z',
    category: 'design',
    subcategory: 'design-ui-components',
    favicon: 'https://storybook.js.org/images/favicon.svg',
    source: 'storybook.js.org',
    tags: getTagsByNames(['components', 'storybook', 'design'])
  },
  // Dev tools
  {
    id: 'bookmark-28',
    title: 'Docker Documentation',
    url: 'https://docs.docker.com/',
    description: 'Docker documentation - containerization platform that enables developers to package applications',
    dateAdded: '2023-03-17T15:27:00Z',
    category: 'development',
    subcategory: 'dev-tools',
    favicon: 'https://docs.docker.com/favicon.ico',
    source: 'docs.docker.com',
    tags: getTagsByNames(['docker', 'containers', 'devops'])
  },
  {
    id: 'bookmark-29',
    title: 'Git Documentation',
    url: 'https://git-scm.com/doc',
    description: 'Git is a free and open source distributed version control system',
    dateAdded: '2023-01-25T10:05:00Z',
    category: 'development',
    subcategory: 'dev-tools',
    favicon: 'https://git-scm.com/favicon.ico',
    source: 'git-scm.com',
    tags: getTagsByNames(['git', 'version-control', 'tool'])
  },
  // Design category bookmarks
  {
    id: 'bookmark-3',
    title: 'Tailwind CSS',
    url: 'https://tailwindcss.com/docs',
    description: 'A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup',
    dateAdded: '2023-05-18T09:20:00Z',
    category: 'design',
    subcategory: 'design-ui',
    favicon: 'https://tailwindcss.com/favicon.ico',
    thumbnail: 'https://tailwindcss.com/_next/static/media/tailwindcss-mark.79614a5f61617ba49a0891494521226b.svg',
    source: 'tailwindcss.com',
    tags: getTagsByNames(['css', 'design', 'html'])
  },
  {
    id: 'bookmark-5',
    title: 'Figma - Online Design Tool',
    url: 'https://www.figma.com/',
    description: 'Figma is a collaborative interface design tool used by designers and teams',
    dateAdded: '2023-03-10T11:25:00Z',
    category: 'design',
    subcategory: 'design-ui',
    favicon: 'https://static.figma.com/app/icon/1/favicon.png',
    thumbnail: 'https://cdn.sanity.io/images/599r6htc/localized/46a76c802176eb17b0e0135c32ee9a164c3b2c97-1108x1108.png?w=670&h=670&q=75&fit=max&auto=format',
    source: 'figma.com',
    tags: getTagsByNames(['design', 'ui', 'tool'])
  },
  {
    id: 'bookmark-10',
    title: 'UI Design Inspiration - Dribbble',
    url: 'https://dribbble.com/',
    description: 'Design portfolio platform for discovering creative work and design inspiration',
    dateAdded: '2023-02-18T17:30:00Z',
    category: 'design',
    subcategory: 'design-inspiration',
    favicon: 'https://cdn.dribbble.com/assets/favicon-b38525134603b9513174ec887944bde1a869eb6cd414f4d640ee48ab2a15a26b.ico',
    thumbnail: 'https://cdn.dribbble.com/users/1622042/screenshots/16343752/media/1f23599207b3f6522639d3b327fd6754.jpg?compress=1&resize=400x300&vertical=top',
    source: 'dribbble.com',
    tags: getTagsByNames(['inspiration', 'design', 'ui'])
  },
  // Additional UI design resources
  {
    id: 'bookmark-30',
    title: 'Behance',
    url: 'https://www.behance.net/',
    description: 'Showcase and discover creative work from professional designers and creative agencies',
    dateAdded: '2023-04-28T16:25:00Z',
    category: 'design',
    subcategory: 'design-inspiration',
    favicon: 'https://a5.behance.net/2acd763b00852cc0586c893ee1a5a542d7d97221/ico/favicon.ico',
    source: 'behance.net',
    tags: getTagsByNames(['design', 'portfolio', 'creative'])
  },
  {
    id: 'bookmark-31',
    title: 'Awwwards',
    url: 'https://www.awwwards.com/',
    description: 'A website that recognizes and promotes the best of innovative web design',
    dateAdded: '2023-01-22T09:45:00Z',
    category: 'design',
    subcategory: 'design-inspiration',
    favicon: 'https://www.awwwards.com/favicon.ico',
    source: 'awwwards.com',
    tags: getTagsByNames(['web-design', 'awards', 'inspiration'])
  },
  // UI Design tools
  {
    id: 'bookmark-32',
    title: 'Adobe XD',
    url: 'https://www.adobe.com/products/xd.html',
    description: 'Design, prototype, and share user experiences for websites, mobile apps, voice interfaces, and more',
    dateAdded: '2023-03-12T15:18:00Z',
    category: 'design',
    subcategory: 'design-ui',
    favicon: 'https://www.adobe.com/content/dam/cc/icons/xd.svg',
    source: 'adobe.com',
    tags: getTagsByNames(['ui', 'adobe', 'prototyping'])
  },
  {
    id: 'bookmark-33',
    title: 'Sketch',
    url: 'https://www.sketch.com/',
    description: 'Design tool built specifically for product designers from start to finish',
    dateAdded: '2023-02-24T10:37:00Z',
    category: 'design',
    subcategory: 'design-ui',
    favicon: 'https://www.sketch.com/images/components/icons/favicon@2x.png',
    source: 'sketch.com',
    tags: getTagsByNames(['ui', 'sketch', 'mac'])
  },
  // UX Design
  {
    id: 'bookmark-34',
    title: 'Nielsen Norman Group',
    url: 'https://www.nngroup.com/',
    description: 'World leaders in research-based user experience, offering articles and reports on usability',
    dateAdded: '2023-05-14T14:12:00Z',
    category: 'design',
    subcategory: 'design-ux',
    favicon: 'https://media.nngroup.com/favicon.ico',
    source: 'nngroup.com',
    tags: getTagsByNames(['ux', 'usability', 'research'])
  },
  {
    id: 'bookmark-35',
    title: 'UX Collective',
    url: 'https://uxdesign.cc/',
    description: 'Curated stories on user experience, visual design, and product design',
    dateAdded: '2023-04-19T11:22:00Z',
    category: 'design',
    subcategory: 'design-ux',
    favicon: 'https://uxdesign.cc/favicon.ico',
    source: 'uxdesign.cc',
    tags: getTagsByNames(['ux', 'articles', 'medium'])
  },
  // Project Obiako bookmarks
  {
    id: 'bookmark-6',
    title: 'Project Obiako Architecture Diagram',
    url: 'https://example.com/obiako-architecture',
    description: 'System architecture diagram for Project Obiako showing all components and their interactions',
    dateAdded: '2023-07-01T09:30:00Z',
    category: 'project-obiako',
    subcategory: 'obiako-docs',
    source: 'example.com',
    notes: 'Reference this for all architectural decisions'
  },
  {
    id: 'bookmark-7',
    title: 'Obiako Frontend Repository',
    url: 'https://github.com/example/obiako-frontend',
    description: 'GitHub repository for the Obiako frontend codebase',
    dateAdded: '2023-06-28T14:20:00Z',
    category: 'project-obiako',
    subcategory: 'obiako-frontend',
    favicon: 'https://github.com/favicon.ico',
    source: 'github.com',
    tags: getTagsByNames(['github', 'obiako', 'code'])
  },
  {
    id: 'bookmark-8',
    title: 'Obiako Backend API Documentation',
    url: 'https://api-docs.obiako-project.com',
    description: 'API reference documentation for the Obiako backend services',
    dateAdded: '2023-06-15T16:45:00Z',
    category: 'project-obiako',
    subcategory: 'obiako-backend',
    source: 'api-docs.obiako-project.com',
    tags: getTagsByNames(['api', 'documentation', 'obiako'])
  },
  // Additional Project Obiako frontend items
  {
    id: 'bookmark-36',
    title: 'Obiako UI Design System',
    url: 'https://www.figma.com/file/example/obiako-ui-design-system',
    description: 'Figma design system with components and guidelines for the Obiako frontend',
    dateAdded: '2023-06-05T13:45:00Z',
    category: 'project-obiako',
    subcategory: 'obiako-frontend',
    favicon: 'https://static.figma.com/app/icon/1/favicon.png',
    source: 'figma.com',
    tags: getTagsByNames(['obiako', 'design-system', 'figma'])
  },
  {
    id: 'bookmark-37',
    title: 'Obiako Component Library',
    url: 'https://obiako-components.netlify.app',
    description: 'Storybook documentation for reusable Obiako UI components',
    dateAdded: '2023-06-10T11:22:00Z',
    category: 'project-obiako',
    subcategory: 'obiako-frontend',
    favicon: 'https://storybook.js.org/images/favicon.svg',
    source: 'netlify.app',
    tags: getTagsByNames(['obiako', 'storybook', 'components'])
  },
  {
    id: 'bookmark-38',
    title: 'Obiako Frontend PR Guidelines',
    url: 'https://github.com/example/obiako-frontend/wiki/PR-Guidelines',
    description: 'Guidelines for submitting and reviewing pull requests for Obiako frontend',
    dateAdded: '2023-05-28T09:15:00Z',
    category: 'project-obiako',
    subcategory: 'obiako-docs',
    favicon: 'https://github.com/favicon.ico',
    source: 'github.com',
    tags: getTagsByNames(['obiako', 'guidelines', 'pr'])
  },
  // Additional Project Obiako backend items
  {
    id: 'bookmark-39',
    title: 'Obiako Database Schema',
    url: 'https://dbdiagram.io/d/obiako-schema',
    description: 'Database schema diagram for the Obiako backend',
    dateAdded: '2023-06-12T14:05:00Z',
    category: 'project-obiako',
    subcategory: 'obiako-backend',
    source: 'dbdiagram.io',
    tags: getTagsByNames(['obiako', 'database', 'schema'])
  },
  {
    id: 'bookmark-40',
    title: 'Obiako API Testing Suite',
    url: 'https://github.com/example/obiako-backend/tree/main/tests',
    description: 'Test suite for Obiako backend API endpoints',
    dateAdded: '2023-06-14T10:35:00Z',
    category: 'project-obiako',
    subcategory: 'obiako-backend',
    favicon: 'https://github.com/favicon.ico',
    source: 'github.com',
    tags: getTagsByNames(['obiako', 'testing', 'api-docs'])
  },
  // Project Obiako documentation
  {
    id: 'bookmark-41',
    title: 'Obiako Project Requirements',
    url: 'https://confluence.example.com/obiako/requirements',
    description: 'Detailed requirements document for the Obiako project',
    dateAdded: '2023-04-25T15:30:00Z',
    category: 'project-obiako',
    subcategory: 'obiako-docs',
    favicon: 'https://confluence.atlassian.com/favicon.ico',
    source: 'confluence.example.com',
    tags: getTagsByNames(['obiako', 'requirements', 'docs'])
  },
  // Explicitly unsorted bookmarks
  {
    id: 'bookmark-9',
    title: 'Unsorted Bookmark Example',
    url: 'https://example.com/unsorted',
    description: 'An example bookmark that has been explicitly set as unsorted',
    dateAdded: '2023-05-05T10:10:00Z',
    category: 'unsorted',
    favicon: 'https://example.com/favicon.ico',
    source: 'example.com',
    tags: getTagsByNames(['example', 'unsorted'])
  },
  {
    id: 'bookmark-42',
    title: 'Interesting Article to Read Later',
    url: 'https://medium.com/example-article',
    description: 'An article I want to read later but haven\'t categorized yet',
    dateAdded: '2023-11-02T08:45:00Z',
    category: 'unsorted',
    favicon: 'https://medium.com/favicon.ico',
    source: 'medium.com',
    tags: getTagsByNames(['read-later', 'article'])
  },
  {
    id: 'bookmark-43',
    title: 'Cool Tool I Found',
    url: 'https://cooltools.example.com',
    description: 'A useful tool I discovered but need to categorize later',
    dateAdded: '2023-10-28T15:22:00Z',
    category: 'unsorted',
    favicon: 'https://example.com/favicon.ico',
    source: 'example.com',
    tags: getTagsByNames(['dev-tool', 'utility'])
  },
  // Implicitly unsorted bookmarks (no category)
  {
    id: 'bookmark-13',
    title: 'Uncategorized Bookmark Example',
    url: 'https://example.com/uncategorized',
    description: 'A bookmark saved without specifying any category',
    dateAdded: '2023-10-15T14:30:00Z',
    // No category specified - will be counted as 'unsorted'
    favicon: 'https://example.com/favicon.ico',
    source: 'example.com',
    tags: getTagsByNames(['uncategorized', 'new'])
  },
  {
    id: 'bookmark-44',
    title: 'Quick Save from Mobile',
    url: 'https://quicksaved.example.com',
    description: 'Something I saved quickly from my phone',
    dateAdded: '2023-11-10T09:12:00Z',
    // No category - will be counted as unsorted
    favicon: 'https://example.com/favicon.ico',
    source: 'example.com',
    tags: getTagsByNames(['mobile', 'quick-save'])
  }
];
