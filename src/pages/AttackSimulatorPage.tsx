import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ReactFlow, Background, Controls,
  useNodesState, useEdgesState, Handle, Position,
  MarkerType
} from '@xyflow/react'
import type { Node, Edge, NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { simulateAttackPath } from '@/engines/detectionEngine'
import type { AttackPath } from '@/types/db'
import { SeverityBadge } from '@/components/common/SeverityBadge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Swords, AlertTriangle, ChevronRight, Target, Database } from 'lucide-react'
import { getEmployees } from '@/services/dbService'
import type { Employee } from '@/services/dbService'

function AttackNode({ data }: { data: { label: string; step: number; isSource: boolean; isTarget: boolean } }) {
  const bg = data.isSource ? '#FFF1F2' : data.isTarget ? '#000234' : '#FFF7ED'
  const border = data.isSource ? '#DD3259' : data.isTarget ? '#000234' : '#F97316'
  const textColor = data.isTarget ? '#fff' : '#1A1C1C'

  return (
    <div
      className="rounded-xl px-4 py-2.5 min-w-[160px] text-center shadow-sm"
      style={{ background: bg, border: `2px solid ${border}` }}
    >
      <Handle type="target" position={Position.Left} style={{ background: border }} />
      <div className="flex items-center gap-2 justify-center">
        {data.isSource && <Swords className="w-3.5 h-3.5" style={{ color: '#DD3259' }} />}
        {data.isTarget && <Database className="w-3.5 h-3.5 text-white" />}
        <span className="text-xs font-semibold" style={{ color: textColor }}>{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: border }} />
    </div>
  )
}

const attackNodeTypes: NodeTypes = { attack: AttackNode }

export function AttackSimulatorPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [simResult, setSimResult] = useState<AttackPath | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    async function load() {
      try {
        const emps = await getEmployees({ limit: 1000 })
        setEmployees(emps)
        // Pre-select from ?emp= query param (from Identity Graph "Trace Attack Path")
        const preselect = searchParams.get('emp')
        if (preselect && emps.some(e => e.employee_id === preselect)) {
          setSelectedEmployee(preselect)
        }
      } catch {
        // show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSimulate() {
    if (!selectedEmployee) return
    setIsSimulating(true)
    try {
    const result = await simulateAttackPath(selectedEmployee)
    if (!result) {
      alert('No attack path found for this employee. Try a different identity.')
      setIsSimulating(false)
      return
    }

    // Build flow nodes from path
    const pathNodes: Node[] = result.path.map((label, i) => ({
      id: `step-${i}`,
      type: 'attack',
      position: { x: i * 220, y: 80 },
      data: {
        label: label.length > 30 ? label.slice(0, 28) + '…' : label,
        step: i,
        isSource: i === 0,
        isTarget: i === result.path.length - 1,
      }
    }))

    const pathEdges: Edge[] = result.path.slice(0, -1).map((_, i) => ({
      id: `edge-${i}`,
      source: `step-${i}`,
      target: `step-${i + 1}`,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#DD3259', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#DD3259' },
    }))

    setNodes(pathNodes)
    setEdges(pathEdges)
    setSimResult(result)
    } catch {
      alert('Attack simulation failed. Check Supabase connection.')
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          label="Attack Path Simulator"
          title="Privilege Escalation Path Simulator"
          description="Simulate identity compromise and trace full privilege escalation paths across all enterprise platforms"
          actions={
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">Authorized Simulation Only</span>
            </div>
          }
        />

        {/* Simulation Controls */}
        <div className="bg-white border border-border rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-4">Configure Attack Path Simulation</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-60">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">
                Select Identity to Simulate
              </label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={loading ? 'Loading...' : 'Select an employee...'} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.employee_id} value={emp.employee_id}>
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{emp.employee_id}</span>
                      {emp.full_name} — {emp.department}
                      {emp.employment_status === 'terminated' && ' ⚠ TERMINATED'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSimulate}
              disabled={!selectedEmployee || isSimulating}
              className="h-10 gap-2"
              style={{ background: 'oklch(0.52 0.21 11)', color: 'white' }}
            >
              {isSimulating ? (
                <><span className="animate-pulse">●</span> Simulating...</>
              ) : (
                <><Swords className="w-4 h-4" />Simulate Path</>
              )}
            </Button>
          </div>

          {/* Quick select buttons */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">High-risk identities:</p>
            <div className="flex flex-wrap gap-2">
              {employees
                .filter(e => e.risk_level === 'critical' || e.risk_level === 'high')
                .slice(0, 8)
                .map(emp => (
                  <button
                    key={emp.employee_id}
                    onClick={() => setSelectedEmployee(emp.employee_id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      selectedEmployee === emp.employee_id
                        ? 'border-primary text-primary bg-red-50'
                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                    }`}
                  >
                    {emp.employee_id} · {emp.risk_level}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Simulation Result */}
        <AnimatePresence>
          {simResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Risk Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Compromise Risk Score</p>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold" style={{ color: simResult.risk >= 80 ? '#DD3259' : '#000234' }}>
                      {simResult.risk}
                    </span>
                    <span className="text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <div className="bg-white border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Severity</p>
                  <div className="mt-1.5">
                    <SeverityBadge severity={simResult.severity} />
                  </div>
                </div>
                <div className="bg-white border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Compromise Steps</p>
                  <p className="text-4xl font-bold text-foreground">{simResult.compromiseSteps}</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">Compromise Analysis</p>
                    <p className="text-sm text-red-700">{simResult.description}</p>
                  </div>
                </div>
              </div>

              {/* Attack Path Graph */}
              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Privilege Escalation Path</h3>
                  <span className="ml-auto text-xs text-muted-foreground">{simResult.path.length} nodes · Drag to rearrange</span>
                </div>
                <div style={{ height: 220 }}>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={attackNodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    panOnScroll zoomOnScroll
                  >
                    <Background color="oklch(0.96 0 0)" gap={20} size={1} />
                    <Controls />
                  </ReactFlow>
                </div>
              </div>

              {/* Step-by-step path */}
              <div className="bg-white border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">Step-by-Step Escalation Path</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {simResult.path.map((node, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        i === 0 ? 'bg-red-50 text-red-800 border border-red-200' :
                        i === simResult.path.length - 1 ? 'bg-[#000234] text-white' :
                        'bg-orange-50 text-orange-800 border border-orange-200'
                      }`}>
                        <span className="text-[10px] opacity-60 mr-1">Step {i + 1}</span>
                        {node}
                      </div>
                      {i < simResult.path.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reachable Assets */}
              {simResult.reachableAssets.length > 0 && (
                <div className="bg-white border border-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-3">Critical Reachable Assets</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {simResult.reachableAssets.map(asset => (
                      <div key={asset} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                        <Database className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-red-800">{asset}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!simResult && !isSimulating && (
          <div className="bg-muted/20 border border-dashed border-border rounded-xl p-12 text-center">
            <Swords className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Select an identity and click Simulate Path</p>
            <p className="text-xs text-muted-foreground mt-1">The engine will trace all privilege escalation paths reachable from that identity</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
