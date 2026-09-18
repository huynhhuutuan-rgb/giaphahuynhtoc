import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FamilyMember } from '../types/family';
import { CustomThemeSettings } from '../types/theme';
import { getThemeById, getGenerationColor } from '../utils/themeConfig';
import { 
  buildFamilyHierarchy, 
  generateTreeEdges, 
  getTreeBoundingBox, 
  VisualNode,
  CARD_WIDTH,
  CARD_HEIGHT
} from '../utils/treeLayout';
import { MemberCard } from './MemberCard';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Search, 
  Filter, 
  Download, 
  Layers, 
  Sparkles, 
  Compass,
  Eye,
  Info,
  Palette,
  GitBranch
} from 'lucide-react';

interface FamilyTreeCanvasProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (member: FamilyMember) => void;
  onAddChild: (parent: FamilyMember, spouse?: FamilyMember) => void;
  onAddSpouse: (member: FamilyMember) => void;
  onPreviewPortrait?: (member: FamilyMember) => void;
  highlightedMemberId: number | null;
  onClearHighlight: () => void;
  themeSettings?: CustomThemeSettings;
  onOpenThemeModal?: () => void;
  onOpenGenerationColorModal?: () => void;
}

export const FamilyTreeCanvas: React.FC<FamilyTreeCanvasProps> = ({
  members,
  onSelectMember,
  onEditMember,
  onDeleteMember,
  onAddChild,
  onAddSpouse,
  onPreviewPortrait,
  highlightedMemberId,
  onClearHighlight,
  themeSettings,
  onOpenThemeModal,
  onOpenGenerationColorModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Trạng thái thu gọn nhánh
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());

  // Lọc theo cành/chi (Root filter)
  const [selectedRootId, setSelectedRootId] = useState<number | undefined>(undefined);

  // Zoom và Pan state
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 100, y: 60 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tìm kiếm nhanh trên Canvas
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);

  // Xây dựng cây phân cấp
  const rootNodes = useMemo(() => {
    return buildFamilyHierarchy(members, collapsedIds, selectedRootId);
  }, [members, collapsedIds, selectedRootId]);

  // Các đường nối cha mẹ - con cái
  const edges = useMemo(() => {
    return generateTreeEdges(rootNodes);
  }, [rootNodes]);

  // Kích thước toàn bộ cây
  const boundingBox = useMemo(() => {
    return getTreeBoundingBox(rootNodes);
  }, [rootNodes]);

  // Lấy danh sách các thế hệ xuất hiện trong cây
  const generations = useMemo(() => {
    const gens = Array.from(new Set<number>(members.map(m => m.doiThu || 1))).sort((a: number, b: number) => a - b);
    return gens;
  }, [members]);

  // Tự động thu gọn/mở rộng một nhánh
  const toggleCollapse = (memberId: number) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(2.0, z + 0.15));
  const handleZoomOut = () => setZoom(z => Math.max(0.25, z - 0.15));
  const handleResetZoom = () => {
    setZoom(0.9);
    setPan({ x: 100, y: 60 });
  };

  // Căn vừa màn hình (Fit to screen)
  const handleFitScreen = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (boundingBox.width === 0 || boundingBox.height === 0) return;

    const scaleX = (clientWidth - 80) / boundingBox.width;
    const scaleY = (clientHeight - 120) / boundingBox.height;
    const newZoom = Math.max(0.3, Math.min(1.2, Math.min(scaleX, scaleY)));

    setZoom(newZoom);
    setPan({
      x: (clientWidth - boundingBox.width * newZoom) / 2 - boundingBox.minX * newZoom,
      y: 80,
    });
  };

  // Khi kéo chuột để pan
  const handleMouseDown = (e: React.MouseEvent) => {
    // Chỉ kích hoạt pan khi click vào nền canvas
    if ((e.target as HTMLElement).closest('#card-member-')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Hỗ trợ cuộn chuột zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(z => Math.max(0.2, Math.min(2.2, z * zoomFactor)));
  };

  // Tự động cuộn đến người được highlight
  useEffect(() => {
    if (!highlightedMemberId || !containerRef.current) return;

    // Tìm vị trí của node
    function findNodePos(nodes: VisualNode[]): { x: number; y: number } | null {
      for (const node of nodes) {
        if (node.member.id === highlightedMemberId || node.spouse?.id === highlightedMemberId) {
          return { x: node.x, y: node.y };
        }
        const found = findNodePos(node.children);
        if (found) return found;
      }
      return null;
    }

    const pos = findNodePos(rootNodes);
    if (pos && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setPan({
        x: clientWidth / 2 - (pos.x + CARD_WIDTH / 2) * zoom,
        y: clientHeight / 2 - (pos.y + CARD_HEIGHT / 2) * zoom,
      });
    }
  }, [highlightedMemberId, rootNodes, zoom]);

  // Tìm kiếm danh sách thành viên khớp
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return members.filter(
      m => m.hoTen.toLowerCase().includes(q) || m.maGiaPha.toLowerCase().includes(q) || String(m.id) === q
    );
  }, [members, searchQuery]);

  // Flatten tất cả visual nodes để render
  const allVisualNodes = useMemo(() => {
    const list: VisualNode[] = [];
    function collect(node: VisualNode) {
      list.push(node);
      if (!node.collapsed) {
        node.children.forEach(collect);
      }
    }
    rootNodes.forEach(collect);
    return list;
  }, [rootNodes]);

  // Các cành nhánh lớn để lọc
  const branchRoots = useMemo(() => {
    return members.filter(m => m.doiThu <= 2 && m.gioiTinh === 'Nam');
  }, [members]);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[580px] bg-[#0a0a0a] overflow-hidden flex flex-col rounded-xl border border-[#262626] select-none">
      {/* Top Toolbar: Search, Filters, Generation indicators, Zoom controls */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Search Bar & Branch Selection */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#141414]/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-[#262626]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#737373] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên, mã gia phả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-[#1c1c1c] hover:bg-[#222222] focus:bg-[#1a1a1a] border border-[#2e2e2e] text-[#e5e5e5] placeholder-[#737373] rounded-lg w-44 md:w-56 focus:outline-hidden focus:ring-2 focus:ring-[#c4a47c] transition-all"
            />
            {searchResults.length > 0 && searchQuery && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-[#161616] rounded-lg shadow-2xl border border-[#2e2e2e] max-h-56 overflow-y-auto z-50 py-1">
                {searchResults.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMember(m);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-[#241f17] flex items-center justify-between text-xs border-b border-[#222222] last:border-0"
                  >
                    <div>
                      <div className="font-semibold text-[#e5e5e5]">{m.hoTen}</div>
                      <div className="text-[10px] text-[#8a8a8a]">{m.maGiaPha || `Đời ${m.doiThu}`} - #{m.id}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222222] text-[#c4a47c]">
                      {m.gioiTinh}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lọc theo Chi / Nhánh */}
          <div className="hidden sm:flex items-center gap-1 text-xs border-l border-[#2e2e2e] pl-2">
            <Filter className="w-3.5 h-3.5 text-[#c4a47c]" />
            <select
              value={selectedRootId ?? 'all'}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedRootId(val === 'all' ? undefined : Number(val));
              }}
              className="text-xs bg-[#141414] border-0 font-medium text-[#d4d4d4] focus:ring-0 cursor-pointer"
            >
              <option value="all" className="bg-[#141414] text-[#e5e5e5]">Toàn bộ dòng họ</option>
              {branchRoots.map(br => (
                <option key={br.id} value={br.id} className="bg-[#141414] text-[#e5e5e5]">
                  Chi: {br.hoTen} (Đời {br.doiThu})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Zoom Controls & Canvas Actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#141414]/95 backdrop-blur-md p-1 rounded-xl shadow-xl border border-[#262626]">
          {/* Quick Theme & Color Modal Triggers */}
          {onOpenThemeModal && (
            <button
              onClick={onOpenThemeModal}
              title="Đổi hình nền gia phả (Sáng, Cổ truyền, Tùy chỉnh)"
              className="px-2.5 py-1 hover:bg-[#27272a] rounded-lg text-[#d4d4d4] hover:text-[#c4a47c] transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Palette className="w-3.5 h-3.5 text-[#c4a47c]" />
              <span className="hidden sm:inline">Hình Nền</span>
            </button>
          )}

          {onOpenGenerationColorModal && (
            <button
              onClick={onOpenGenerationColorModal}
              title="Đổi màu đường line kết nối cho từng đời"
              className="px-2.5 py-1 hover:bg-[#27272a] rounded-lg text-[#d4d4d4] hover:text-[#3b82f6] transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span className="hidden sm:inline">Màu Line Đời</span>
            </button>
          )}

          <div className="h-4 w-px bg-[#2e2e2e] mx-0.5" />

          <button
            onClick={handleZoomIn}
            title="Phóng to (+)"
            className="p-1.5 hover:bg-[#242424] rounded-lg text-[#d4d4d4] hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-[#c4a47c] px-1 font-medium min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomOut}
            title="Thu nhỏ (-)"
            className="p-1.5 hover:bg-[#242424] rounded-lg text-[#d4d4d4] hover:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-[#2e2e2e] mx-0.5" />
          <button
            onClick={handleFitScreen}
            title="Căn vừa màn hình"
            className="p-1.5 hover:bg-[#242424] rounded-lg text-[#d4d4d4] hover:text-white transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden md:inline">Vừa màn hình</span>
          </button>
          <button
            onClick={handleResetZoom}
            title="Mặc định (100%)"
            className="p-1.5 hover:bg-[#242424] rounded-lg text-[#d4d4d4] hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Generation Left Legend with Live Generation Colors */}
      <div className="absolute left-3 bottom-3 z-20 pointer-events-auto hidden md:flex flex-col gap-1.5 bg-[#141414]/90 backdrop-blur-md p-2.5 rounded-xl border border-[#262626] shadow-xl max-w-[320px]">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] font-bold text-[#e5e5e5] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#c4a47c]" />
            <span>Màu Line Thế Hệ / Đời</span>
          </div>
          {onOpenGenerationColorModal && (
            <button
              onClick={onOpenGenerationColorModal}
              className="text-[10px] text-[#c4a47c] hover:underline flex items-center gap-0.5"
            >
              <GitBranch className="w-2.5 h-2.5" />
              <span>Chỉnh màu</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {generations.map(gen => {
            const genColor = getGenerationColor(gen, themeSettings?.generationColorConfig);
            return (
              <span
                key={gen}
                className="text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1.5 font-semibold bg-[#1c1c1c] border transition-transform hover:scale-105"
                style={{
                  borderColor: `${genColor}66`,
                  color: genColor,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: genColor }}
                />
                <span>Đời {gen}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Main Interactive SVG & HTML Canvas Area */}
      {(() => {
        const activeTheme = getThemeById(themeSettings?.activeThemeId || 'hoang_kim');
        const isCustom = themeSettings?.activeThemeId === 'custom';
        const customUrl = themeSettings?.customBgImageUrl;
        const customBg = themeSettings?.customBgColor || '#fbf7ee';
        const customOpacity = themeSettings?.customBgOpacity ?? 0.85;

        return (
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className={`w-full h-full relative cursor-${isDragging ? 'grabbing' : 'grab'} overflow-hidden`}
            style={{
              backgroundColor: isCustom ? customBg : activeTheme.canvasBg,
              backgroundImage: isCustom 
                ? (customUrl ? undefined : `radial-gradient(#c7b99c 1.2px, transparent 1.2px)`) 
                : activeTheme.canvasPattern,
              backgroundSize: '24px 24px',
            }}
          >
            {/* Custom Background Image Overlay if active */}
            {isCustom && customUrl && (
              <div 
                className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-300"
                style={{
                  backgroundImage: `url(${customUrl})`,
                  opacity: customOpacity,
                }}
              />
            )}

            {/* Transformable Canvas Layer */}
            <div
              className="absolute origin-top-left transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                width: `${Math.max(2000, boundingBox.width + 400)}px`,
                height: `${Math.max(1600, boundingBox.height + 400)}px`,
              }}
            >
              {/* SVG Connection Lines */}
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                style={{ minWidth: '3500px', minHeight: '3500px' }}
              >
                {edges.map(edge => {
                  const edgeGen = themeSettings?.generationColorConfig?.colorMode === 'byChild' 
                    ? edge.childGen 
                    : edge.parentGen;
                  const lineColor = getGenerationColor(edgeGen, themeSettings?.generationColorConfig);
                  const lineWidth = themeSettings?.generationColorConfig?.lineWidth || 3;
                  const isDashed = themeSettings?.generationColorConfig?.lineStyle === 'dashed';

                  // Vẽ đường ống nối kiểu Orthogonal / Bezier cong thanh lịch
                  const midY = (edge.startY + edge.endY) / 2;
                  const pathD = `M ${edge.startX} ${edge.startY} 
                                 C ${edge.startX} ${midY}, ${edge.endX} ${midY}, ${edge.endX} ${edge.endY}`;

                  return (
                    <g key={edge.id}>
                      {/* Đường bóng mờ nền tương phản cao */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={activeTheme.category === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}
                        strokeWidth={lineWidth + 3}
                        strokeLinecap="round"
                      />
                      {/* Đường kết nối chính với màu thế hệ */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={lineColor}
                        strokeWidth={lineWidth}
                        strokeDasharray={isDashed ? '6 4' : 'none'}
                        strokeLinecap="round"
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
                        }}
                      />
                      {/* Điểm nút con */}
                      <circle 
                        cx={edge.endX} 
                        cy={edge.endY} 
                        r={lineWidth + 1.5} 
                        fill={lineColor} 
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      {/* Điểm nút cha */}
                      <circle 
                        cx={edge.startX} 
                        cy={edge.startY} 
                        r={lineWidth + 1.5} 
                        fill={lineColor}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* HTML Interactive Member Cards */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
                {allVisualNodes.map(node => {
                  const nodeGenColor = getGenerationColor(node.member.doiThu, themeSettings?.generationColorConfig);

                  return (
                    <div
                      key={node.id}
                      style={{
                        position: 'absolute',
                        left: `${node.x}px`,
                        top: `${node.y}px`,
                      }}
                    >
                      <MemberCard
                        member={node.member}
                        spouse={node.spouse}
                        hasChildren={node.children.length > 0 || (members.filter(m => m.idCha === node.member.id || m.idMe === node.member.id).length > 0)}
                        childrenCount={members.filter(m => m.idCha === node.member.id || m.idMe === node.member.id || (node.spouse && (m.idCha === node.spouse.id || m.idMe === node.spouse.id))).length}
                        isCollapsed={node.collapsed}
                        onToggleCollapse={() => toggleCollapse(node.member.id)}
                        onSelectMember={onSelectMember}
                        onEditMember={onEditMember}
                        onDeleteMember={onDeleteMember}
                        onAddChild={onAddChild}
                        onAddSpouse={onAddSpouse}
                        onPreviewPortrait={onPreviewPortrait}
                        isHighlighted={highlightedMemberId === node.member.id || (node.spouse && highlightedMemberId === node.spouse.id)}
                        generationColor={nodeGenColor}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
