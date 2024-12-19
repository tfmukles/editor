import { TElement } from '@udecode/plate-common';
import { ImagePlugin } from '@udecode/plate-media/react';

const ELEMENT_MDX_INLINE = 'mdxJsxTextElement';
const ELEMENT_MDX_BLOCK = 'mdxJsxFlowElement';
const ELEMENT_IMG = ImagePlugin.key;

('use client');

import * as React from 'react';

import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const frameworks = [
  {
    label: 'Next.js',
    value: 'next.js',
  },
  {
    label: 'SvelteKit',
    value: 'sveltekit',
  },
  {
    label: 'Nuxt.js',
    value: 'nuxt.js',
  },
  {
    label: 'Remix',
    value: 'remix',
  },
  {
    label: 'Astro',
    value: 'astro',
  },
];

export function ComboboxDemo() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] justify-between"
          aria-expanded={open}
          role="combobox"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : 'Select framework...'}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 size-4',
                      value === framework.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const normalize = (node: TElement) => {
  if (
    [ELEMENT_IMG, ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE].includes(node.type)
  ) {
    return {
      ...node,
      id: Date.now(),
      children: [{ text: '', type: 'text' }],
    };
  }
  if (node.children) {
    if (node.children.length > 0 && Array.isArray(node.children)) {
      return {
        ...node,
        id: Date.now(),
        children: node.children.map(normalize),
      };
    } else {
      // Always supply an empty text leaf
      return {
        ...node,
        id: Date.now(),
        children: [{ text: '' }],
      };
    }
  }

  return node;
};

export const helpers = { normalize };
