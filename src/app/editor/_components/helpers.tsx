import { TElement } from '@udecode/plate-common';

const ELEMENT_MDX_INLINE = 'mdxJsxTextElement';
const ELEMENT_MDX_BLOCK = 'mdxJsxFlowElement';
const ELEMENT_IMG = 'img';

const normalize = (node: TElement) => {
  if (
    [ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE, ELEMENT_IMG].includes(node.type)
  ) {
    return {
      ...node,
      children: [{ type: 'text', text: '' }],
    };
  }
  if (node.children) {
    if (node.children.length) {
      return {
        ...node,
        children: node.children.map(normalize),
      };
    } else {
      // Always supply an empty text leaf
      return {
        ...node,
        children: [{ text: '' }],
      };
    }
  }
  return node;
};

export const helpers = { normalize };
