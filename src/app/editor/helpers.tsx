import { TElement } from '@udecode/plate-common';
import { ImagePlugin } from '@udecode/plate-media/react';

const ELEMENT_MDX_INLINE = 'mdxJsxTextElement';
const ELEMENT_MDX_BLOCK = 'mdxJsxFlowElement';
const ELEMENT_IMG = ImagePlugin.key;

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
