import { useEffect, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { useNoteStore } from '@store/useNoteStore';

interface GraphViewProps {
  onNodeClick?: (nodeId: string) => void;
}

export function GraphView({ onNodeClick }: GraphViewProps) {
  const { graphData, updateGraphData } = useNoteStore();
  // @ts-expect-error - React 19 strict typing, ForceGraph2D expects MutableRefObject
  const graphRef = useRef<ForceGraphMethods>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial graph data calculation
    updateGraphData();
  }, [updateGraphData]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Get CSS variable colors
  const getPrimaryColor = () => {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  };

  const getLinkColor = () => {
    // Fully opaque: black in light mode, white in dark mode
    return isDarkMode ? '#ffffff' : '#000000';
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-background overflow-hidden">
      <ForceGraph2D
        ref={graphRef as any}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="title"
        nodeColor={getPrimaryColor}
        linkColor={getLinkColor}
        nodeRelSize={6}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        onNodeClick={(node: any) => {
          if (onNodeClick) {
            onNodeClick(node.id);
          }
        }}
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400)}
      />
    </div>
  );
}
