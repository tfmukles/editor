import { withProps } from '@udecode/cn';
import { AIPlugin } from '@udecode/plate-ai/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import {
  ParagraphPlugin,
  PlateElement,
  PlateLeaf,
  usePlateEditor,
} from '@udecode/plate-common/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  BulletedListPlugin,
  ListItemPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { SlashInputPlugin } from '@udecode/plate-slash-command/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';

import { copilotPlugins } from '@/layouts/components/editor/plugins/copilot-plugins';
import { editorPlugins } from '@/layouts/components/editor/plugins/editor-plugins';
import { FloatingToolbarPlugin } from '@/layouts/components/editor/plugins/floating-toolbar-plugin';
import { AILeaf } from '@/layouts/components/plate-ui/ai-leaf';
import { BlockquoteElement } from '@/layouts/components/plate-ui/blockquote-element';
import { CodeBlockElement } from '@/layouts/components/plate-ui/code-block-element';
import { CodeLeaf } from '@/layouts/components/plate-ui/code-leaf';
import { CodeLineElement } from '@/layouts/components/plate-ui/code-line-element';
import { CodeSyntaxLeaf } from '@/layouts/components/plate-ui/code-syntax-leaf';
import { ColumnElement } from '@/layouts/components/plate-ui/column-element';
import { ColumnGroupElement } from '@/layouts/components/plate-ui/column-group-element';
import { HeadingElement } from '@/layouts/components/plate-ui/heading-element';
import { HighlightLeaf } from '@/layouts/components/plate-ui/highlight-leaf';
import { HrElement } from '@/layouts/components/plate-ui/hr-element';
import { ImageElement } from '@/layouts/components/plate-ui/image-element';
import { KbdLeaf } from '@/layouts/components/plate-ui/kbd-leaf';
import { LinkElement } from '@/layouts/components/plate-ui/link-element';
import { ListElement } from '@/layouts/components/plate-ui/list-element';
import { MediaEmbedElement } from '@/layouts/components/plate-ui/media-embed-element';
import { ParagraphElement } from '@/layouts/components/plate-ui/paragraph-element';
import { withPlaceholders } from '@/layouts/components/plate-ui/placeholder';
import { SlashInputElement } from '@/layouts/components/plate-ui/slash-input-element';
import {
  TableCellElement,
  TableCellHeaderElement,
} from '@/layouts/components/plate-ui/table-cell-element';
import { TableElement } from '@/layouts/components/plate-ui/table-element';
import { TableRowElement } from '@/layouts/components/plate-ui/table-row-element';
import { TocElement } from '@/layouts/components/plate-ui/toc-element';
import { ToggleElement } from '@/layouts/components/plate-ui/toggle-element';
import { withDraggables } from '@/layouts/components/plate-ui/with-draggables';

import { FixedToolbarPlugin } from './plugins/fixed-toolbar-plugin';

export const useCreateEditor = () => {
  return usePlateEditor({
    override: {
      components: withDraggables(
        withPlaceholders({
          [AIPlugin.key]: AILeaf,
          [BlockquotePlugin.key]: BlockquoteElement,
          [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
          [BulletedListPlugin.key]: withProps(ListElement, { variant: 'ul' }),
          [CodeBlockPlugin.key]: CodeBlockElement,
          [CodeLinePlugin.key]: CodeLineElement,
          [CodePlugin.key]: CodeLeaf,
          [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
          [ColumnItemPlugin.key]: ColumnElement,
          [ColumnPlugin.key]: ColumnGroupElement,
          [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
          [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
          [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
          [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: 'h4' }),
          [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: 'h5' }),
          [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: 'h6' }),
          [HighlightPlugin.key]: HighlightLeaf,
          [HorizontalRulePlugin.key]: HrElement,
          [ImagePlugin.key]: ImageElement,
          [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
          [KbdPlugin.key]: KbdLeaf,
          [LinkPlugin.key]: LinkElement,
          [ListItemPlugin.key]: withProps(PlateElement, { as: 'li' }),
          [MediaEmbedPlugin.key]: MediaEmbedElement,
          [NumberedListPlugin.key]: withProps(ListElement, { variant: 'ol' }),
          [ParagraphPlugin.key]: ParagraphElement,
          [SlashInputPlugin.key]: SlashInputElement,
          [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
          [SubscriptPlugin.key]: withProps(PlateLeaf, { as: 'sub' }),
          [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: 'sup' }),
          [TableCellHeaderPlugin.key]: TableCellHeaderElement,
          [TableCellPlugin.key]: TableCellElement,
          [TablePlugin.key]: TableElement,
          [TableRowPlugin.key]: TableRowElement,
          [TocPlugin.key]: TocElement,
          [TogglePlugin.key]: ToggleElement,
          [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
        })
      ),
    },
    plugins: [
      ...copilotPlugins,
      ...editorPlugins,
      FixedToolbarPlugin,
      FloatingToolbarPlugin,
    ],
    value: [
      {
        children: [{ text: 'Playground' }],
        type: 'h1',
      },
      {
        children: [
          { text: 'A rich-text editor with AI capabilities. Try the ' },
          { bold: true, text: 'AI commands' },
          { text: ' or use ' },
          { kbd: true, text: 'Cmd+J' },
          { text: ' to open the AI menu.' },
        ],
        type: ParagraphPlugin.key,
      },
    ],
  });
};
