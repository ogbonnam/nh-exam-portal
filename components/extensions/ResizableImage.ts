import { Node } from "@tiptap/core";
import { mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";
import ResizableImageView from "./ResizableImageView"; // This will be created in the next step

// The ResizableImage extension is a custom extension that wraps the default
// image node and adds a custom node view to provide resizing and alignment.
export const ResizableImage = Node.create({
  name: "resizableImage",
  group: "block",
  content: "",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      // New attributes for resizing and alignment
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      style: {
        default: null,
      },
      align: {
        default: "left", // Default alignment
      },
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
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

export default ResizableImage;
