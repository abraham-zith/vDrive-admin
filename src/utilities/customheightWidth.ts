

import { useLayoutEffect, useState, type RefObject } from "react";
import { useDebouncedCallback } from "use-debounce";

/**
 * Custom hook to calculate the height of a referenced element for a table.
 * It subtracts a fixed value (55px) for headers/footers and debounces
 * the resize event for performance.
 *
 * @param ref - A React ref object attached to the container element.
 * @returns The calculated height for the table body.
 */
export const useGetHeight = (ref: RefObject<Element | null>) => {
  const [tableHeight, setTableHeight] = useState<number>();

  // Debounce the resize callback to avoid performance issues
  const resizeTable = useDebouncedCallback(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const { height } = node.getBoundingClientRect();
    // height of the content minus the header and footer
    setTableHeight(height - 55);
  }, 100);

  useLayoutEffect(() => {
    resizeTable();
    window.addEventListener("resize", resizeTable);

    return () => {
      window.removeEventListener("resize", resizeTable);
    };
  }, [resizeTable]);

  return tableHeight;
};

/**
 * Custom hook to get the width of a referenced element.
 * It debounces the resize event for performance.
 *
 * @param ref - A React ref object attached to the container element.
 * @returns The width of the element.
 */
export const useGetWidth = (ref: RefObject<Element | null>) => {
  const [width, setWidth] = useState<number>();

  const resizeWidth = useDebouncedCallback(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const { width } = node.getBoundingClientRect();
    setWidth(width);
  }, 100);

  useLayoutEffect(() => {
    resizeWidth();
    window.addEventListener("resize", resizeWidth);

    return () => {
      window.removeEventListener("resize", resizeWidth);
    };
  }, [resizeWidth]);

  return width;
};
