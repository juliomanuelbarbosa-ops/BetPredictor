import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';

export interface GraphNode {
    id: string;
    type: 'Team' | 'Player' | 'Manager';
    name: string;
    attributes: Record<string, any>;
    updatedAt: string;
}

export interface GraphEdge {
    id: string;
    sourceId: string;
    targetId: string;
    type: 'PlayedAgainst' | 'ManagedBy' | 'PlaysFor' | 'ScoredAgainst';
    attributes: Record<string, any>;
    timestamp: string;
}

export class KnowledgeGraph {
    private nodesCol = collection(db, 'kg_nodes');
    private edgesCol = collection(db, 'kg_edges');

    async addNode(node: GraphNode): Promise<void> {
        await setDoc(doc(this.nodesCol, node.id), node);
    }

    async addEdge(edge: GraphEdge): Promise<void> {
        await setDoc(doc(this.edgesCol, edge.id), edge);
    }

    async getNode(id: string): Promise<GraphNode | null> {
        const snap = await getDoc(doc(this.nodesCol, id));
        if (snap.exists()) {
            return snap.data() as GraphNode;
        }
        return null;
    }

    async getEdgesForNode(nodeId: string): Promise<GraphEdge[]> {
        const sourceQuery = query(this.edgesCol, where('sourceId', '==', nodeId));
        const targetQuery = query(this.edgesCol, where('targetId', '==', nodeId));
        
        const [sourceSnaps, targetSnaps] = await Promise.all([
            getDocs(sourceQuery),
            getDocs(targetQuery)
        ]);

        const edges: GraphEdge[] = [];
        sourceSnaps.forEach(doc => edges.push(doc.data() as GraphEdge));
        targetSnaps.forEach(doc => edges.push(doc.data() as GraphEdge));
        
        // Remove duplicates if any
        const uniqueEdges = Array.from(new Map(edges.map(e => [e.id, e])).values());
        return uniqueEdges;
    }

    async queryRelationships(sourceId: string, targetId: string): Promise<GraphEdge[]> {
        const q1 = query(this.edgesCol, where('sourceId', '==', sourceId), where('targetId', '==', targetId));
        const q2 = query(this.edgesCol, where('sourceId', '==', targetId), where('targetId', '==', sourceId));
        
        const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const edges: GraphEdge[] = [];
        s1.forEach(doc => edges.push(doc.data() as GraphEdge));
        s2.forEach(doc => edges.push(doc.data() as GraphEdge));
        return edges;
    }
}

export const kg = new KnowledgeGraph();
