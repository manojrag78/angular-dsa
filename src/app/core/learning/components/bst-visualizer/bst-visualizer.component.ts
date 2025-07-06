import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  parent: TreeNode | null;
  x?: number;
  y?: number;
  state?: 'default' | 'active' | 'visited' | 'selected' | 'processing';
}

interface VisualNode {
  value: number;
  x: number;
  y: number;
  state: 'default' | 'active' | 'visited' | 'selected' | 'processing';
}

interface VisualEdge {
  from: number;
  to: number;
  path: string;
  state: 'default' | 'active' | 'visited';
}

@Component({
  selector: 'app-bst-visualizer',
  templateUrl: './bst-visualizer.component.html',
  styleUrls: ['./bst-visualizer.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BstVisualizerComponent implements OnInit {
  @ViewChild('treeSvg') treeSvg!: ElementRef;

  root: TreeNode | null = null;
  nodes: VisualNode[] = [];
  edges: VisualEdge[] = [];
  animationSpeed = 500;
  isWorking = false;
  isPaused = false;
  selectedOperation = 'insert';
  operationValue: number | null = null;
  operationText = 'Select an operation to begin';
  visitedNodes: number[] = [];
  currentPath: number[] = [];
  private visualizationTimeout: any = null;
  private visualizationPromise: Promise<void> | null = null;
  private visualizationResolve: (() => void) | null = null;
  private selectedNodeValue: number | null = null;

  ngOnInit() {
    this.generateRandomTree();
  }

  async performOperation() {
    if (this.isWorking) return;

    this.isWorking = true;
    this.resetVisualStates();

    try {
      switch (this.selectedOperation) {
        case 'insert':
          if (this.operationValue !== null) {
            await this.insertValue(this.operationValue);
          }
          break;
        case 'delete':
          if (this.operationValue !== null) {
            await this.deleteValue(this.operationValue);
          }
          break;
        case 'search':
          if (this.operationValue !== null) {
            await this.searchValue(this.operationValue);
          }
          break;
        case 'inorder':
          await this.inorderTraversal();
          break;
        case 'preorder':
          await this.preorderTraversal();
          break;
        case 'postorder':
          await this.postorderTraversal();
          break;
      }
    } finally {
      this.isWorking = false;
      this.isPaused = false;
      this.operationValue = null;
    }
  }

  async insertValue(value: number) {
    this.operationText = `Inserting ${value} into BST`;
    await this.delay();

    if (!this.root) {
      this.root = this.createNode(value);
      this.updateVisualTree();
      this.operationText = `Created root node with value ${value}`;
      await this.delay();
      return;
    }

    let currentNode = this.root;
    this.currentPath = [currentNode.value];
    this.highlightNode(currentNode.value, 'active');
    this.operationText = `Starting at root (${currentNode.value})`;
    await this.delay();

    while (true) {
      if (value < currentNode.value) {
        this.operationText = `${value} < ${currentNode.value}, moving left`;
        await this.delay();

        if (!currentNode.left) {
          currentNode.left = this.createNode(value, currentNode);
          this.updateVisualTree();
          this.highlightNode(value, 'active');
          this.operationText = `Inserted ${value} as left child of ${currentNode.value}`;
          await this.delay();
          break;
        } else {
          currentNode = currentNode.left;
          this.currentPath.push(currentNode.value);
          this.highlightNode(currentNode.value, 'active');
          this.operationText = `Moved to left child (${currentNode.value})`;
          await this.delay();
        }
      } else if (value > currentNode.value) {
        this.operationText = `${value} > ${currentNode.value}, moving right`;
        await this.delay();

        if (!currentNode.right) {
          currentNode.right = this.createNode(value, currentNode);
          this.updateVisualTree();
          this.highlightNode(value, 'active');
          this.operationText = `Inserted ${value} as right child of ${currentNode.value}`;
          await this.delay();
          break;
        } else {
          currentNode = currentNode.right;
          this.currentPath.push(currentNode.value);
          this.highlightNode(currentNode.value, 'active');
          this.operationText = `Moved to right child (${currentNode.value})`;
          await this.delay();
        }
      } else {
        this.operationText = `Value ${value} already exists in the tree`;
        this.highlightNode(currentNode.value, 'processing');
        await this.delay();
        break;
      }
    }

    this.resetVisualStates();
    this.operationText = `Insert operation completed for value ${value}`;
  }

  async deleteValue(value: number) {
    this.operationText = `Searching for ${value} to delete`;
    await this.delay();

    const nodeToDelete = await this.findNode(value);
    if (!nodeToDelete) {
      this.operationText = `Value ${value} not found in the tree`;
      return;
    }

    this.highlightNode(value, 'processing');
    this.operationText = `Preparing to delete node ${value}`;
    await this.delay();

    // Case 1: Node has no children
    if (!nodeToDelete.left && !nodeToDelete.right) {
      this.operationText = `Node ${value} has no children - simple deletion`;
      await this.delay();

      if (nodeToDelete.parent) {
        if (nodeToDelete.parent.left === nodeToDelete) {
          nodeToDelete.parent.left = null;
        } else {
          nodeToDelete.parent.right = null;
        }
      } else {
        this.root = null;
      }
    }
    // Case 2: Node has one child
    else if (!nodeToDelete.left || !nodeToDelete.right) {
      const child = nodeToDelete.left || nodeToDelete.right;
      this.operationText = `Node ${value} has one child - promoting ${child!.value}`;
      await this.delay();

      if (nodeToDelete.parent) {
        if (nodeToDelete.parent.left === nodeToDelete) {
          nodeToDelete.parent.left = child;
        } else {
          nodeToDelete.parent.right = child;
        }
        child!.parent = nodeToDelete.parent;
      } else {
        this.root = child;
        if (child) child.parent = null;
      }
    }
    // Case 3: Node has two children
    else {
      this.operationText = `Node ${value} has two children - finding successor`;
      await this.delay();

      const successor = this.findMinNode(nodeToDelete.right);
      this.highlightNode(successor.value, 'active');
      this.operationText = `Found successor ${successor.value}`;
      await this.delay();

      // Temporarily highlight the movement
      this.highlightNode(nodeToDelete.value, 'processing');
      this.highlightNode(successor.value, 'active');
      this.operationText = `Moving ${successor.value} to replace ${value}`;
      await this.delay();

      // Store successor value and delete the successor node
      const successorValue = successor.value;
      await this.deleteValue(successor.value);
      
      // Replace the value
      nodeToDelete.value = successorValue;
      this.operationText = `Replaced ${value} with ${successorValue}`;
      await this.delay();
    }

    this.updateVisualTree();
    this.operationText = `Deleted node ${value} from the tree`;
    await this.delay();
  }

  async searchValue(value: number) {
    this.operationText = `Searching for value ${value}`;
    await this.delay();

    const node = await this.findNode(value);
    if (node) {
      this.highlightNode(value, 'visited');
      this.operationText = `Found value ${value} in the tree`;
      this.visitedNodes = [value];
    } else {
      this.operationText = `Value ${value} not found in the tree`;
    }
    await this.delay();
  }

  async inorderTraversal() {
    this.operationText = 'Starting in-order traversal (Left → Root → Right)';
    await this.delay();
    this.visitedNodes = [];
    await this.inorderHelper(this.root);
    this.operationText = `In-order traversal completed: ${this.visitedNodes.join(', ')}`;
  }

  private async inorderHelper(node: TreeNode | null) {
    if (!node) return;
    
    await this.inorderHelper(node.left);
    
    this.highlightNode(node.value, 'visited');
    this.visitedNodes.push(node.value);
    this.operationText = `Visited node ${node.value}`;
    await this.delay();
    
    await this.inorderHelper(node.right);
  }

  async preorderTraversal() {
    this.operationText = 'Starting pre-order traversal (Root → Left → Right)';
    await this.delay();
    this.visitedNodes = [];
    await this.preorderHelper(this.root);
    this.operationText = `Pre-order traversal completed: ${this.visitedNodes.join(', ')}`;
  }

  private async preorderHelper(node: TreeNode | null) {
    if (!node) return;
    
    this.highlightNode(node.value, 'visited');
    this.visitedNodes.push(node.value);
    this.operationText = `Visited node ${node.value}`;
    await this.delay();
    
    await this.preorderHelper(node.left);
    await this.preorderHelper(node.right);
  }

  async postorderTraversal() {
    this.operationText = 'Starting post-order traversal (Left → Right → Root)';
    await this.delay();
    this.visitedNodes = [];
    await this.postorderHelper(this.root);
    this.operationText = `Post-order traversal completed: ${this.visitedNodes.join(', ')}`;
  }

  private async postorderHelper(node: TreeNode | null) {
    if (!node) return;
    
    await this.postorderHelper(node.left);
    await this.postorderHelper(node.right);
    
    this.highlightNode(node.value, 'visited');
    this.visitedNodes.push(node.value);
    this.operationText = `Visited node ${node.value}`;
    await this.delay();
  }

  generateRandomTree() {
    this.root = null;
    const nodeCount = Math.floor(Math.random() * 5) + 5; // 5-10 nodes
    const values = new Set<number>();

    while (values.size < nodeCount) {
      values.add(Math.floor(Math.random() * 50) + 1);
    }

    Array.from(values).forEach(value => {
      this.insertWithoutAnimation(value);
    });

    this.updateVisualTree();
    this.operationText = `Generated random BST with ${nodeCount} nodes`;
  }

  pauseOperation() {
    this.isPaused = true;
    this.operationText = 'Operation paused';
  }

  resumeOperation() {
    this.isPaused = false;
    if (this.visualizationResolve) {
      this.visualizationResolve();
      this.visualizationResolve = null;
    }
    this.operationText = 'Resuming operation...';
  }

  setSelectedNode(value: number) {
    if (this.isWorking) return;
    this.selectedNodeValue = value;
    this.resetVisualStates();
    this.highlightNode(value, 'selected');
    this.operationText = `Selected node ${value}`;
  }

  private async findNode(value: number): Promise<TreeNode | null> {
    let currentNode = this.root;
    this.currentPath = [];
    
    while (currentNode) {
      this.currentPath.push(currentNode.value);
      this.highlightNode(currentNode.value, 'active');
      this.operationText = `Checking node ${currentNode.value}`;
      await this.delay();

      if (value === currentNode.value) {
        return currentNode;
      } else if (value < currentNode.value) {
        this.operationText = `${value} < ${currentNode.value}, moving left`;
        await this.delay();
        currentNode = currentNode.left;
      } else {
        this.operationText = `${value} > ${currentNode.value}, moving right`;
        await this.delay();
        currentNode = currentNode.right;
      }
    }

    return null;
  }

  private findMinNode(node: TreeNode): TreeNode {
    while (node.left) {
      node = node.left;
    }
    return node;
  }

  private createNode(value: number, parent: TreeNode | null = null): TreeNode {
    return { value, left: null, right: null, parent };
  }

  private insertWithoutAnimation(value: number) {
    if (!this.root) {
      this.root = this.createNode(value);
      return;
    }

    let currentNode = this.root;
    while (true) {
      if (value < currentNode.value) {
        if (!currentNode.left) {
          currentNode.left = this.createNode(value, currentNode);
          break;
        } else {
          currentNode = currentNode.left;
        }
      } else if (value > currentNode.value) {
        if (!currentNode.right) {
          currentNode.right = this.createNode(value, currentNode);
          break;
        } else {
          currentNode = currentNode.right;
        }
      } else {
        break; // Value already exists
      }
    }
  }

  private updateVisualTree() {
    this.nodes = [];
    this.edges = [];
    if (!this.root) return;

    // Calculate node positions
    const positions = new Map<number, { x: number, y: number }>();
    const calculatePositions = (
      node: TreeNode | null, 
      x: number, 
      y: number, 
      level: number, 
      offset: number
    ) => {
      if (!node) return;
      
      const nodeX = x + offset;
      positions.set(node.value, { x: nodeX, y });
      
      const childOffset = 100 / Math.pow(2, level);
      calculatePositions(node.left, nodeX, y + 80, level + 1, -childOffset);
      calculatePositions(node.right, nodeX, y + 80, level + 1, childOffset);
    };

    calculatePositions(this.root, 400, 60, 1, 200);

    // Create visual nodes
    const allNodes: TreeNode[] = [];
    const traverse = (node: TreeNode | null) => {
      if (!node) return;
      allNodes.push(node);
      traverse(node.left);
      traverse(node.right);
    };
    traverse(this.root);

    this.nodes = allNodes.map(node => {
      const pos = positions.get(node.value)!;
      return {
        value: node.value,
        x: pos.x,
        y: pos.y,
        state: 'default'
      };
    });

    // Create visual edges
    const addedEdges = new Set<string>();
    allNodes.forEach(node => {
      if (node.left) {
        const from = positions.get(node.value)!;
        const to = positions.get(node.left.value)!;
        const edgeKey = `${node.value}-${node.left.value}`;
        if (!addedEdges.has(edgeKey)) {
          this.edges.push({
            from: node.value,
            to: node.left.value,
            path: `M${from.x},${from.y} L${to.x},${to.y}`,
            state: 'default'
          });
          addedEdges.add(edgeKey);
        }
      }
      if (node.right) {
        const from = positions.get(node.value)!;
        const to = positions.get(node.right.value)!;
        const edgeKey = `${node.value}-${node.right.value}`;
        if (!addedEdges.has(edgeKey)) {
          this.edges.push({
            from: node.value,
            to: node.right.value,
            path: `M${from.x},${from.y} L${to.x},${to.y}`,
            state: 'default'
          });
          addedEdges.add(edgeKey);
        }
      }
    });
  }

  private highlightNode(value: number, state: 'active' | 'visited' | 'selected' | 'processing') {
    const node = this.nodes.find(n => n.value === value);
    if (node) {
      node.state = state;
    }
  }

  private highlightEdge(from: number, to: number, state: 'active' | 'visited') {
    const edge = this.edges.find(e => 
      (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    if (edge) {
      edge.state = state;
    }
  }

  private resetVisualStates() {
    this.nodes.forEach(node => {
      if (node.state !== 'selected' || node.value !== this.selectedNodeValue) {
        node.state = 'default';
      }
    });
    this.edges.forEach(edge => {
      edge.state = 'default';
    });
    this.visitedNodes = [];
    this.currentPath = [];
  }

  private async delay(): Promise<void> {
    await this.checkPaused();
    return new Promise(resolve => {
      this.visualizationTimeout = setTimeout(() => {
        resolve();
      }, this.animationSpeed);
    });
  }

  private async checkPaused() {
    if (this.isPaused) {
      this.operationText = 'Operation paused - click Resume to continue';
      this.visualizationPromise = new Promise(resolve => {
        this.visualizationResolve = resolve;
      });
      await this.visualizationPromise;
    }
  }
}