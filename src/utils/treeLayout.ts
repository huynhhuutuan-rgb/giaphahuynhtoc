import { FamilyMember } from '../types/family';

export interface VisualNode {
  id: string; // key for rendering
  member: FamilyMember;
  spouse?: FamilyMember;
  children: VisualNode[];
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeWidth: number;
  collapsed?: boolean;
  generation: number;
}

export interface TreeEdge {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  fromId: number;
  toId: number;
  parentGen: number;
  childGen: number;
}

export const CARD_WIDTH = 220;
export const CARD_HEIGHT = 136;
export const SPOUSE_CARD_WIDTH = 200;
export const HORIZONTAL_GAP = 40;
export const VERTICAL_GAP = 90;
export const COUPLE_GAP = 14;

/**
 * Xây dựng cây phân cấp từ danh sách phẳng (Flat list of FamilyMember)
 */
export function buildFamilyHierarchy(
  members: FamilyMember[],
  collapsedIds: Set<number>,
  rootMemberId?: number
): VisualNode[] {
  if (members.length === 0) return [];

  // Tạo map tra cứu nhanh
  const memberMap = new Map<number, FamilyMember>();
  members.forEach(m => memberMap.set(m.id, m));

  // Hàm tra cứu phối ngẫu toàn diện (Trực tiếp, 2 chiều, hoặc Họ tên vợ/chồng ngoài)
  const getSpouseOf = (m: FamilyMember): FamilyMember | undefined => {
    // 1. Tra cứu theo idVoChong trực tiếp
    if (m.idVoChong && memberMap.has(m.idVoChong)) {
      return memberMap.get(m.idVoChong);
    }
    // 2. Tra cứu 2 chiều: thành viên khác có idVoChong trỏ về m.id
    const reverseSpouse = members.find(other => other.idVoChong === m.id && other.id !== m.id);
    if (reverseSpouse) {
      return reverseSpouse;
    }
    // 3. Nếu chưa lập hồ sơ riêng nhưng có nhập thông tin phối ngẫu (Họ tên vợ/chồng ngoài)
    if (m.hoTenVoChongNgoai && m.hoTenVoChongNgoai.trim()) {
      return {
        id: -m.id, // ID số âm đại diện cho phối ngẫu ngoài
        maGiaPha: '',
        hoTen: m.hoTenVoChongNgoai.trim(),
        gioiTinh: m.gioiTinh === 'Nam' ? 'Nữ' : 'Nam',
        idCha: null,
        idMe: null,
        idVoChong: m.id,
        doiThu: m.doiThu || 1,
        namSinh: m.namSinhVoChong || '',
        namMat: null,
        ghiChu: m.ghiChuHonNhan || (m.gioiTinh === 'Nam' ? 'Vợ (Dâu)' : 'Chồng (Rể)'),
        thongTinCaNhan: m.ngayKetHon ? `Kết hôn: ${m.ngayKetHon}` : '',
        queQuan: m.queQuanVoChong || '',
        tinhTrangHonNhan: m.tinhTrangHonNhan || 'Đã kết hôn',
      };
    }
    return undefined;
  };

  // Xác định tập các id là vợ/chồng phụ (được hiển thị cạnh người bạn đời)
  // để tránh tạo node trùng lặp ở tầng cao nhất
  const processedAsSpouse = new Set<number>();
  
  // Tìm các người con của một cặp hoặc một cá nhân
  const getChildrenOf = (parent1Id: number, parent2Id?: number | null): FamilyMember[] => {
    return members.filter(m => {
      // Con có cha là parent1 hoặc parent2, hoặc mẹ là parent1 hoặc parent2
      const isChildOf1 = (m.idCha === parent1Id || m.idMe === parent1Id);
      const isChildOf2 = (parent2Id && parent2Id > 0) ? (m.idCha === parent2Id || m.idMe === parent2Id) : false;
      return isChildOf1 || isChildOf2;
    }).sort((a, b) => {
      // Sắp xếp con theo thứ tự gia đình hoặc năm sinh
      if (a.thuTuTrongGiaDinh && b.thuTuTrongGiaDinh) return a.thuTuTrongGiaDinh - b.thuTuTrongGiaDinh;
      const birthA = Number(a.namSinh) || 0;
      const birthB = Number(b.namSinh) || 0;
      return birthA - birthB;
    });
  };

  // Xác định các Node Gốc (Root nodes - thường là Đời 1 hoặc những người không có idCha và idMe)
  let rootMembers: FamilyMember[] = [];
  if (rootMemberId && memberMap.has(rootMemberId)) {
    rootMembers = [memberMap.get(rootMemberId)!];
  } else {
    // Tìm các cụ đời 1 hoặc không có cha mẹ
    const minGeneration = Math.min(...members.map(m => m.doiThu || 1));
    rootMembers = members.filter(m => {
      const isMinGen = m.doiThu === minGeneration;
      const noParents = !m.idCha && !m.idMe;
      return isMinGen && noParents;
    });

    // Nếu không tìm thấy, lấy tất cả những người không có cha mẹ
    if (rootMembers.length === 0) {
      rootMembers = members.filter(m => !m.idCha && !m.idMe);
    }
    // Nếu vẫn rỗng, lấy tất cả members
    if (rootMembers.length === 0) {
      rootMembers = members;
    }
  }

  // Lọc bỏ những người là vợ/chồng của một root khác nếu vợ/chồng đó đã được đưa vào
  const finalRoots: FamilyMember[] = [];
  rootMembers.forEach(m => {
    if (processedAsSpouse.has(m.id)) {
      return;
    }
    finalRoots.push(m);
    const sp = getSpouseOf(m);
    if (sp && sp.id > 0) {
      processedAsSpouse.add(sp.id);
    }
  });

  const visitedInTree = new Set<number>();

  function buildNode(member: FamilyMember): VisualNode {
    visitedInTree.add(member.id);
    const spouse = getSpouseOf(member);
    if (spouse && spouse.id > 0) {
      processedAsSpouse.add(spouse.id);
      visitedInTree.add(spouse.id);
    }

    const isCollapsed = collapsedIds.has(member.id);
    let childrenNodes: VisualNode[] = [];

    if (!isCollapsed) {
      const rawChildren = getChildrenOf(member.id, spouse?.id);
      childrenNodes = rawChildren
        .filter(c => !visitedInTree.has(c.id)) // Tránh đệ quy vòng tròn lặp vô tận
        .map(c => buildNode(c));
    }

    const hasSpouse = !!spouse;
    const nodeWidth = hasSpouse ? (CARD_WIDTH + SPOUSE_CARD_WIDTH + COUPLE_GAP) : CARD_WIDTH;

    return {
      id: `node-${member.id}`,
      member,
      spouse,
      children: childrenNodes,
      x: 0,
      y: 0,
      width: nodeWidth,
      height: CARD_HEIGHT,
      subtreeWidth: nodeWidth,
      collapsed: isCollapsed,
      generation: member.doiThu || 1,
    };
  }

  const rootNodes = finalRoots.map(r => buildNode(r));

  // Tính toán vị trí không gian (Layout coordinates)
  layoutTreeNodes(rootNodes);

  return rootNodes;
}

/**
 * Tính toán chiều rộng cây con (subtreeWidth) và tọa độ (X, Y)
 */
function layoutTreeNodes(roots: VisualNode[]) {
  // Bước 1: Tính subtreeWidth đệ quy từ dưới lên
  function calculateSubtreeWidth(node: VisualNode): number {
    if (node.children.length === 0 || node.collapsed) {
      node.subtreeWidth = node.width;
      return node.subtreeWidth;
    }

    let totalChildrenWidth = 0;
    node.children.forEach((child, index) => {
      const w = calculateSubtreeWidth(child);
      totalChildrenWidth += w;
      if (index < node.children.length - 1) {
        totalChildrenWidth += HORIZONTAL_GAP;
      }
    });

    node.subtreeWidth = Math.max(node.width, totalChildrenWidth);
    return node.subtreeWidth;
  }

  roots.forEach(r => calculateSubtreeWidth(r));

  // Bước 2: Gán tọa độ X, Y từ trên xuống
  let currentRootX = 60;
  const startY = 80;

  function assignPositions(node: VisualNode, leftBound: number, topY: number) {
    node.y = topY;

    if (node.children.length === 0 || node.collapsed) {
      node.x = leftBound + (node.subtreeWidth - node.width) / 2;
      return;
    }

    // Đặt vị trí node cha ở giữa khoảng chiếm của tất cả các con
    const childrenTotalWidth = node.children.reduce((sum, c) => sum + c.subtreeWidth, 0) + 
      (node.children.length - 1) * HORIZONTAL_GAP;

    const childrenLeftStart = leftBound + Math.max(0, (node.subtreeWidth - childrenTotalWidth) / 2);
    
    // Đặt cha nằm chính giữa các con
    node.x = leftBound + (node.subtreeWidth - node.width) / 2;

    let childCursorX = childrenLeftStart;
    const nextY = topY + CARD_HEIGHT + VERTICAL_GAP;

    node.children.forEach(child => {
      assignPositions(child, childCursorX, nextY);
      childCursorX += child.subtreeWidth + HORIZONTAL_GAP;
    });
  }

  roots.forEach(r => {
    assignPositions(r, currentRootX, startY);
    currentRootX += r.subtreeWidth + HORIZONTAL_GAP * 2;
  });
}

/**
 * Tạo danh sách đường nối (Edges) giữa cha mẹ và con cái
 */
export function generateTreeEdges(roots: VisualNode[]): TreeEdge[] {
  const edges: TreeEdge[] = [];

  function traverse(node: VisualNode) {
    if (!node.children || node.children.length === 0 || node.collapsed) return;

    // Điểm xuất phát: Giữa cạnh dưới của khối thẻ cha mẹ
    const startX = node.x + node.width / 2;
    const startY = node.y + node.height;

    node.children.forEach(child => {
      // Điểm kết thúc: Giữa cạnh trên của thẻ con
      const endX = child.x + child.width / 2;
      const endY = child.y;

      edges.push({
        id: `edge-${node.member.id}-${child.member.id}`,
        startX,
        startY,
        endX,
        endY,
        fromId: node.member.id,
        toId: child.member.id,
        parentGen: node.member.doiThu || 1,
        childGen: child.member.doiThu || (node.member.doiThu ? node.member.doiThu + 1 : 2),
      });

      traverse(child);
    });
  }

  roots.forEach(r => traverse(r));
  return edges;
}

/**
 * Tìm node trong cây theo ID
 */
export function findNodeById(roots: VisualNode[], id: number): VisualNode | null {
  for (const root of roots) {
    if (root.member.id === id || root.spouse?.id === id) return root;
    const found = findNodeById(root.children, id);
    if (found) return found;
  }
  return null;
}

/**
 * Tính toán kích thước bao bọc (Bounding box) của toàn bộ cây
 */
export function getTreeBoundingBox(roots: VisualNode[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  function scan(node: VisualNode) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);

    if (!node.collapsed) {
      node.children.forEach(scan);
    }
  }

  roots.forEach(scan);

  if (minX === Infinity) {
    return { minX: 0, minY: 0, maxX: 1000, maxY: 800, width: 1000, height: 800 };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 160,
    height: maxY - minY + 160,
  };
}
