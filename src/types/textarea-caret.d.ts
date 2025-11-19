declare module 'textarea-caret' {
  export default function getCaretCoordinates(
    element: HTMLTextAreaElement | HTMLInputElement,
    position: number
  ): {
    top: number;
    left: number;
    height: number;
  };
}
