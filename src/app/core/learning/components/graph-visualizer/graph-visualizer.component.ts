import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface GraphNode {
  id: number;
  x: number;
  y: number;
  state: 'default' | 'start' | 'active' | 'visited' | 'processing';
  neighbors: number[];
}

interface GraphEdge {
  from: number;
  to: number;
  path: string;
  state: 'default' | 'active' | 'visited';
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

@Component({
  selector: 'app-graph-visualizer',
  templateUrl: './graph-visualizer.component.html',
  styleUrls: ['./graph-visualizer.component.scss'],
  standalone: true,
  imports: [CommonModule , FormsModule] 
})
export class GraphVisualizerComponent implements OnInit {
  @ViewChild('graphSvg') graphSvg!: ElementRef;

  graph: Graph = { nodes: [], edges: [] };
  nodeCount = 5;
  animationSpeed = 500;
  selectedAlgorithm: 'bfs' | 'dfs' = 'bfs';
  isVisualizing = false;
  isPaused = false;
  operationText = 'Select a starting node to begin visualization';
  visitedNodes: number[] = [];
  queue: number[] = [];
  stack: number[] = [];
  private visualizationTimeout: any = null;
  private visualizationPromise: Promise<void> | null = null;
  private visualizationResolve: (() => void) | null = null;

  ngOnInit() {
    this.generateGraph();
  }

  generateGraph() {
    this.resetVisualization();
    this.graph = { nodes: [], edges: [] };

    // Generate nodes with random positions
    for (let i = 0; i < this.nodeCount; i++) {
      this.graph.nodes.push({
        id: i,
        x: 100 + Math.random() * 500,
        y: 100 + Math.random() * 300,
        state: 'default',
        neighbors: []
      });
    }

    // Generate edges (create a connected graph)
    for (let i = 0; i < this.nodeCount; i++) {
      // Ensure each node has at least one connection
      if (this.graph.nodes[i].neighbors.length === 0 && i < this.nodeCount - 1) {
        const j = Math.floor(Math.random() * (this.nodeCount - i - 1)) + i + 1;
        this.connectNodes(i, j);
      }

      // Add some random additional connections
      for (let j = i + 1; j < this.nodeCount; j++) {
        if (Math.random() > 0.7) { // 30% chance of connection
          this.connectNodes(i, j);
        }
      }
    }

    // Generate SVG paths for edges
    this.generateEdgePaths();
  }

  private connectNodes(i: number, j: number) {
    this.graph.nodes[i].neighbors.push(j);
    this.graph.nodes[j].neighbors.push(i);
  }

  private generateEdgePaths() {
    this.graph.edges = [];
    const addedEdges = new Set<string>();

    for (let i = 0; i < this.graph.nodes.length; i++) {
      for (const neighbor of this.graph.nodes[i].neighbors) {
        if (i < neighbor) { // Avoid duplicate edges
          const edgeKey = `${i}-${neighbor}`;
          if (!addedEdges.has(edgeKey)) {
            const fromNode = this.graph.nodes[i];
            const toNode = this.graph.nodes[neighbor];
            
            // Create a curved path for visualization
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            
            // Add some curvature to the path
            const curveFactor = 30;
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const normalX = -dy;
            const normalY = dx;
            const len = Math.sqrt(normalX * normalX + normalY * normalY);
            const cX = midX + (normalX / len) * curveFactor;
            const cY = midY + (normalY / len) * curveFactor;
            
            const path = `M${fromNode.x},${fromNode.y} Q${cX},${cY} ${toNode.x},${toNode.y}`;
            
            this.graph.edges.push({
              from: i,
              to: neighbor,
              path: path,
              state: 'default'
            });
            addedEdges.add(edgeKey);
          }
        }
      }
    }
  }

  setStartNode(nodeId: number) {
    if (this.isVisualizing) return;
    
    this.resetVisualization();
    this.graph.nodes[nodeId].state = 'start';
    this.operationText = `Selected node ${nodeId} as starting point. Click "Start Visualization" to begin ${this.selectedAlgorithm.toUpperCase()}.`;
  }

  async startVisualization() {
    if (this.isVisualizing || !this.graph.nodes.some(n => n.state === 'start')) return;
    
    this.isVisualizing = true;
    const startNodeId = this.graph.nodes.find(n => n.state === 'start')!.id;

    if (this.selectedAlgorithm === 'bfs') {
      await this.bfs(startNodeId);
    } else {
      await this.dfs(startNodeId);
    }

    this.isVisualizing = false;
    this.isPaused = false;
  }

  pauseVisualization() {
    this.isPaused = true;
    this.operationText = 'Visualization paused';
  }

  resumeVisualization() {
    this.isPaused = false;
    if (this.visualizationResolve) {
      this.visualizationResolve();
      this.visualizationResolve = null;
    }
    this.operationText = 'Resuming visualization...';
  }

  private async bfs(startNodeId: number) {
    this.queue = [startNodeId];
    this.visitedNodes = [];
    
    while (this.queue.length > 0 && this.isVisualizing) {
      await this.checkPaused();
      
      const currentNodeId = this.queue.shift()!;
      const currentNode = this.graph.nodes[currentNodeId];
      
      // Mark as processing
      currentNode.state = 'processing';
      this.operationText = `Processing node ${currentNodeId}`;
      await this.delay();
      
      // Mark as visited
      currentNode.state = 'visited';
      this.visitedNodes.push(currentNodeId);
      this.operationText = `Visited node ${currentNodeId}`;
      await this.delay();
      
      // Visit neighbors
      for (const neighborId of currentNode.neighbors) {
        const neighbor = this.graph.nodes[neighborId];
        if (neighbor.state === 'default') {
          neighbor.state = 'active';
          this.queue.push(neighborId);
          
          // Highlight edge
          const edge = this.findEdge(currentNodeId, neighborId);
          if (edge) edge.state = 'active';
          
          this.operationText = `Discovered neighbor ${neighborId} from node ${currentNodeId}`;
          await this.delay();
          
          if (edge) edge.state = 'visited';
        }
      }
    }
    
    if (this.isVisualizing) {
      this.operationText = `BFS completed. Visited nodes: ${this.visitedNodes.join(', ')}`;
    }
  }

  private async dfs(startNodeId: number) {
    this.stack = [startNodeId];
    this.visitedNodes = [];
    
    while (this.stack.length > 0 && this.isVisualizing) {
      await this.checkPaused();
      
      const currentNodeId = this.stack.pop()!;
      const currentNode = this.graph.nodes[currentNodeId];
      
      if (currentNode.state === 'visited') continue;
      
      // Mark as processing
      currentNode.state = 'processing';
      this.operationText = `Processing node ${currentNodeId}`;
      await this.delay();
      
      // Mark as visited
      currentNode.state = 'visited';
      this.visitedNodes.push(currentNodeId);
      this.operationText = `Visited node ${currentNodeId}`;
      await this.delay();
      
      // Visit neighbors in reverse order to maintain proper DFS order
      for (let i = currentNode.neighbors.length - 1; i >= 0; i--) {
        const neighborId = currentNode.neighbors[i];
        const neighbor = this.graph.nodes[neighborId];
        if (neighbor.state === 'default') {
          neighbor.state = 'active';
          this.stack.push(neighborId);
          
          // Highlight edge
          const edge = this.findEdge(currentNodeId, neighborId);
          if (edge) edge.state = 'active';
          
          this.operationText = `Discovered neighbor ${neighborId} from node ${currentNodeId}`;
          await this.delay();
          
          if (edge) edge.state = 'visited';
        }
      }
    }
    
    if (this.isVisualizing) {
      this.operationText = `DFS completed. Visited nodes: ${this.visitedNodes.join(', ')}`;
    }
  }

  private findEdge(from: number, to: number): GraphEdge | undefined {
    return this.graph.edges.find(e => 
      (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
  }

  private resetVisualization() {
    this.isVisualizing = false;
    this.isPaused = false;
    this.visitedNodes = [];
    this.queue = [];
    this.stack = [];
    this.operationText = 'Select a starting node to begin visualization';
    
    if (this.visualizationTimeout) {
      clearTimeout(this.visualizationTimeout);
    }
    
    // Reset all nodes and edges to default state
    this.graph.nodes.forEach(node => {
      node.state = 'default';
    });
    
    this.graph.edges.forEach(edge => {
      edge.state = 'default';
    });
  }

  private async checkPaused() {
    if (this.isPaused) {
      this.operationText = 'Visualization paused - click Resume to continue';
      this.visualizationPromise = new Promise(resolve => {
        this.visualizationResolve = resolve;
      });
      await this.visualizationPromise;
    }
  }

  private delay(): Promise<void> {
    return new Promise(resolve => {
      this.visualizationTimeout = setTimeout(() => {
        resolve();
      }, this.animationSpeed);
    });
  }
}