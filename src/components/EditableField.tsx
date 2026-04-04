import { useEffect, useId, useState } from 'react';

import type { AppMode } from '../types';

type EditableElement = 'div' | 'h1' | 'h2' | 'p' | 'span' | 'time';

interface EditableFieldProps {
  className?: string;
  displayValue?: string;
  element?: EditableElement;
  emptyDisplay?: string;
  label: string;
  mode: AppMode;
  multiline?: boolean;
  onCommit: (value: string) => void;
  placeholder: string;
  rows?: number;
  type?: 'date' | 'number' | 'text';
  value: string;
}

export function EditableField({
  className,
  displayValue,
  element = 'div',
  emptyDisplay = '',
  label,
  mode,
  multiline = false,
  onCommit,
  placeholder,
  rows = 3,
  type = 'text',
  value
}: EditableFieldProps) {
  const fieldId = useId();
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const Tag = element;

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value);
    }
  }, [isEditing, value]);

  const textToRender =
    displayValue ??
    (value.trim() || (mode === 'edit' ? placeholder : emptyDisplay));

  function closeAndCommit() {
    onCommit(draftValue);
    setIsEditing(false);
  }

  function closeWithoutCommit() {
    setDraftValue(value);
    setIsEditing(false);
  }

  function openEditor() {
    if (mode === 'edit') {
      setIsEditing(true);
    }
  }

  const classes = [
    className,
    mode === 'edit' ? 'is-editable' : '',
    isEditing ? 'is-editing' : '',
    !value.trim() ? 'is-empty' : ''
  ]
    .filter(Boolean)
    .join(' ');

  if (mode === 'share') {
    return <Tag className={classes}>{textToRender}</Tag>;
  }

  return (
    <Tag className={classes}>
      {isEditing ? (
        multiline ? (
          <textarea
            aria-label={label}
            autoFocus
            className="inline-editor inline-editor--multiline"
            id={fieldId}
            onBlur={closeAndCommit}
            onChange={(event) => setDraftValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                closeWithoutCommit();
              }

              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                closeAndCommit();
              }
            }}
            rows={rows}
            value={draftValue}
          />
        ) : (
          <input
            aria-label={label}
            autoFocus
            className="inline-editor"
            id={fieldId}
            onBlur={closeAndCommit}
            onChange={(event) => setDraftValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                closeWithoutCommit();
              }

              if (event.key === 'Enter') {
                event.preventDefault();
                closeAndCommit();
              }
            }}
            type={type}
            value={draftValue}
          />
        )
      ) : (
        <button
          aria-label={label}
          className="inline-trigger"
          data-empty={!value.trim()}
          onClick={openEditor}
          onFocus={openEditor}
          type="button"
        >
          {textToRender}
        </button>
      )}
    </Tag>
  );
}
