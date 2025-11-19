export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Link {
  source: string; // Note ID
  target: string; // Note ID
}

export interface GraphNode extends Note {
  // Properties specific to graph visualization (optional, can be extended in UI layer)
  x?: number;
  y?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: Link[];
}
