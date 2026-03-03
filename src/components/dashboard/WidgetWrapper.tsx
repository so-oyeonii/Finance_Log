'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetWrapperProps {
  id: string;
  isEditing: boolean;
  children: React.ReactNode;
}

export function WidgetWrapper({ id, isEditing, children }: WidgetWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        isDragging && 'z-10 opacity-80',
        isEditing && 'animate-wiggle'
      )}
    >
      {isEditing && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-1 top-3 z-10 p-1 rounded-md bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  );
}
