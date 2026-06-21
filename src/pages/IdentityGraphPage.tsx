import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  useNodesState, useEdgesState, Handle, Position, useReactFlow
} from '@xyflow/react'
import type { Node, Edge, NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Network, Shield, Key, Server, Box, ZoomIn, ZoomOut, Maximize2, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEmployees, getIdentityRelationships, getPermissions, getApiTokens, getGroupMemberships, getPlatformAccounts } from '@/services/dbService'
import { useAppStore } from '@/store/appStore'
import { riskScoreFromLevel } from '@/types/db'

const NODE_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  employee: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', icon: '👤' },
  zombie: { bg: '#FFF1F2', border: '#DD3259', text: '#9F1239', icon: '⚠️' },
  group: { bg: '#F0FDF4', border: '#22C55E', text: '#166534', icon: '👥' },
  role: { bg: '#FFF7ED', border: '#F97316', text: '#9A3412', icon: '🎭' },
  resource: { bg: '#F5F3FF', border: '#8B5CF6', text: '#5B21B6', icon: '🗄️' },
  service: { bg: '#ECFDF5', border: '#10B981', text: '#065F46', icon: '⚙️' },
  token: { bg: '#FEFCE8', border: '#EAB308', text: '#854D0E', icon: '🔑' },
  account: { bg: '#F0F9FF', border: '#0EA5E9', text: '#0369A1', icon: '🔗' },
}

const CLUSTER_CONFIG = {
  employee: { angle: 0, radiusMultiplier: 1, label: 'Employees' },
  zombie: { angle: 0, radiusMultiplier: 1, label: 'Zombie Accounts' },
  group: { angle: Math.PI * 0.25, radiusMultiplier: 1.8, label: 'Groups' },
  role: { angle: Math.PI * 0.5, radiusMultiplier: 2.2, label: 'Roles' },
  resource: { angle: Math.PI * 0.75, radiusMultiplier: 2.6, label: 'Resources' },
  service: { angle: Math.PI, radiusMultiplier: 2.0, label: 'Service Accounts' },
  token: { angle: Math.PI * 1.25, radiusMultiplier: 2.4, label: 'API Tokens' },
  account: { angle: Math.PI * 1.5, radiusMultiplier: 2.8, label: 'Platform Accounts' },
}

function CustomNode({ data }: { data: {
  label: string
  type: string
  employeeId?: string
  department?: string
  riskScore?: number
  platform?: string
  critical?: boolean
  orphaned?: boolean
  expanded?: boolean
  hasChildren?: boolean
  cluster?: string
} }) {
  const style = NODE_STYLES[data.type] || NODE_STYLES.employee
  const isCritical = data.critical || data.orphaned || (data.riskScore !== undefined && data.riskScore >= 70)

  return (
    <div
      className="rounded-xl px-4 py-3 min-w-[180px] max-w-[240px] select-none shadow-lg"
      style={{
        background: style.bg,
        border: `2px solid ${isCritical && data.type === 'zombie' ? '#DD3259' : style.border}`,
        boxShadow: isCritical ? `0 0 0 3px ${style.border}30, 0 4px 12px rgba(0,0,0,0.1)` : '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: style.border, width: 8, height: 8 }} />
      <div className="flex items-center gap-2">
        <span className="text-xl">{style.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight truncate" style={{ color: style.text }}>{data.label}</p>
          {data.platform && <p className="text-xs text-muted-foreground truncate mt-0.5">{data.platform}</p>}
          {data.department && <p className="text-xs text-muted-foreground truncate mt-0.5">{data.department}</p>}
          {data.riskScore !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${data.riskScore}%`,
                    background: data.riskScore >= 70 ? '#DD3259' : data.riskScore >= 40 ? '#F97316' : '#22C55E'
                  }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: data.riskScore >= 70 ? '#DD3259' : '#166534' }}>
                {data.riskScore}
              </span>
            </div>
          )}
        </div>
        {data.hasChildren && (
          <div className="ml-1">
            {data.expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: style.border, width: 8, height: 8 }} />
    </div>
  )
}

const nodeTypes: NodeTypes = { custom: CustomNode }

const TYPE_FILTERS = [
  { value: 'all', label: 'All Types', icon: Network },
  { value: 'employee', label: 'Employees', icon: Users },
  { value: 'group', label: 'Groups', icon: Users },
  { value: 'role', label: 'Roles', icon: Shield },
  { value: 'resource', label: 'Resources', icon: Box },
  { value: 'service', label: 'Services', icon: Server },
  { value: 'token', label: 'Tokens', icon: Key },
]

interface SelectedNodeDetail {
  label: string
  type: string
  employeeId?: string
  department?: string
  riskScore?: number
  platform?: string
}

function GraphInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<SelectedNodeDetail | null>(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [loadedNodes, setLoadedNodes] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState({ totalNodes: 0, totalEdges: 0, loadedNodes: 0 })
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAppStore()
  const highlightId = searchParams.get('id')
  const reactFlowInstance = useReactFlow()
  const initialFitDone = useRef(false)

  useEffect(() => {
    async function loadInitialGraph() {
      try {
        const [employees, relationships] = await Promise.all([
          getEmployees({ limit: 100 }),
          getIdentityRelationships(500), // LIMIT: only 500 relationships initially
        ])

        const allNodes: Node[] = []
        const allEdges: Edge[] = []
        const nodeMap = new Map<string, { type: string; data: any }>()

        const highRiskEmployees = employees
          .filter(e => e.risk_level === 'critical' || e.risk_level === 'high' || e.employment_status === 'terminated')
          .slice(0, 50)
        const normalEmployees = employees
          .filter(e => e.risk_level !== 'critical' && e.risk_level !== 'high' && e.employment_status !== 'terminated')
          .slice(0, 50)

        const displayedEmployees = [...highRiskEmployees, ...normalEmployees].slice(0, 100)
        const displayedIds = new Set(displayedEmployees.map(e => e.employee_id))

        const relevantRelationships = relationships.filter(r =>
          displayedIds.has(r.source_id) || displayedIds.has(r.target_id)
        )

        const centerX = 600
        const centerY = 400
        const baseRadius = 350

        displayedEmployees.forEach((emp, i) => {
          const type: 'employee' | 'zombie' = emp.employment_status === 'terminated' ? 'zombie' : 'employee'
          const spreadAngle = (Math.PI * 2 * i) / displayedEmployees.length
          const radius = baseRadius * (0.4 + Math.random() * 0.3)

          allNodes.push({
            id: emp.employee_id,
            type: 'custom',
            position: {
              x: centerX + Math.cos(spreadAngle) * radius + (Math.random() - 0.5) * 60,
              y: centerY + Math.sin(spreadAngle) * radius + (Math.random() - 0.5) * 60
            },
            data: {
              label: emp.full_name,
              type,
              employeeId: emp.employee_id,
              department: emp.department,
              riskScore: riskScoreFromLevel(emp.risk_level),
              critical: emp.employment_status === 'terminated' || emp.risk_level === 'critical',
              hasChildren: relevantRelationships.some(r => r.source_id === emp.employee_id || r.target_id === emp.employee_id),
              expanded: false,
            },
          })
          nodeMap.set(emp.employee_id, { type, data: { employee: emp } })
        })

        const groupNodes = new Set<string>()
        const roleNodes = new Set<string>()
        const resourceNodes = new Set<string>()

        relevantRelationships.slice(0, 150).forEach((rel, idx) => {
          const edgeId = `edge-${idx}`
          const isRisky = rel.relationship_type === 'assume_role' || rel.relationship_type === 'delegated_access'

          if (!displayedIds.has(rel.source_id) && !groupNodes.has(rel.source_id) && !roleNodes.has(rel.source_id) && !resourceNodes.has(rel.source_id)) {
            let nodeType: 'resource' | 'group' | 'role' = 'resource'
            if (rel.relationship_type === 'member_of') {
              nodeType = 'group'
              groupNodes.add(rel.source_id)
            } else if (rel.relationship_type === 'inherits') {
              nodeType = 'role'
              roleNodes.add(rel.source_id)
            }

            const config = CLUSTER_CONFIG[nodeType]
            const angle = config.angle + (Math.random() - 0.5) * 0.5
            const radius = baseRadius * config.radiusMultiplier + Math.random() * 50

            allNodes.push({
              id: rel.source_id,
              type: 'custom',
              position: {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
              },
              data: {
                label: rel.source_id.length > 12 ? rel.source_id.substring(0, 12) + '...' : rel.source_id,
                type: nodeType,
                platform: rel.platform,
                expanded: false,
              },
            })
            nodeMap.set(rel.source_id, { type: nodeType, data: {} })
          }

          if (!displayedIds.has(rel.target_id) && !groupNodes.has(rel.target_id) && !roleNodes.has(rel.target_id)) {
            let nodeType: 'role' | 'group' = 'role'
            if (rel.relationship_type === 'member_of') {
              nodeType = 'group'
              groupNodes.add(rel.target_id)
            }

            const config = CLUSTER_CONFIG[nodeType]
            const angle = config.angle + Math.PI * 0.1 + (Math.random() - 0.5) * 0.5
            const radius = baseRadius * config.radiusMultiplier + Math.random() * 50

            allNodes.push({
              id: rel.target_id,
              type: 'custom',
              position: {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
              },
              data: {
                label: rel.target_id.length > 12 ? rel.target_id.substring(0, 12) + '...' : rel.target_id,
                type: nodeType,
                platform: rel.platform,
                expanded: false,
              },
            })
            nodeMap.set(rel.target_id, { type: nodeType, data: {} })
          }

          allEdges.push({
            id: edgeId,
            source: rel.source_id,
            target: rel.target_id,
            label: rel.relationship_type.replace(/_/g, ' '),
            animated: isRisky,
            style: {
              stroke: isRisky ? '#DD3259' : '#94A3B8',
              strokeWidth: isRisky ? 2.5 : 1.5,
            },
            labelStyle: { fill: '#475569', fontSize: 10, fontWeight: 500 },
            labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
            labelBgPadding: [4, 2] as [number, number],
            type: 'smoothstep',
          })
        })

        setNodes(allNodes)
        setEdges(allEdges)
        setLoadedNodes(new Set(allNodes.map(n => n.id)))
        setStats({
          totalNodes: employees.length + relationships.length,
          totalEdges: relationships.length,
          loadedNodes: allNodes.length
        })

        if (highlightId) {
          const match = allNodes.find(n => (n.data as any).employeeId === highlightId)
          if (match) setSelectedNode(match.data as unknown as SelectedNodeDetail)
        }
      } catch (err) {
        console.error('Graph load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadInitialGraph()
  }, [highlightId])

  useEffect(() => {
    if (!loading && nodes.length > 0 && !initialFitDone.current && reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.3, duration: 400 })
        initialFitDone.current = true
      }, 100)
    }
  }, [loading, nodes.length, reactFlowInstance])

  const filteredNodes = useMemo(() => {
    return nodes.map(n => {
      const nodeType = (n.data as { type: string }).type
      const isExpanded = expandedNodes.has(n.id)
      return {
        ...n,
        hidden: typeFilter !== 'all' && nodeType !== typeFilter,
        data: {
          ...n.data,
          expanded: isExpanded,
        }
      }
    })
  }, [nodes, typeFilter, expandedNodes])

  const riskyEdges = useMemo(() => edges.filter(e => e.animated), [edges])

  const handleNodeClick = useCallback(async (_: React.MouseEvent, node: Node) => {
    const nodeData = node.data as any
    setSelectedNode(nodeData as SelectedNodeDetail)

    if (nodeData.employeeId && !expandedNodes.has(node.id)) {
      setExpandedNodes(prev => new Set(prev).add(node.id))

      try {
        const [permissions, tokens, accounts, memberships] = await Promise.all([
          getPermissions({ employeeId: nodeData.employeeId, limit: 20 }),
          getApiTokens(),
          getPlatformAccounts(),
          getGroupMemberships(),
        ])

        const empPermissions = permissions.filter((p: any) => p.employee_id === nodeData.employeeId)
        const empTokens = tokens.filter((t: any) => t.employee_id === nodeData.employeeId)
        const empAccounts = accounts.filter((a: any) => a.employee_id === nodeData.employeeId)
        const empMemberships = memberships.filter((m: any) => m.employee_id === nodeData.employeeId)

        const newNodes: Node[] = []
        const newEdges: Edge[] = []
        const baseX = node.position.x
        const baseY = node.position.y
        const offsetX = 250
        const offsetY = 180

        empAccounts.slice(0, 5).forEach((acc: any, i: number) => {
          if (loadedNodes.has(acc.account_id)) return
          newNodes.push({
            id: acc.account_id,
            type: 'custom',
            position: { x: baseX + offsetX + (i * 80), y: baseY - offsetY },
            data: {
              label: acc.username || acc.account_id,
              type: 'account',
              platform: acc.platform,
              critical: acc.account_status === 'active' && nodeData.type === 'zombie',
            },
          })
          newEdges.push({
            id: `acc-${acc.account_id}`,
            source: node.id,
            target: acc.account_id,
            label: 'owns',
            style: { stroke: '#94A3B8', strokeWidth: 1.5 },
            type: 'smoothstep',
          })
        })

        empTokens.slice(0, 5).forEach((tok: any, i: number) => {
          if (loadedNodes.has(tok.token_id)) return
          newNodes.push({
            id: tok.token_id,
            type: 'custom',
            position: { x: baseX - offsetX - (i * 80), y: baseY - offsetY },
            data: {
              label: tok.token_name?.substring(0, 15) || tok.token_id.substring(0, 10),
              type: 'token',
              platform: tok.platform,
              critical: !tok.rotated && tok.active,
            },
          })
          newEdges.push({
            id: `tok-${tok.token_id}`,
            source: node.id,
            target: tok.token_id,
            label: 'owns_token',
            animated: tok.active && !tok.rotated,
            style: { stroke: tok.active && !tok.rotated ? '#EAB308' : '#94A3B8', strokeWidth: tok.active ? 2 : 1.5 },
            type: 'smoothstep',
          })
        })

        empMemberships.slice(0, 5).forEach((mem: any, i: number) => {
          if (loadedNodes.has(mem.group_id)) return
          newNodes.push({
            id: mem.group_id,
            type: 'custom',
            position: { x: baseX + offsetX + (i * 80), y: baseY + offsetY },
            data: {
              label: mem.group_name?.substring(0, 15) || mem.group_id,
              type: 'group',
              platform: mem.platform,
            },
          })
          newEdges.push({
            id: `mem-${mem.group_id}`,
            source: node.id,
            target: mem.group_id,
            label: mem.membership_type || 'member_of',
            style: { stroke: '#22C55E', strokeWidth: 1.5 },
            type: 'smoothstep',
          })
        })

        empPermissions.filter((p: any) => p.is_admin).slice(0, 5).forEach((perm: any, i: number) => {
          if (loadedNodes.has(perm.permission_id)) return
          newNodes.push({
            id: perm.permission_id,
            type: 'custom',
            position: { x: baseX - offsetX - (i * 80), y: baseY + offsetY },
            data: {
              label: perm.resource_name?.substring(0, 12) || perm.permission_id.substring(0, 8),
              type: 'role',
              platform: perm.platform,
              critical: perm.permission_level === 'SuperAdmin' || perm.permission_level === 'Admin',
            },
          })
          newEdges.push({
            id: `perm-${perm.permission_id}`,
            source: node.id,
            target: perm.permission_id,
            label: perm.permission_level,
            animated: true,
            style: { stroke: '#DD3259', strokeWidth: 2.5 },
            type: 'smoothstep',
          })
        })

        if (newNodes.length > 0) {
          setNodes(prev => [...prev, ...newNodes])
          setEdges(prev => [...prev, ...newEdges])
          setLoadedNodes(prev => {
            const next = new Set(prev)
            newNodes.forEach(n => next.add(n.id))
            return next
          })
          setStats(prev => ({
            ...prev,
            loadedNodes: prev.loadedNodes + newNodes.length
          }))
        }
      } catch (err) {
        console.error('Expand node error:', err)
      }
    }
  }, [expandedNodes, loadedNodes, setNodes, setEdges])

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut({ duration: 300 })
  }, [reactFlowInstance])

  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn({ duration: 300 })
  }, [reactFlowInstance])

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.3, duration: 400 })
  }, [reactFlowInstance])

  return (
    <AppShell>
      <div className="max-w-full">
        <PageHeader
          label="Identity Graph"
          title="Enterprise Identity Relationships"
          description="Click any employee node to expand its attack path tree. Nodes cluster by type."
          actions={
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-red-700">{riskyEdges.length} Risky Edges</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-xs font-medium text-blue-700">{stats.loadedNodes} nodes loaded</span>
              </div>
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {TYPE_FILTERS.map(f => {
            const Icon = f.icon
            return (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  typeFilter === f.value
                    ? 'border-primary text-primary bg-blue-50'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground bg-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            )
          })}
          <div className="flex items-center gap-1 ml-auto">
            <Button size="sm" variant="outline" onClick={handleZoomOut} className="h-7 px-2">
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomIn} className="h-7 px-2">
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleFitView} className="h-7 px-2">
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-white" style={{ height: 580 }}>
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Network className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p>Loading identity graph...</p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={filteredNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.15}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
              nodesDraggable
              panOnDrag
              zoomOnScroll
            >
              <Background color="#E2E8F0" gap={32} size={1.5} />
              <Controls showZoom={false} showFitView={false} />
              <MiniMap
                nodeStrokeWidth={2}
                zoomable
                pannable
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
              />
            </ReactFlow>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="bg-white border border-border rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Cluster Legend</p>
            <div className="space-y-2">
              {Object.entries(CLUSTER_CONFIG).filter(([k]) => k !== 'zombie').map(([type, config]) => {
                const style = NODE_STYLES[type]
                if (!style) return null
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center" style={{ background: style.bg, border: `2px solid ${style.border}` }}>
                      <span className="text-xs">{style.icon}</span>
                    </div>
                    <span className="text-xs text-foreground capitalize">{config.label}</span>
                  </div>
                )
              })}
              <div className="pt-2 border-t border-border space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded" style={{ background: '#DD3259' }} />
                  <span className="text-xs text-muted-foreground">Privilege / Attack Path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded" style={{ background: '#22C55E' }} />
                  <span className="text-xs text-muted-foreground">Group Membership</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded" style={{ background: '#EAB308' }} />
                  <span className="text-xs text-muted-foreground">API Token</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence>
              {selectedNode ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="bg-white border border-border rounded-xl p-4 h-full"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Node Details</p>
                      <h3 className="text-lg font-bold text-foreground mt-0.5">{selectedNode.label}</h3>
                    </div>
                    <Badge variant="outline" className="capitalize">{selectedNode.type}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedNode.employeeId && (
                      <div>
                        <p className="text-xs text-muted-foreground">Employee ID</p>
                        <p className="text-sm font-medium font-mono">{selectedNode.employeeId}</p>
                      </div>
                    )}
                    {selectedNode.department && (
                      <div>
                        <p className="text-xs text-muted-foreground">Department</p>
                        <p className="text-sm font-medium">{selectedNode.department}</p>
                      </div>
                    )}
                    {selectedNode.platform && (
                      <div>
                        <p className="text-xs text-muted-foreground">Platform</p>
                        <p className="text-sm font-medium">{selectedNode.platform}</p>
                      </div>
                    )}
                    {selectedNode.riskScore !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground">Risk Score</p>
                        <p className="text-sm font-bold" style={{ color: selectedNode.riskScore >= 70 ? '#DD3259' : '#2E7D32' }}>
                          {selectedNode.riskScore} / 100
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      if (selectedNode?.employeeId) navigate(`/privilege-analysis?emp=${selectedNode.employeeId}`)
                    }}>View Profile</Button>
                    {user?.role !== 'auditor' && (
                      <Button size="sm" variant="outline" onClick={() => {
                        if (selectedNode?.employeeId) navigate(`/attack-simulator?emp=${selectedNode.employeeId}`)
                      }}>Trace Attack Path</Button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-muted/30 border border-dashed border-border rounded-xl p-8 flex items-center justify-center h-full"
                >
                  <div className="text-center">
                    <Network className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click any node to view details & expand tree</p>
                    <p className="text-xs text-muted-foreground mt-1">Zoom with controls or scroll wheel</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export function IdentityGraphPage() {
  return (
    <ReactFlowProvider>
      <GraphInner />
    </ReactFlowProvider>
  )
}
