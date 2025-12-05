import React, { useState, useMemo, ReactNode } from 'react';

/**
 * Table Types
 *
 * 테이블 컴포넌트의 Props 및 데이터 타입 정의
 */

interface TableRow {
  id: string | number;
  [key: string]: any;
}

interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  width?: string | number;
  render?: (value: any, row: TableRow) => React.ReactNode;
  headerClass?: string;
  cellClass?: string;
  hidden?: boolean;
}

interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  pageCount?: number;
}

interface TableProps {
  // 데이터
  data: TableRow[];
  columns: TableColumn[];

  // 상태
  loading?: boolean;
  error?: string | null;

  // 선택
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectRow?: (rowId: string | number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;

  // 정렬
  sortable?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;

  // 페이지네이션
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;

  // 행 이벤트
  onRowClick?: (row: TableRow) => void;
  onRowAction?: (rowId: string | number, action: string) => void;

  // 스타일
  className?: string;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;

  // 반응형
  responsive?: 'table' | 'card' | 'auto';

  // 접근성
  caption?: string;
  ariaLabel?: string;
}

interface TableHeaderProps {
  column: TableColumn;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  selectable?: boolean;
  allSelected?: boolean;
  onSelectAll?: (selected: boolean) => void;
}

interface TableCellProps {
  column: TableColumn;
  row: TableRow;
  value: any;
}

interface TableRowProps {
  row: TableRow;
  columns: TableColumn[];
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (rowId: string | number, selected: boolean) => void;
  onRowClick?: (row: TableRow) => void;
  striped?: boolean;
  hover?: boolean;
  rowIndex?: number;
  isResponsive?: boolean;
}

/**
 * Sort Icon Component
 *
 * 정렬 상태를 나타내는 아이콘
 */
const SortIcon: React.FC<{
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  columnKey: string;
}> = ({ sortBy, sortDirection, columnKey }) => {
  const isActive = sortBy === columnKey;

  if (!isActive) {
    return (
      <span className="inline-block ml-1 text-gray-400 text-xs">
        ↕
      </span>
    );
  }

  return (
    <span className={`inline-block ml-1 text-xs font-semibold ${
      isActive ? 'text-emerald-600' : 'text-gray-400'
    }`}>
      {sortDirection === 'asc' ? '↑' : '↓'}
    </span>
  );
};

/**
 * Table Header Cell Component
 */
const TableHeaderCell: React.FC<TableHeaderProps> = ({
  column,
  sortBy,
  sortDirection,
  onSort,
  selectable,
  allSelected,
  onSelectAll,
}) => {
  const isSortable = column.sortable && onSort;

  return (
    <th
      className={`
        px-4 py-3 lg:px-6 lg:py-4
        text-xs font-semibold text-gray-900 text-left
        bg-gray-50 border-b border-gray-200
        ${isSortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}
        ${column.headerClass || ''}
      `}
      onClick={() => isSortable && onSort(column.key)}
      scope="col"
      style={{
        width: column.width,
        textAlign: column.align || 'left',
      }}
    >
      {/* 전체 선택 체크박스 */}
      {selectable && column.key === '__selector__' ? (
        <input
          type="checkbox"
          checked={allSelected || false}
          onChange={(e) => onSelectAll?.(e.target.checked)}
          className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
          aria-label="모든 행 선택"
        />
      ) : (
        <>
          {column.label}
          {isSortable && (
            <SortIcon
              sortBy={sortBy}
              sortDirection={sortDirection}
              columnKey={column.key}
            />
          )}
        </>
      )}
    </th>
  );
};

/**
 * Table Cell Component
 */
const TableCell: React.FC<TableCellProps> = ({ column, row, value }) => {
  const cellContent = column.render ? column.render(value, row) : value;

  return (
    <td
      className={`
        px-4 py-3 lg:px-6 lg:py-4
        text-sm text-gray-700
        ${column.cellClass || ''}
      `}
      style={{
        textAlign: column.align || 'left',
        width: column.width,
      }}
      data-label={column.label}
    >
      {cellContent}
    </td>
  );
};

/**
 * Table Row Component
 */
const TableRow: React.FC<TableRowProps> = ({
  row,
  columns,
  selectable,
  selected,
  onSelect,
  onRowClick,
  striped,
  hover,
  rowIndex = 0,
  isResponsive,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(row.id, e.target.checked);
  };

  if (isResponsive) {
    // 모바일: 카드 레이아웃
    return (
      <div
        className={`
          block border rounded-lg p-4 mb-4
          ${selected ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-white border-gray-200'}
          ${hover ? 'hover:bg-gray-50 cursor-pointer transition-colors' : ''}
          ${striped && rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
        `}
        onClick={() => onRowClick?.(row)}
        role="row"
      >
        {/* 선택 체크박스 */}
        {selectable && (
          <div className="flex items-center justify-between mb-3">
            <input
              type="checkbox"
              checked={selected || false}
              onChange={handleCheckboxChange}
              className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              aria-label={`행 선택: ${row.id}`}
            />
          </div>
        )}

        {/* 데이터 필드 */}
        <div className="space-y-2">
          {columns
            .filter((col) => col.key !== '__selector__' && !col.hidden)
            .map((column) => (
              <div key={column.key} className="text-sm">
                <span className="font-semibold text-gray-900">
                  {column.label}:
                </span>
                <span className="ml-2 text-gray-700">
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // 데스크톱: 테이블 레이아웃
  return (
    <tr
      className={`
        border-b border-gray-200
        ${selected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
        ${hover ? 'hover:bg-gray-50 cursor-pointer transition-colors duration-200' : ''}
        ${striped && rowIndex % 2 === 0 ? 'bg-gray-50' : ''}
      `}
      onClick={() => onRowClick?.(row)}
      role="row"
    >
      {/* 선택 체크박스 */}
      {selectable && (
        <td className="px-4 py-3 lg:px-6 lg:py-4 w-12">
          <input
            type="checkbox"
            checked={selected || false}
            onChange={handleCheckboxChange}
            className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            aria-label={`행 선택: ${row.id}`}
          />
        </td>
      )}

      {/* 데이터 셀 */}
      {columns
        .filter((col) => col.key !== '__selector__' && !col.hidden)
        .map((column) => (
          <TableCell
            key={column.key}
            column={column}
            row={row}
            value={row[column.key]}
          />
        ))}
    </tr>
  );
};

/**
 * Pagination Component
 */
const TablePagination: React.FC<{
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;
}> = ({ pagination, onPageChange }) => {
  if (!pagination) return null;

  const { page, pageSize, total } = pagination;
  const pageCount = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange?.(page - 1);
    }
  };

  const handleNext = () => {
    if (page < pageCount) {
      onPageChange?.(page + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);

    if (pageCount <= maxVisible) {
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      if (page <= halfVisible) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(pageCount);
      } else if (page >= pageCount - halfVisible) {
        pages.push(1);
        pages.push('...');
        for (let i = pageCount - maxVisible + 1; i <= pageCount; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - halfVisible + 1; i <= page + halfVisible - 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(pageCount);
      }
    }
    return pages;
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <div className="text-sm text-gray-600">
        {startItem}-{endItem} of {total}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={page === 1}
          className={`
            px-3 py-2 text-sm border rounded
            ${page === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }
            transition-colors
          `}
          aria-label="이전 페이지"
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((num, idx) =>
            num === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={num}
                onClick={() => onPageChange?.(num as number)}
                className={`
                  px-3 py-2 text-sm border rounded transition-colors
                  ${page === num
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                `}
                aria-label={`${num} 페이지로 이동`}
                aria-current={page === num ? 'page' : undefined}
              >
                {num}
              </button>
            )
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={page === pageCount}
          className={`
            px-3 py-2 text-sm border rounded
            ${page === pageCount
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }
            transition-colors
          `}
          aria-label="다음 페이지"
        >
          Next
        </button>
      </div>
    </div>
  );
};

/**
 * Empty State Component
 */
const EmptyState: React.FC<{ message?: string }> = ({
  message = '데이터가 없습니다',
}) => (
  <div className="text-center py-8 text-gray-500">
    <div className="text-4xl mb-3">📭</div>
    <p className="text-lg">{message}</p>
  </div>
);

/**
 * Loading State Component
 */
const LoadingState: React.FC = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((idx) => (
      <div
        key={idx}
        className="h-12 bg-gray-100 rounded animate-pulse"
      />
    ))}
  </div>
);

/**
 * Table Component
 *
 * 구조화된 데이터를 표 또는 카드 형식으로 표시하는 컴포넌트입니다.
 *
 * @example
 * // 기본 테이블
 * <Table
 *   data={products}
 *   columns={[
 *     { key: 'name', label: '상품명' },
 *     { key: 'price', label: '가격', align: 'right' },
 *   ]}
 * />
 *
 * @example
 * // 정렬 기능이 있는 테이블
 * <Table
 *   data={products}
 *   columns={columns}
 *   sortable
 *   sortBy="name"
 *   sortDirection="asc"
 *   onSort={handleSort}
 * />
 *
 * @example
 * // 선택 기능이 있는 테이블
 * <Table
 *   data={orders}
 *   columns={columns}
 *   selectable
 *   selectedRows={selectedRows}
 *   onSelectRow={handleSelectRow}
 *   onSelectAll={handleSelectAll}
 * />
 *
 * @example
 * // 페이지네이션이 있는 테이블
 * <Table
 *   data={products}
 *   columns={columns}
 *   pagination={{ page: 1, pageSize: 10, total: 150 }}
 *   onPageChange={handlePageChange}
 * />
 */
const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      data,
      columns,
      loading = false,
      error = null,
      selectable = false,
      selectedRows = [],
      onSelectRow,
      onSelectAll,
      sortable = false,
      sortBy,
      sortDirection,
      onSort,
      pagination,
      onPageChange,
      onRowClick,
      className = '',
      striped = false,
      bordered = true,
      hover = true,
      responsive = 'auto',
      caption,
      ariaLabel,
    },
    ref
  ) => {
    // 선택된 행 상태 관리
    const isAllSelected = selectedRows.length > 0 && selectedRows.length === data.length;

    // 반응형 레이아웃 판단
    const [isResponsive, setIsResponsive] = useState(responsive === 'card');

    React.useEffect(() => {
      if (responsive === 'auto') {
        const handleResize = () => {
          setIsResponsive(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 초기 값 설정

        return () => window.removeEventListener('resize', handleResize);
      }
    }, [responsive]);

    // 데이터가 없을 때
    if (!loading && data.length === 0) {
      return <EmptyState message={error || '데이터가 없습니다'} />;
    }

    // 로딩 상태
    if (loading) {
      return <LoadingState />;
    }

    // 에러 상태
    if (error && !loading) {
      return (
        <div className="text-center py-8">
          <div className="text-red-500 text-lg font-semibold">오류 발생</div>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      );
    }

    // 선택자 컬럼 추가 (선택 기능이 있을 때)
    const displayColumns = selectable
      ? [{ key: '__selector__', label: '' }, ...columns]
      : columns;

    // 반응형 또는 테이블 레이아웃
    const content = isResponsive ? (
      // 모바일: 카드 레이아웃
      <div className={`space-y-4 ${className}`}>
        {data.map((row, idx) => (
          <TableRow
            key={row.id}
            row={row}
            columns={columns}
            selectable={selectable}
            selected={selectedRows.includes(row.id)}
            onSelect={onSelectRow}
            onRowClick={onRowClick}
            striped={striped}
            hover={hover}
            rowIndex={idx}
            isResponsive={true}
          />
        ))}
      </div>
    ) : (
      // 데스크톱: 테이블 레이아웃
      <div className={`overflow-x-auto ${className}`}>
        <table
          ref={ref}
          className="w-full border-collapse"
          role="table"
          aria-label={ariaLabel}
        >
          {caption && <caption className="sr-only">{caption}</caption>}

          <thead>
            <tr role="row">
              {displayColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  column={column}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={sortable && column.key !== '__selector__' ? onSort : undefined}
                  selectable={selectable && column.key === '__selector__'}
                  allSelected={isAllSelected}
                  onSelectAll={onSelectAll}
                />
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, idx) => (
              <TableRow
                key={row.id}
                row={row}
                columns={displayColumns}
                selectable={selectable}
                selected={selectedRows.includes(row.id)}
                onSelect={onSelectRow}
                onRowClick={onRowClick}
                striped={striped}
                hover={hover}
                rowIndex={idx}
                isResponsive={false}
              />
            ))}
          </tbody>
        </table>
      </div>
    );

    return (
      <div className="space-y-4">
        {content}
        <TablePagination
          pagination={pagination}
          onPageChange={onPageChange}
        />
      </div>
    );
  }
);

Table.displayName = 'Table';

export default Table;
export type {
  TableProps,
  TableColumn,
  TableRow,
  PaginationConfig,
  TableHeaderProps,
  TableCellProps,
  TableRowProps,
};

/**
 * 예제 컴포넌트들
 */

/**
 * 상품 테이블 예제
 */
export const ProductTable: React.FC<{
  products: Array<{ id: number; name: string; price: number; stock: number; status: string }>;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}> = ({ products, onEdit, onDelete }) => (
  <Table
    data={products}
    columns={[
      { key: 'name', label: '상품명', sortable: true },
      { key: 'price', label: '가격', sortable: true, align: 'right' },
      { key: 'stock', label: '재고', sortable: true, align: 'center' },
      {
        key: 'status',
        label: '상태',
        render: (value) => (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === '판매중'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {value}
          </span>
        ),
      },
      {
        key: 'actions',
        label: '액션',
        render: (_, row) => (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(row.id)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                수정
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(row.id)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                삭제
              </button>
            )}
          </div>
        ),
      },
    ]}
    sortable
    hover
    responsive="auto"
  />
);

/**
 * 주문 테이블 예제
 */
export const OrderTable: React.FC<{
  orders: Array<{
    id: number;
    orderNumber: string;
    customer: string;
    total: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'completed';
    date: string;
  }>;
}> = ({ orders }) => {
  const statusConfig = {
    pending: { label: '대기중', color: 'bg-amber-100 text-amber-800' },
    confirmed: { label: '확인됨', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: '배송중', color: 'bg-purple-100 text-purple-800' },
    completed: { label: '완료', color: 'bg-emerald-100 text-emerald-800' },
  };

  return (
    <Table
      data={orders}
      columns={[
        { key: 'orderNumber', label: '주문번호', sortable: true },
        { key: 'customer', label: '고객명' },
        { key: 'total', label: '합계', align: 'right', sortable: true },
        {
          key: 'status',
          label: '상태',
          render: (value) => {
            const config = statusConfig[value as keyof typeof statusConfig];
            return (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                {config.label}
              </span>
            );
          },
        },
        { key: 'date', label: '주문일', sortable: true },
      ]}
      selectable
      sortable
      hover
      responsive="auto"
    />
  );
};

/**
 * 사용자 테이블 예제
 */
export const UserTable: React.FC<{
  users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    joinDate: string;
  }>;
}> = ({ users }) => (
  <Table
    data={users}
    columns={[
      { key: 'name', label: '이름', sortable: true },
      { key: 'email', label: '이메일' },
      { key: 'role', label: '역할' },
      { key: 'joinDate', label: '가입일', sortable: true },
    ]}
    selectable
    sortable
    hover
    responsive="auto"
  />
);

/**
 * 스타일 참고:
 *
 * 테이블 레이아웃 (Desktop):
 * - 헤더: bg-gray-50 border-b border-gray-200
 * - 셀: px-4 py-3 lg:px-6 lg:py-4 text-sm
 * - 행 호버: hover:bg-gray-50
 * - 선택: bg-blue-50 border-l-4 border-blue-500
 *
 * 카드 레이아웃 (Mobile):
 * - 각 행이 개별 카드로 표시
 * - Label: Value 형식
 * - 둥근 모서리와 그림자 포함
 *
 * 반응형 breakpoint: 1024px (lg)
 * 모바일 (< 1024px): 카드 레이아웃
 * 데스크톱 (>= 1024px): 테이블 레이아웃
 */
