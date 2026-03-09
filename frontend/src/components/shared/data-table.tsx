import * as React from 'react';
import { cn } from '@/lib/utils';
import { SkeletonTable } from './skeleton';
import { EmptyState } from './empty-state';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  maxHeight?: string;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  loading,
  emptyTitle = 'Aucun résultat',
  emptyDescription,
  className,
  maxHeight = '600px',
}: DataTableProps<T>) {
  if (loading) return <SkeletonTable rows={5} />;

  if (!data.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className="border rounded-lg bg-card"
      />
    );
  }

  return (
    <div
      className={cn('overflow-auto rounded-lg border bg-card', className)}
      style={{ maxHeight }}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm border-b z-10">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  'px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={(row as { id?: string }).id ?? rowIdx}
              className="border-b last:border-0 hover:bg-muted/30 transition-colors"
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={cn('px-4 py-3 text-foreground', col.className)}
                >
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                    ? String(row[col.accessorKey] ?? '')
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
