import React, { useState, useRef, useEffect, MouseEvent } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";

const ResizableImageView = (props: NodeViewProps) => {
  const { node, getPos, editor } = props;
  const imageRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [alignment, setAlignment] = useState(node.attrs.align || "left");

  useEffect(() => {
    // Sync the alignment from the node attrs to our state
    setAlignment(node.attrs.align);
  }, [node.attrs.align]);

  // Function to handle the resize logic
  const handleResize = (e: MouseEvent, position: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!imageRef.current) return;

    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = imageRef.current.width;
    const startHeight = imageRef.current.height;
    const aspectRatio = startWidth / startHeight;

    const onMouseMove = (moveEvent: globalThis.MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (position.includes("right")) {
        newWidth = startWidth + (moveEvent.clientX - startX);
      }
      if (position.includes("left")) {
        newWidth = startWidth - (moveEvent.clientX - startX);
      }
      newHeight = newWidth / aspectRatio;

      // Update the node attributes with the new dimensions
      editor.commands.updateAttributes("resizableImage", {
        width: `${newWidth}px`,
        height: `${newHeight}px`,
        style: `width: ${newWidth}px; height: ${newHeight}px; float: ${alignment};`,
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

  // Function to change the alignment
  const handleAlignment = (align: "left" | "center" | "right") => {
    const { width, height } = node.attrs;
    editor.commands.updateAttributes("resizableImage", {
      align: align,
      style: `width: ${width}; height: ${height}; float: ${align};`,
    });
  };

  const selected =
    editor.state.selection.content().content.maybeChild(0)?.type.name ===
      "resizableImage" && editor.state.selection.from === getPos();

  return (
    <NodeViewWrapper
      as="span"
      className={`relative inline-block ${isResizing ? "resize-cursor" : ""} ${
        selected ? "is-selected" : ""
      }`}
      style={{ float: alignment }}
      data-align={alignment}
    >
      <img
        src={node.attrs.src}
        alt={node.attrs.alt}
        title={node.attrs.title}
        width={node.attrs.width}
        height={node.attrs.height}
        ref={imageRef}
        className="w-full h-auto"
      />

      {/* Alignment Toolbar */}
      {selected && (
        <div className="absolute top-0 right-0 z-10 p-2 bg-white border border-gray-300 rounded shadow-md flex gap-2">
          <button
            onClick={() => handleAlignment("left")}
            className={`p-1 rounded ${
              alignment === "left" ? "bg-gray-300" : "bg-gray-100"
            }`}
          >
            Left
          </button>
          <button
            onClick={() => handleAlignment("center")}
            className={`p-1 rounded ${
              alignment === "center" ? "bg-gray-300" : "bg-gray-100"
            }`}
          >
            Center
          </button>
          <button
            onClick={() => handleAlignment("right")}
            className={`p-1 rounded ${
              alignment === "right" ? "bg-gray-300" : "bg-gray-100"
            }`}
          >
            Right
          </button>
        </div>
      )}

      {/* Resize Handles */}
      {selected && (
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

export default ResizableImageView;
