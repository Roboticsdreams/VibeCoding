/**
 * Mock data for categories and multi-level subcategories
 */

export interface CategoryNode {
  id: string;
  name: string;
  count?: number;
  icon?: string;
  iconType?: 'folder' | 'star' | 'globe' | 'clock' | 'archive' | 'trash' |
             'code' | 'layout' | 'gift' | 'tool' | 'file' | 'zap' | 'smartphone' |
             'pen' | 'image' | 'cloud' | 'drawer';
  color?: string;
  bgImage?: string;
  active?: boolean;
  expanded?: boolean;
  subcategories?: CategoryNode[];
}

export type Category = CategoryNode;
export type Subcategory = CategoryNode;

export interface CategorySection {
  items: CategoryNode[];
}

// Mock data for sidebar categories
export const categories: CategorySection[] = [
  {
    items: [
      { 
        id: 'project-obiako', 
        name: 'Project Obiako', 
        iconType: 'folder',
        color: '#4A6DD9',
        expanded: false,
        subcategories: [
          { 
            id: 'obiako-frontend', 
            name: 'Frontend', 
            subcategories: [
              { id: 'obiako-frontend-ui', name: 'UI Library' },
              { id: 'obiako-frontend-build', name: 'Build & Deploy' }
            ]
          },
          { 
            id: 'obiako-backend', 
            name: 'Backend', 
            subcategories: [
              { id: 'obiako-backend-services', name: 'Services' },
              { id: 'obiako-backend-infra', name: 'Infrastructure' }
            ]
          },
          { 
            id: 'obiako-docs', 
            name: 'Documentation',
            subcategories: [
              { id: 'obiako-docs-architecture', name: 'Architecture' },
              { id: 'obiako-docs-process', name: 'Processes' }
            ]
          }
        ]
      },
      { 
        id: 'development', 
        name: 'Development', 
        iconType: 'code',
        color: '#4285F4',
        expanded: false,
        subcategories: [
          { 
            id: 'dev-javascript', 
            name: 'JavaScript', 
            subcategories: [
              { id: 'dev-javascript-fundamentals', name: 'Fundamentals' },
              { id: 'dev-javascript-patterns', name: 'Patterns' }
            ]
          },
          { 
            id: 'dev-frameworks', 
            name: 'Frameworks', 
            subcategories: [
              { 
                id: 'dev-react-ecosystem', 
                name: 'React Ecosystem', 
                subcategories: [
                  { id: 'react-hooks', name: 'Hooks' },
                  { id: 'react-performance', name: 'Performance' }
                ]
              },
              { 
                id: 'dev-nextjs', 
                name: 'Next.js', 
                subcategories: [
                  { id: 'nextjs-recipes', name: 'Recipes' },
                  { id: 'nextjs-deployment', name: 'Deployment' }
                ]
              },
              { id: 'dev-svelte', name: 'Svelte' }
            ]
          },
          { id: 'dev-python', name: 'Python' },
          { id: 'dev-tools', name: 'Tools' }
        ]
      },
      { 
        id: 'design', 
        name: 'Design', 
        iconType: 'layout',
        color: '#EA4C89',
        expanded: false,
        subcategories: [
          { 
            id: 'design-ui', 
            name: 'UI', 
            subcategories: [
              { id: 'design-ui-systems', name: 'Design Systems' },
              { id: 'design-ui-components', name: 'Components' }
            ]
          },
          { 
            id: 'design-ux', 
            name: 'UX', 
            subcategories: [
              { id: 'design-ux-research', name: 'Research' },
              { id: 'design-ux-patterns', name: 'Patterns' }
            ]
          },
          { 
            id: 'design-inspiration', 
            name: 'Inspiration',
            subcategories: [
              { id: 'design-inspiration-portfolio', name: 'Portfolios' },
              { id: 'design-inspiration-awards', name: 'Awards' }
            ]
          }
        ]
      },
    ]
  },
];
