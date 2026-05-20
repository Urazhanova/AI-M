'use client'

import { useState } from 'react'
import { SequenceNode } from '@/lib/parsers'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { LayoutList, GitMerge } from 'lucide-react'

function generateLayout(nodesData: SequenceNode[]): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

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
          background: '#FFFFFF',
          color: '#1A1A1A',
          border: '1px solid #D9D9D9',
          borderRadius: '8px',
          padding: '10px',
          width: 180,
          textAlign: 'center' as const,
          fontSize: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          fontWeight: 500,
        }
      })
      placed.add(nodeData.id)

      nodeData.leads_to.forEach(targetId => {
        edges.push({
          id: `e-${nodeData.id}-${targetId}`,
          source: nodeData.id,
          target: targetId,
          animated: true,
          style: { stroke: '#00A859', strokeWidth: 2 }
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
  const [nodes, , onNodesChange] = useNodesState(initialElements.nodes)
  const [edges, , onEdgesChange] = useEdgesState(initialElements.edges)

  return (
    <div className="bg-white border border-[#D9D9D9] rounded-[14px] overflow-hidden bcc-shadow flex flex-col h-[600px]">
      <div className="p-4 border-b border-[#D9D9D9] bg-[#F5F5F5] flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Визуализация графа</h2>
        <div className="flex bg-white rounded-[8px] p-1 border border-[#D9D9D9]">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-[6px] text-sm font-semibold flex items-center transition-colors ${viewMode === 'list' ? 'bg-[#00A859] text-white' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'}`}
          >
            <LayoutList className="w-4 h-4 mr-2" strokeWidth={1.75} />
            Список
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 rounded-[6px] text-sm font-semibold flex items-center transition-colors ${viewMode === 'graph' ? 'bg-[#00A859] text-white' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'}`}
          >
            <GitMerge className="w-4 h-4 mr-2" strokeWidth={1.75} />
            Граф
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-[#F5F5F5]">
        {viewMode === 'graph' ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            colorMode="light"
          >
            <Background color="#D9D9D9" />
            <Controls />
            <MiniMap
              nodeColor="#00A859"
              maskColor="rgba(245, 245, 245, 0.7)"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9D9D9' }}
            />
          </ReactFlow>
        ) : (
          <div className="p-6 overflow-y-auto h-full space-y-4 bg-[#F5F5F5]">
            {sequenceNodes.map(node => (
              <div key={node.id} className="bg-white border border-[#D9D9D9] p-4 rounded-[8px] bcc-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-mono text-[#00A859] font-bold">{node.id}</h3>
                  <span className="text-xs bg-[#F5F5F5] border border-[#D9D9D9] px-2 py-1 rounded text-[#4A4A4A] font-medium">{node.type}</span>
                </div>
                <p className="text-sm text-[#1A1A1A] mb-3 font-medium">{node.title}</p>
                {node.leads_to.length > 0 && (
                  <div className="text-xs text-[#8C8C8C]">
                    <span className="text-[#4A4A4A] font-medium">Ведёт к: </span>
                    {node.leads_to.map(l => (
                      <span key={l} className="inline-block bg-[#E6F7EE] text-[#007A40] px-1.5 py-0.5 rounded mr-1 mb-1 font-medium border border-[#00A859]/20">{l}</span>
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
