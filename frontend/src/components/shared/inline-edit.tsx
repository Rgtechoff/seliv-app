'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Pencil } from 'lucide-react';

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  type?: 'text' | 'number';
  className?: string;
  placeholder?: string;
}

export function InlineEdit({
  value,
  onSave,
  type = 'text',
  className,
  placeholder,
}: InlineEditProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const handleSave = async () => {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className={cn('group flex items-center gap-1', className)}>
        <span className={!value ? 'text-muted-foreground italic' : ''}>
          {value || placeholder || '—'}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
          title="Modifier"
        >
          <Pencil className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <input
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="border rounded px-2 py-0.5 text-sm bg-background border-input focus:outline-none focus:ring-1 focus:ring-ring"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') void handleSave();
          if (e.key === 'Escape') handleCancel();
        }}
      />
      <button
        onClick={() => void handleSave()}
        disabled={saving}
        className="p-0.5 rounded hover:bg-green-100 dark:hover:bg-green-900 text-green-600"
        title="Sauvegarder"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={handleCancel}
        className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
        title="Annuler"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
