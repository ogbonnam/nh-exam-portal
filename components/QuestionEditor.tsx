"use client";

import React, { useRef, useState, useEffect, MouseEvent } from "react";
import dynamic from "next/dynamic";
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Focus from "@tiptap/extension-focus";
import Placeholder from "@tiptap/extension-placeholder";

// --- Custom Resizable Image Extension ---

const ResizableImageView = (props: any) => {
  const { node, getPos, editor } = props;
  const imageRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [alignment, setAlignment] = useState(node.attrs.align || "left");
  const isSelected =
    editor.isActive("image") && editor.state.selection.from === getPos();

  useEffect(() => {
    setAlignment(node.attrs.align);
  }, [node.attrs.align]);

  const handleResize = (e: MouseEvent, position: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!imageRef.current) return;

    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = imageRef.current.width;
    const aspectRatio = startWidth / imageRef.current.height;

    const onMouseMove = (moveEvent: globalThis.MouseEvent) => {
      let newWidth = startWidth;
      if (position.includes("right")) {
        newWidth = startWidth + (moveEvent.clientX - startX);
      }
      if (position.includes("left")) {
        newWidth = startWidth - (moveEvent.clientX - startX);
      }
      const newHeight = newWidth / aspectRatio;

      editor.commands.updateAttributes("image", {
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleAlignment = (align: "left" | "center" | "right") => {
    editor.commands.updateAttributes("image", {
      align: align,
    });
  };

  const AlignmentToolbar = () => (
    <div className="absolute top-0 right-0 z-10 p-1 bg-white border border-gray-300 rounded shadow-md flex gap-1">
      <button
        onClick={() => handleAlignment("left")}
        className={`p-1 text-xs rounded ${
          alignment === "left" ? "bg-gray-300" : "bg-gray-100"
        }`}
      >
        Left
      </button>
      <button
        onClick={() => handleAlignment("center")}
        className={`p-1 text-xs rounded ${
          alignment === "center" ? "bg-gray-300" : "bg-gray-100"
        }`}
      >
        Center
      </button>
      <button
        onClick={() => handleAlignment("right")}
        className={`p-1 text-xs rounded ${
          alignment === "right" ? "bg-gray-300" : "bg-gray-100"
        }`}
      >
        Right
      </button>
    </div>
  );

  return (
    <NodeViewWrapper
      as="span"
      data-align={alignment}
      className={`relative inline-block ${isSelected ? "is-selected" : ""}`}
      style={{
        float: alignment,
        position: "relative",
      }}
    >
      <img
        src={node.attrs.src}
        alt={node.attrs.alt}
        title={node.attrs.title}
        style={{
          width: node.attrs.width,
          height: node.attrs.height,
        }}
        ref={imageRef}
      />

      {isSelected && <AlignmentToolbar />}

      {isSelected && (
        <>
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize"
            onMouseDown={(e) => handleResize(e as any, "bottom-right")}
          />
          <div
            className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-sw-resize"
            onMouseDown={(e) => handleResize(e as any, "bottom-left")}
          />
          <div
            className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize"
            onMouseDown={(e) => handleResize(e as any, "top-left")}
          />
          <div
            className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-ne-resize"
            onMouseDown={(e) => handleResize(e as any, "top-right")}
          />
        </>
      )}
    </NodeViewWrapper>
  );
};

const ResizableImage = Node.create({
  name: "image",
  group: "block",
  content: "",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      align: { default: "left" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element) => {
          const style = (element as HTMLElement).style;
          return {
            src: element.getAttribute("src"),
            title: element.getAttribute("title"),
            alt: element.getAttribute("alt"),
            width: style.width,
            height: style.height,
            align: style.float || "left",
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { width, height, align } = node.attrs;
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style: `width: ${width}; height: ${height}; float: ${align};`,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

// --- Main QuestionEditor Component ---

type QuestionEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

// This function is now exported so the parent component can use it.
export const extractContentAndImage = (htmlContent: string) => {
  if (!htmlContent) return { text: "", imageUrl: null };

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  let imageUrl = null;
  const allImages = tempDiv.querySelectorAll("img");

  if (allImages.length > 1) {
    console.warn(
      "Multiple images detected in editor content. Only the first image will be saved to the database per the current schema."
    );
  }

  const firstImage = allImages.length > 0 ? allImages[0] : null;

  if (firstImage) {
    imageUrl = firstImage.getAttribute("src");
    firstImage.remove();
  }

  let text = tempDiv.textContent || "";
  text = text.trim();

  return { text, imageUrl };
};

const TipTapEditorInner = ({ value, onChange }: QuestionEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        validate: (href) => /^https?:\/\//.test(href),
      }),
      ResizableImage,
      Focus.configure({
        className: "has-focus",
        mode: "all",
      }),
      Placeholder.configure({
        placeholder: "Start typing here...",
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onloadend = () => {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: {
              src: reader.result as string,
            },
          })
          .run();
      };
      reader.readAsDataURL(file);
    }
  };

  const MenuBar = () => {
    if (!editor) {
      return null;
    }

    const setLink = () => {
      if (editor.isActive("link")) {
        editor.chain().focus().unsetLink().run();
        return;
      }
      const previousUrl = editor.getAttributes("link").href;
      const url = window.prompt("URL", previousUrl);
      if (url === null) {
        return;
      }
      if (url === "") {
        return;
      }
      editor.chain().focus().setLink({ href: url }).run();
    };

    const hasImage = editor.getHTML().includes("<img");

    return (
      <div className="flex flex-wrap p-2 border-b-2 border-gray-200 gap-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded ${
            editor.isActive("bold") ? "bg-gray-300" : "bg-gray-100"
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded ${
            editor.isActive("italic") ? "bg-gray-300" : "bg-gray-100"
          }`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded ${
            editor.isActive("bulletList") ? "bg-gray-300" : "bg-gray-100"
          }`}
        >
          &#x2022; List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded ${
            editor.isActive("orderedList") ? "bg-gray-300" : "bg-gray-100"
          }`}
        >
          1. List
        </button>
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                .run()
            }
            className={`p-1 rounded ${
              editor.isActive("heading", { level })
                ? "bg-gray-300"
                : "bg-gray-100"
            }`}
          >
            H{level}
          </button>
        ))}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (!hasImage) {
                fileInputRef.current?.click();
              }
            }}
            disabled={hasImage}
            className={`p-1 rounded ${
              hasImage ? "bg-gray-400 cursor-not-allowed" : "bg-gray-100"
            }`}
          >
            Image
          </button>
          {hasImage && (
            <span className="absolute left-0 top-full mt-1 text-xs text-red-500 whitespace-nowrap">
              Only one image per question.
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={setLink}
          className={`p-1 rounded ${
            editor.isActive("link") ? "bg-gray-300" : "bg-gray-100"
          }`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1 rounded ${
            editor.isActive("codeBlock") ? "bg-gray-300" : "bg-gray-100"
          }`}
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1 rounded ${
            editor.isActive("blockquote") ? "bg-gray-300" : "bg-gray-100"
          }`}
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().run()}
          className="p-1 rounded bg-gray-100"
        >
          Clear
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300">
      <MenuBar />
      <div
        className="border border-gray-300 rounded-md bg-white flex flex-col min-h-[150px] max-h-[300px] focus-within:ring-2 focus-within:ring-blue-500"
        onClick={() => editor?.chain().focus().run()}
      >
        {/* <MenuBar /> */}

        <EditorContent
          editor={editor}
          className="
    prose max-w-none outline-none flex-1 px-3 py-2 overflow-y-auto
    [&>p:first-child]:min-h-[80%]   /* first <p> fills 80% of editor height */
    [&>p:first-child]:before:content-['Type_here...'] /* show placeholder */
    [&>p:first-child]:before:text-gray-400
    [&>p:first-child]:before:block
  "
        />
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
    </div>
  );
};

const DynamicTipTapEditor = dynamic(() => Promise.resolve(TipTapEditorInner), {
  ssr: false,
  loading: () => (
    <div className="p-4 bg-gray-100 rounded">Loading editor...</div>
  ),
});

export default function QuestionEditor(props: QuestionEditorProps) {
  return <DynamicTipTapEditor {...props} />;
}
