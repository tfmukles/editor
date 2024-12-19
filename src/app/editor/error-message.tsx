import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { XCircleIcon } from 'lucide-react';

export type EmptyTextElement = { type: 'text'; text: '' };
export type PositionItem = {
  line?: number | null;
  column?: number | null;
  offset?: number | null;
  _index?: number | null;
  _bufferIndex?: number | null;
};

export type Position = {
  start: PositionItem;
  end: PositionItem;
};

export type InvalidMarkdownElement = {
  type: 'invalid_markdown';
  value: string;
  message: string;
  position?: Position;
  children: [EmptyTextElement];
};

type ErrorType = {
  message: string;
  position?: {
    startColumn: number;
    endColumn: number;
    startLineNumber: number;
    endLineNumber: number;
  };
};

export const buildError = (element: InvalidMarkdownElement): ErrorType => {
  return {
    message: element.message,
    position: element.position && {
      endColumn: element.position.end.column ?? 0,
      startColumn: element.position.start.column ?? 0,
      startLineNumber: element.position.start.line ?? 0,
      endLineNumber: element.position.end.line ?? 0,
    },
  };
};

export const buildErrorMessage = (element: InvalidMarkdownElement): string => {
  if (!element) {
    return '';
  }
  const errorMessage = buildError(element);
  const message = errorMessage
    ? `${errorMessage.message}${
        errorMessage.position
          ? ` at line: ${errorMessage.position.startLineNumber}, column: ${errorMessage.position.startColumn}`
          : ''
      }`
    : null;
  return message || '';
};

export function ErrorMessage({ error }: { error: InvalidMarkdownElement }) {
  const message = buildErrorMessage(error);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`p-2 border shadow-lg ${error ? '' : 'opacity-0 hidden'}`}
        >
          <span className="sr-only">Errors</span>
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-[300px]">
        <Card>
          <CardContent className="bg-red-50 p-4">
            <div className="flex items-start">
              <XCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 whitespace-pre-wrap">
                  {message}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
