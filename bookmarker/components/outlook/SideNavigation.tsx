"use client";

import React, { useEffect, useMemo, useState } from 'react';
import NextImage from 'next/image';
import styles from './SideNavigation.module.css';
import { 
  Folder,
  FolderOpen,
  Star,
  Clock,
  Globe,
  Archive,
  Trash2,
  Code,
  Layout as LayoutIcon,
  Gift,
  Wrench as Tool,
  FileText,
  Zap,
  Smartphone,
  PenTool,
  Image as LucideImage,
  Inbox as Drawer,
  Cloud
} from 'lucide-react';

import type { Category, CategorySection } from '../../data/mock/categories';
import { categories as mockCategories } from '../../data/mock/categories';

const cloneCategories = (items: Category[] = []): Category[] => {
  return items.map(item => ({
    ...item,
    expanded: item.expanded ?? false,
    subcategories: item.subcategories ? cloneCategories(item.subcategories) : undefined
  }));
};

const buildParentMap = (sections: CategorySection[]) => {
  const map: Record<string, string | undefined> = {};

  const traverse = (nodes: Category[], parentId?: string) => {
    nodes.forEach(node => {
      map[node.id] = parentId;
      if (node.subcategories) {
        traverse(node.subcategories, node.id);
      }
    });
  };

  sections.forEach(section => traverse(section.items));
  return map;
};

const applyCountsToTree = (nodes: Category[], counts: Record<string, number>): Category[] => {
  return nodes.map(node => ({
    ...node,
    count: counts[node.id] || 0,
    subcategories: node.subcategories ? applyCountsToTree(node.subcategories, counts) : undefined
  }));
};

const findCategoryById = (nodes: Category[] = [], targetId?: string | null): Category | undefined => {
  if (!targetId) {
    return undefined;
  }
  const stack = [...nodes];
  while (stack.length) {
    const node = stack.pop();
    if (!node) {
      continue;
    }
    if (node.id === targetId) {
      return node;
    }
    if (node.subcategories) {
      stack.push(...node.subcategories);
    }
  }
  return undefined;
};

interface SideNavigationProps {
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  className?: string;
}

export default function SideNavigation({ 
  selectedCategory,
  onSelectCategory,
  className = ''
}: SideNavigationProps) {
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [bookmarkCounts, setBookmarkCounts] = useState<Record<string, number>>({ all: 0, unsorted: 0 });
  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const [secondaryPath, setSecondaryPath] = useState<string[]>([]);
  const parentMap = useMemo(() => buildParentMap(mockCategories), []);

  useEffect(() => {
    let isMounted = true;

    import('../../data/mock/bookmarks').then(({ bookmarks }) => {
      if (!isMounted) {
        return;
      }

      const counts: Record<string, number> = {
        all: bookmarks.length,
        unsorted: 0
      };

      bookmarks.forEach(bookmark => {
        if (!bookmark.category || bookmark.category === 'unsorted') {
          counts['unsorted'] = (counts['unsorted'] || 0) + 1;
          return;
        }

        let currentId: string | undefined = bookmark.subcategory || bookmark.category;

        while (currentId) {
          counts[currentId] = (counts[currentId] || 0) + 1;
          currentId = parentMap[currentId];
        }
      });

      const sectionsClone = mockCategories.map(section => ({
        ...section,
        items: cloneCategories(section.items)
      }));

      const processedTree = sectionsClone[0]?.items || [];
      const treeWithCounts = applyCountsToTree(processedTree, counts);

      setBookmarkCounts(counts);
      setMainCategories(treeWithCounts);
    });

    return () => {
      isMounted = false;
    };
  }, [parentMap]);

  useEffect(() => {
    if (!selectedCategory || selectedCategory === 'all' || selectedCategory === 'unsorted') {
      setActiveRootId(null);
      setSecondaryPath([]);
    }
  }, [selectedCategory]);

  const activeRootNode = useMemo(() => findCategoryById(mainCategories, activeRootId), [mainCategories, activeRootId]);

  const secondaryBreadcrumb = useMemo(() => {
    if (!activeRootNode || !secondaryPath.length) {
      return [] as { id: string; name: string }[];
    }

    const crumbs: { id: string; name: string }[] = [];
    let current: Category | undefined = activeRootNode;

    secondaryPath.forEach(id => {
      if (!current?.subcategories) {
        return;
      }
      const next = current.subcategories.find(child => child.id === id);
      if (next) {
        crumbs.push({ id: next.id, name: next.name });
        current = next;
      }
    });

    return crumbs;
  }, [activeRootNode, secondaryPath]);

  const secondaryParent = useMemo(() => {
    if (!activeRootNode || !secondaryPath.length) {
      return undefined;
    }

    let current: Category | undefined = activeRootNode;
    for (const id of secondaryPath) {
      if (!current?.subcategories) {
        return undefined;
      }
      const nextNode: Category | undefined = current.subcategories.find(child => child.id === id);
      if (!nextNode) {
        return undefined;
      }
      current = nextNode;
    }

    return current;
  }, [activeRootNode, secondaryPath]);

  const secondaryNodes = secondaryParent?.subcategories ?? [];

  const handleRootClick = (node: Category) => {
    setActiveRootId(node.id);
    setSecondaryPath([]);
    onSelectCategory(node.id);
  };

  const handleFirstLevelClick = (rootId: string, node: Category) => {
    setActiveRootId(rootId);
    if (node.subcategories && node.subcategories.length > 0) {
      setSecondaryPath([node.id]);
    } else {
      setSecondaryPath([]);
    }
    onSelectCategory(node.id);
  };

  const handleSecondaryNodeClick = (node: Category) => {
    const hasChildren = !!node.subcategories?.length;
    onSelectCategory(node.id);
    if (hasChildren) {
      setSecondaryPath(prev => [...prev, node.id]);
    }
  };

  const handleSecondaryBreadcrumbClick = (index: number) => {
    setSecondaryPath(prev => prev.slice(0, index + 1));
  };

  const handleSecondaryBack = () => {
    setSecondaryPath(prev => {
      if (prev.length <= 1) {
        return [];
      }
      return prev.slice(0, prev.length - 1);
    });
  };

  // Function to get icon component based on icon type
  const getIconComponent = (iconType: string | undefined, isSelected = false, color: string | undefined) => {
    // Default icon styling
    const iconSize = 16;
    const iconStyle = { color: color || '#666' };
    
    switch (iconType) {
      case 'folder':
        return isSelected ? <FolderOpen size={iconSize} style={iconStyle} /> : <Folder size={iconSize} style={iconStyle} />;
      case 'star':
        return <Star size={iconSize} style={iconStyle} />;
      case 'globe':
        return <Globe size={iconSize} style={iconStyle} />;
      case 'clock':
        return <Clock size={iconSize} style={iconStyle} />;
      case 'archive':
        return <Archive size={iconSize} style={iconStyle} />;
      case 'trash':
        return <Trash2 size={iconSize} style={iconStyle} />;
      case 'code':
        return <Code size={iconSize} style={iconStyle} />;
      case 'layout':
        return <LayoutIcon size={iconSize} style={iconStyle} />;
      case 'gift':
        return <Gift size={iconSize} style={iconStyle} />;
      case 'tool':
        return <Tool size={iconSize} style={iconStyle} />;
      case 'file':
        return <FileText size={iconSize} style={iconStyle} />;
      case 'zap':
        return <Zap size={iconSize} style={iconStyle} />;
      case 'smartphone':
        return <Smartphone size={iconSize} style={iconStyle} />;
      case 'pen':
        return <PenTool size={iconSize} style={iconStyle} />;
      case 'image':
        // eslint-disable-next-line jsx-a11y/alt-text
        return <LucideImage size={iconSize} style={iconStyle} aria-hidden="true" />;
      case 'cloud':
        return <Cloud size={iconSize} style={iconStyle} />;
      case 'drawer':
        return <Drawer size={iconSize} style={iconStyle} />;
      default:
        return <Folder size={iconSize} style={iconStyle} />;
    }
  };
  
  const primarySidebarStyle = {
    backgroundImage: "linear-gradient(rgba(222, 225, 228, 0.3), rgba(221, 222, 224, 0.3)), url('/background.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } as const;

  const secondarySidebarStyle = {
    backgroundImage: "linear-gradient(rgba(222, 225, 228, 0.3), rgba(221, 222, 224, 0.3)), url('/background.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#F5F5F5'
  } as const;

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <NextImage 
          src="/background.jpg" 
          alt="Sidebar background" 
          fill 
          priority
          sizes="(max-width: 768px) 100vw, 260px"
          quality={90}
          style={{ 
            objectFit: 'cover',
            objectPosition: 'center' 
          }} 
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5F7FA] to-[#EEF2F7] opacity-50 z-0" />
      
      <div className="relative z-10 flex h-full">
        {/* Primary sidebar */}
        <div className="flex flex-col w-[260px] border-r border-[#E8E8E8] backdrop-blur-sm relative" style={primarySidebarStyle}>
          <div className="h-12 border-b border-[#E8E8E8] flex items-center justify-between px-3">
            <h1 className="text-lg font-semibold text-[#232323]">
              Bookmarker<span className="text-[#0880FF] font-normal text-xs align-super">.io</span>
            </h1>
            <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-60 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#0880FF]">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          <div className={`flex-1 overflow-y-auto pb-16 ${styles.hideScrollbar}`}>
            <div className="mb-4 pt-1">
              <ul className="space-y-0.5">
                <li>
                  <div className="relative">
                    <button
                      className={`w-full flex items-center px-3 py-2 text-left relative overflow-hidden ${selectedCategory === 'all' ? 'text-[#0880FF] font-medium bg-white bg-opacity-90' : 'text-[#3A3A3A] hover:bg-white hover:bg-opacity-75'}`}
                      style={{ height: '32px', borderRadius: '0px', transition: 'background-color 0.15s ease' }}
                      onClick={() => onSelectCategory('all')}
                    >
                      <div className="flex-1 flex items-center gap-2 z-10">
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          <span className={`${selectedCategory === 'all' ? 'text-[#0880FF]' : 'text-[#666]'}`}>
                            <Cloud size={16} style={{ color: selectedCategory === 'all' ? '#0880FF' : '#4D79F6' }} />
                          </span>
                        </div>
                        <span className="text-[13px] font-medium flex items-center">All</span>
                      </div>
                      <span className="text-[11px] font-semibold text-black z-10">{bookmarkCounts['all'] || 0}</span>
                    </button>
                  </div>
                </li>
                <li>
                  <div className="relative">
                    <button
                      className={`w-full flex items-center px-3 py-2 text-left relative overflow-hidden ${selectedCategory === 'unsorted' ? 'text-[#0880FF] font-medium bg-white bg-opacity-90' : 'text-[#3A3A3A] hover:bg-white hover:bg-opacity-75'}`}
                      style={{ height: '32px', borderRadius: '0px', transition: 'background-color 0.15s ease' }}
                      onClick={() => onSelectCategory('unsorted')}
                    >
                      <div className="flex-1 flex items-center gap-2 z-10">
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          <span className={`${selectedCategory === 'unsorted' ? 'text-[#0880FF]' : 'text-[#666]'}`}>
                            <Drawer size={16} style={{ color: selectedCategory === 'unsorted' ? '#0880FF' : '#75C940' }} />
                          </span>
                        </div>
                        <span className="text-[13px] font-medium flex items-center">Unsorted</span>
                      </div>
                      <span className="text-[11px] font-semibold text-black z-10">{bookmarkCounts['unsorted'] || 0}</span>
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            <div className="text-xs camelCase font-bold ml-3 mb-1 mt-3 text-[#505050]">Main</div>

            <div className="space-y-0.5">
              {mainCategories.map(item => {
                const isActiveRoot = activeRootId === item.id;
                return (
                  <div key={item.id} className="relative">
                    <button
                      className={`w-full flex items-center px-3 py-2 text-left relative overflow-hidden ${selectedCategory === item.id ? 'text-[#0880FF] font-medium bg-white bg-opacity-90' : 'text-[#3A3A3A] hover:bg-white hover:bg-opacity-75'}`}
                      style={{ height: '32px', borderRadius: '0px', transition: 'background-color 0.15s ease' }}
                      onClick={() => handleRootClick(item)}
                    >
                      {item.bgImage && (
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{ backgroundImage: `url(${item.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                      )}

                      <div className="flex-1 flex items-center gap-2 z-10">
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          {item.name === 'Fonts' && item.active ? (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-blue-600 text-xs font-semibold">Aa</span>
                          ) : (
                            <span className={`${selectedCategory === item.id ? 'text-[#0880FF]' : 'text-[#666]'}`}>
                              {getIconComponent(item.iconType, selectedCategory === item.id, item.color)}
                            </span>
                          )}
                        </div>

                        <span className="text-[13px] font-medium flex items-center">{item.name}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-black z-10">
                        {item.count ?? 0}
                      </span>
                    </button>

                    {isActiveRoot && item.subcategories && item.subcategories.length > 0 && (
                      <div className="mt-1 border-l-2 border-blue-200 ml-4 pl-3">
                        <ul className="space-y-0.5">
                          {item.subcategories.map(subcategory => (
                            <li key={subcategory.id}>
                              <button
                                className={`w-full flex items-center justify-between px-2 py-1.5 text-left rounded text-sm ${
                                  selectedCategory === subcategory.id
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                onClick={() => handleFirstLevelClick(item.id, subcategory)}
                              >
                                <span className="flex-1 text-left">{subcategory.name}</span>
                                <span className="text-xs text-gray-500">{subcategory.count ?? 0}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#E0E0E0]">
            <button className="w-full flex items-center px-3 py-2.5 text-left text-[#3A3A3A] hover:bg-white hover:bg-opacity-60 transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-[#0880FF] to-[#50A8FF] text-white shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </span>
                </div>
                <span className="text-[13px] font-medium">New collection</span>
              </div>
            </button>
          </div>
        </div>

        {/* Secondary sidebar */}
        {secondaryPath.length > 0 && activeRootNode && (
          <div
            className="w-[240px] flex-shrink-0 h-full overflow-y-auto backdrop-blur-sm border-l border-white/60 shadow-xl p-3"
            style={secondarySidebarStyle}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-gray-400">{activeRootNode.name}</span>
                <div className="flex flex-wrap gap-1 mt-1 text-xs text-gray-600">
                  {secondaryBreadcrumb.map((crumb, index) => (
                    <React.Fragment key={crumb.id}>
                      {index > 0 && <span className="text-gray-400">/</span>}
                      <button
                        className={`hover:text-[#0880FF] ${index === secondaryBreadcrumb.length - 1 ? 'font-semibold text-[#0880FF]' : ''}`}
                        onClick={() => handleSecondaryBreadcrumbClick(index)}
                      >
                        {crumb.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <button className="text-xs text-gray-500 hover:text-[#0880FF]" onClick={handleSecondaryBack}>
                Back
              </button>
            </div>

            {secondaryNodes.length > 0 ? (
              <ul className="space-y-1">
                {secondaryNodes.map(node => (
                  <li key={node.id}>
                    <button
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left rounded ${
                        selectedCategory === node.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                      } text-sm`}
                      onClick={() => handleSecondaryNodeClick(node)}
                    >
                      <span className="truncate">{node.name}</span>
                      <span className="text-xs text-gray-500">{node.count ?? 0}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500 py-4 text-center">No further subcategories</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
