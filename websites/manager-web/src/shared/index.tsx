import React from 'react';
import { COLORS } from '@/constants';
import { Search, ChevronLeft, ChevronRight, X, AlertTriangle, AlertCircle } from 'lucide-react';

/**
 * 1. Button Component
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center gap-2 font-bold text-xs rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer h-10 px-4';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/20',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    destructive: 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/10',
    outline: 'border border-border bg-background hover:bg-muted text-foreground',
    ghost: 'hover:bg-muted text-muted-foreground hover:text-foreground',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
      )}
      {children}
    </button>
  );
};

/**
 * 2. Card Component
 */
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * 3. StatusBadge Component
 */
interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'PENDING', type = 'status' }) => {
  const safeStatus = status || 'PENDING';
  const normalized = safeStatus.toUpperCase().replace(/ /g, '_');
  
  const colorClass = 
    type === 'status' 
      ? (COLORS.STATUS as any)[normalized] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      : (COLORS.PRIORITY as any)[normalized] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-extrabold uppercase border ${colorClass}`}>
      {safeStatus.replace(/_/g, ' ')}
    </span>
  );
};

/**
 * 4. PageHeader Component
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6 mb-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

/**
 * 5. DataTable Component
 */
interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export const DataTable = <T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) => {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {data.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground italic">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/10 text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={`p-4 ${col.className || ''}`}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${onRowClick ? 'hover:bg-muted/10 cursor-pointer' : ''}`}
                >
                  {columns.map((col, cIdx) => {
                    const content = 
                      typeof col.accessor === 'function' 
                        ? col.accessor(row) 
                        : (row[col.accessor] as React.ReactNode);
                    
                    return (
                      <td key={cIdx} className={`p-4 ${col.className || ''}`}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/**
 * 6. Modal Component
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-foreground">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div>
          <h3 className="font-extrabold text-lg">{title}</h3>
        </div>

        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

/**
 * 7. SkeletonLoader Component
 */
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = 'h-10 w-full' }) => {
  return <div className={`animate-pulse bg-muted rounded-xl ${className}`} />;
};

/**
 * 8. EmptyState Component
 */
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<any>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-4">
      {Icon && <Icon className="h-12 w-12 text-muted-foreground mx-auto" />}
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
