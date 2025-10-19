'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomRestrictionsProps {
  restrictions: string[];
  onChange: (restrictions: string[]) => void;
}

export function CustomRestrictions({
  restrictions,
  onChange,
}: CustomRestrictionsProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [error, setError] = React.useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();

    // Clear any existing error
    setError('');

    // Validation: empty string
    if (!trimmed) {
      setError('Please enter a restriction');
      return;
    }

    // Validation: max length
    if (trimmed.length > 50) {
      setError('Restriction must be 50 characters or less');
      return;
    }

    // Validation: duplicates (case-insensitive)
    if (restrictions.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
      setError('This restriction has already been added');
      return;
    }

    // Add the restriction
    onChange([...restrictions, trimmed]);
    setInputValue('');
  };

  const handleRemove = (restriction: string) => {
    onChange(restrictions.filter((r) => r !== restriction));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="custom-restriction-input" className="text-sm font-medium">
          Add Custom Dietary Restrictions
        </Label>
        <p className="text-xs text-muted-foreground">
          Add any other foods, ingredients, or dietary preferences you want to avoid or limit
        </p>
      </div>

      {/* Input and Add button */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            id="custom-restriction-input"
            type="text"
            placeholder="e.g., No processed sugar, Organic only..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(''); // Clear error on input change
            }}
            onKeyDown={handleKeyDown}
            maxLength={50}
            className={cn(
              'flex-1',
              error && 'border-destructive focus-visible:ring-destructive/20'
            )}
            aria-invalid={!!error}
            aria-describedby={error ? 'restriction-error' : undefined}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAdd}
            disabled={!inputValue.trim()}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <p id="restriction-error" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* Display restrictions as chips */}
      {restrictions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {restrictions.length} restriction{restrictions.length !== 1 ? 's' : ''} added
          </p>
          <div className="flex flex-wrap gap-2">
            {restrictions.map((restriction) => (
              <Badge
                key={restriction}
                variant="secondary"
                className="pl-3 pr-1 py-1 gap-1 text-sm"
              >
                <span>{restriction}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemove(restriction)}
                  className="h-auto w-auto p-0.5 hover:bg-transparent"
                  aria-label={`Remove ${restriction}`}
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {restrictions.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No custom restrictions added yet
        </p>
      )}
    </div>
  );
}
