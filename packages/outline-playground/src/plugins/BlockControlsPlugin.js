/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as React from 'react';
import PlaygroundEditorContext from '../context/PlaygroundEditorContext';
import {useEditorContext} from 'outline-react/OutlineEditorContext';
import type {OutlineEditor} from 'outline';
import {isHeadingNode} from 'outline/HeadingNode';
import {isListNode} from 'outline/ListNode';
import {createParagraphNode} from 'outline/ParagraphNode';
import {createHeadingNode} from 'outline/HeadingNode';
import {createListNode} from 'outline/ListNode';
import {createListItemNode} from 'outline/ListItemNode';
import {createQuoteNode} from 'outline/QuoteNode';
import {createCodeNode} from 'outline/CodeNode';
import {wrapLeafNodesInElements} from 'outline/selection';
import {useEffect, useRef, useState} from 'react';
// $FlowFixMe
import {createPortal} from 'react-dom';
import {log, getSelection} from 'outline';

const supportedBlockTypes = new Set([
  'paragraph',
  'quote',
  'code',
  'h1',
  'h2',
  'ul',
  'ol',
]);

function DropdownList({
  editor,
  blockType,
  elementControlsRef,
  setShowDropDown,
}: {
  editor: OutlineEditor,
  blockType: string,
  elementControlsRef: {current: null | HTMLElement},
  setShowDropDown: (boolean) => void,
}): React$Node {
  const dropDownRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const elementControls = elementControlsRef.current;
    const dropDown = dropDownRef.current;

    if (elementControls !== null && dropDown !== null) {
      const {top, right} = elementControls.getBoundingClientRect();
      const {width} = dropDown.getBoundingClientRect();
      dropDown.style.top = `${top + 40}px`;
      dropDown.style.left = `${right - width}px`;
    }
  }, [elementControlsRef]);

  useEffect(() => {
    const dropDown = dropDownRef.current;
    const elementControls = elementControlsRef.current;

    if (dropDown !== null && elementControls !== null) {
      const handle = (event: MouseEvent) => {
        // $FlowFixMe: no idea why flow is complaining
        const target: HTMLElement = event.target;

        if (!dropDown.contains(target) && !elementControls.contains(target)) {
          setShowDropDown(false);
        }
      };
      document.addEventListener('click', handle);

      return () => {
        document.removeEventListener('click', handle);
      };
    }
  }, [elementControlsRef, setShowDropDown]);

  const formatParagraph = () => {
    if (blockType !== 'paragraph') {
      editor.update(() => {
        log('formatParagraph');
        const selection = getSelection();

        if (selection !== null) {
          wrapLeafNodesInElements(selection, () => createParagraphNode());
        }
      });
    }
    setShowDropDown(false);
  };

  const formatLargeHeading = () => {
    if (blockType !== 'h1') {
      editor.update(() => {
        log('formatLargeHeading');
        const selection = getSelection();

        if (selection !== null) {
          wrapLeafNodesInElements(selection, () => createHeadingNode('h1'));
        }
      });
    }
    setShowDropDown(false);
  };

  const formatSmallHeading = () => {
    if (blockType !== 'h2') {
      editor.update((state) => {
        log('formatSmallHeading');
        const selection = getSelection();

        if (selection !== null) {
          wrapLeafNodesInElements(selection, () => createHeadingNode('h2'));
        }
      });
    }
    setShowDropDown(false);
  };

  const formatBulletList = () => {
    if (blockType !== 'ul') {
      editor.update((state) => {
        log('formatBulletList');
        const selection = getSelection();

        if (selection !== null) {
          wrapLeafNodesInElements(
            selection,
            () => createListItemNode(),
            createListNode('ul'),
          );
        }
      });
    }
    setShowDropDown(false);
  };

  const formatNumberedList = () => {
    if (blockType !== 'ol') {
      editor.update((state) => {
        log('formatNumberedList');
        const selection = getSelection();

        if (selection !== null) {
          wrapLeafNodesInElements(
            selection,
            () => createListItemNode(),
            createListNode('ol'),
          );
        }
      });
    }
    setShowDropDown(false);
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update((state) => {
        log('formatQuote');
        const selection = getSelection();

        if (selection !== null) {
          wrapLeafNodesInElements(selection, () => createQuoteNode());
        }
      });
    }
    setShowDropDown(false);
  };

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update((state) => {
        log('formatCode');
        const selection = getSelection();

        if (selection !== null) {
          wrapLeafNodesInElements(selection, () => createCodeNode());
        }
      });
    }
    setShowDropDown(false);
  };

  return (
    <div className="dropdown" ref={dropDownRef}>
      <button className="item" onClick={formatParagraph}>
        <span className="icon paragraph" />
        <span className="text">Normal</span>
        {blockType === 'paragraph' && <span className="active" />}
      </button>
      <button className="item" onClick={formatLargeHeading}>
        <span className="icon large-heading" />
        <span className="text">Large Heading</span>
        {blockType === 'h1' && <span className="active" />}
      </button>
      <button className="item" onClick={formatSmallHeading}>
        <span className="icon small-heading" />
        <span className="text">Small Heading</span>
        {blockType === 'h2' && <span className="active" />}
      </button>
      <button className="item" onClick={formatBulletList}>
        <span className="icon bullet-list" />
        <span className="text">Bullet List</span>
        {blockType === 'ul' && <span className="active" />}
      </button>
      <button className="item" onClick={formatNumberedList}>
        <span className="icon numbered-list" />
        <span className="text">Numbered List</span>
        {blockType === 'ol' && <span className="active" />}
      </button>
      <button className="item" onClick={formatQuote}>
        <span className="icon quote" />
        <span className="text">Quote</span>
        {blockType === 'quote' && <span className="active" />}
      </button>
      <button className="item" onClick={formatCode}>
        <span className="icon code" />
        <span className="text">Code Block</span>
        {blockType === 'code' && <span className="active" />}
      </button>
    </div>
  );
}

export default function BlockControlsPlugin(): React$Node {
  const [editor] = useEditorContext(PlaygroundEditorContext);
  const [selectedElementKey, setSelectedElementKey] = useState(null);
  const [position, setPosition] = useState(0);
  const [editorPosition, setEditorPosition] = useState(0);
  const [blockType, setBlockType] = useState('paragraph');
  const [showDropDown, setShowDropDown] = useState(false);
  const elementControlsRef = useRef(null);

  useEffect(() => {
    return editor.addListener('update', ({editorState}) => {
      editorState.read(() => {
        const selection = getSelection();
        if (selection !== null) {
          const anchorNode = selection.anchor.getNode();
          const element =
            anchorNode.getKey() === 'root'
              ? anchorNode
              : anchorNode.getTopLevelElementOrThrow();
          const elementKey = element.getKey();
          if (elementKey !== selectedElementKey) {
            const elementDOM = editor.getElementByKey(elementKey);
            if (elementDOM !== null) {
              const root = editor.getRootElement();
              let editorTop = editorPosition;

              if (root !== null && editorPosition === 0) {
                const {top} = root.getBoundingClientRect();
                editorTop = top;
                setEditorPosition(editorPosition);
              }
              const {top} = elementDOM.getBoundingClientRect();
              setPosition(top - editorTop);
              setSelectedElementKey(elementKey);
              const type =
                isHeadingNode(element) || isListNode(element)
                  ? element.getTag()
                  : element.getType();
              setBlockType(type);
            }
          }
        }
      });
    });
  }, [editor, editorPosition, selectedElementKey]);

  if (!supportedBlockTypes.has(blockType)) {
    return null;
  }

  return selectedElementKey !== null ? (
    <>
      <div id="block-controls" style={{top: position}} ref={elementControlsRef}>
        <button
          onClick={() => setShowDropDown(!showDropDown)}
          aria-label="Formatting Options">
          <span className={'block-type ' + blockType} />
        </button>
      </div>
      {showDropDown &&
        createPortal(
          <DropdownList
            editor={editor}
            blockType={blockType}
            elementControlsRef={elementControlsRef}
            setShowDropDown={setShowDropDown}
          />,
          document.body,
        )}
    </>
  ) : null;
}