'use client'

import { useState, useCallback } from 'react'
import { SequenceNode } from '@/lib/parsers'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { LayoutList, GitMerge } from 'lucide-react'

// Layout helper (very simple hardcoded layout since we don't have dagre installed to save time, 
// or we can just calculate simple x/y based on index/depth if we want to be fancy).
// For MVP, simple depth calculation:
function generateLayout(nodesData: SequenceNode[]): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  
  // Find roots (no prerequisites)
  let currentLevel = nodesData.filter(n => n.prerequisites.length === 0)
  let levelIndex = 0
  
  const placed = new Set<string>()
  
  while (currentLevel.length > 0) {
    const nextLevel: SequenceNode[] = []
    
    currentLevel.forEach((nodeData, index) => {
      if (placed.has(nodeData.id)) return
      
      nodes.push({
        id: nodeData.id,
        position: { x: index * 250 + 50, y: levelIndex * 150 + 50 },
        data: { label: `${nodeData.id}\n(${nodeData.type})` },
        style: {
          background: '#18181b', // zinc-900
          color: '#e4e4e7', // zinc-200
          border: '1px solid #27272a', // zinc-800
          borderRadius: '8px',
          padding: '10px',
          width: 180,
          textAlign: 'center' as const,
          fontSize: '12px'
        }
      })
      placed.add(nodeData.id)
      
      // Edges
      nodeData.leads_to.forEach(targetId => {
        edges.push({
          id: `e-${nodeData.id}-${targetId}`,
          source: nodeData.id,
          target: targetId,
          animated: true,
          style: { stroke: '#3b82f6' } // blue-500
        })
        const targetNode = nodesData.find(n => n.id === targetId)
        if (targetNode && !placed.has(targetId) && !nextLevel.includes(targetNode)) {
          nextLevel.push(targetNode)
        }
      })
    })
    
    currentLevel = nextLevel
    levelIndex++
  }
  
  return { nodes, edges }
}

export default function ProgramGraph({ sequenceNodes }: { sequenceNodes: SequenceNode[] }) {
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('graph')
  
  const initialElements = generateLayout(sequenceNodes)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg flex flex-col h-[600px]">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Визуализация графа</h2>
        <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <LayoutList className="w-4 h-4 mr-2" />
            Список
          </button>
          <button 
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${viewMode === 'graph' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <GitMerge className="w-4 h-4 mr-2" />
            Граф
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative bg-zinc-950">
        {viewMode === 'graph' ? (
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            colorMode="dark"
          >
            <Background color="#27272a" />
            <Controls />
            <MiniMap 
              nodeColor="#3b82f6" 
              maskColor="rgba(0, 0, 0, 0.5)" 
              style={{ backgroundColor: '#18181b' }}
            />
          </ReactFlow>
        ) : (
          <div className="p-6 overflow-y-auto h-full space-y-4">
            {sequenceNodes.map(node => (
              <div key={node.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-mono text-blue-400 font-bold">{node.id}</h3>
                  <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">{node.type}</span>
                </div>
                <p className="text-sm text-zinc-300 mb-3">{node.title}</p>
                {node.leads_to.length > 0 && (
                  <div className="text-xs text-zinc-500">
                    <span className="text-zinc-400">Ведет к: </span>
                    {node.leads_to.map(l => (
                      <span key={l} className="inline-block bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded mr-1 mb-1">{l}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
