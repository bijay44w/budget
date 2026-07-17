"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Play, Pause, RotateCcw, Search, Bell, Plus, Trash2, Check, CheckCircle2, 
  Clock, Sparkles, TrendingUp, User, Calendar, List, PieChart, Activity, 
  ChevronRight, PlusCircle, X, Flame, Smile, Compass, BookOpen, Zap, 
  Settings, AlertCircle, Coffee, Brain, Moon, Sun, ArrowRight, Save
} from "lucide-react";

// --- TYPES ---
export interface FlowNodeItem {
  id: string;
  title: string;
  icon: string;
  time: string;
  duration: string; // e.g. "2h", "45m"
  priority: "high" | "medium" | "low";
  energy: "high" | "medium" | "low";
  category: "work" | "personal" | "health" | "routine" | "other";
  status: "pending" | "completed" | "missed";
  x: number;
  y: number;
  parentId: string | null;
}

interface FlowNodeProps {
  isDark: boolean;
}

const CATEGORY_COLORS = {
  work: { bg: "bg-purple-500/10 text-purple-500 border-purple-500/20", dot: "bg-purple-500" },
  personal: { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", dot: "bg-blue-500" },
  health: { bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", dot: "bg-emerald-500" },
  routine: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500" },
  other: { bg: "bg-slate-500/10 text-slate-500 border-slate-500/20", dot: "bg-slate-500" },
};

const DEFAULT_NODES: FlowNodeItem[] = [
  { id: "1", title: "Wake Up", icon: "🌅", time: "07:00", duration: "30m", priority: "low", energy: "low", category: "routine", status: "completed", x: 100, y: 300, parentId: null },
  { id: "2", title: "Breakfast", icon: "🍳", time: "07:30", duration: "30m", priority: "low", energy: "low", category: "routine", status: "completed", x: 280, y: 300, parentId: "1" },
  { id: "3", title: "Deep Work", icon: "🧠", time: "09:00", duration: "2h", priority: "high", energy: "high", category: "work", status: "completed", x: 480, y: 300, parentId: "2" },
  { id: "3a", title: "Coding", icon: "💻", time: "09:00", duration: "1h", priority: "high", energy: "high", category: "work", status: "completed", x: 680, y: 180, parentId: "3" },
  { id: "3b", title: "AWS Deploy", icon: "☁️", time: "10:00", duration: "30m", priority: "high", energy: "high", category: "work", status: "completed", x: 680, y: 300, parentId: "3" },
  { id: "3c", title: "Emails", icon: "📧", time: "10:30", duration: "30m", priority: "medium", energy: "low", category: "work", status: "completed", x: 680, y: 420, parentId: "3" },
  { id: "4", title: "Lunch Break", icon: "🥗", time: "12:00", duration: "1h", priority: "low", energy: "low", category: "routine", status: "completed", x: 880, y: 300, parentId: "3" },
  { id: "5", title: "Gym Session", icon: "💪", time: "15:00", duration: "1.5h", priority: "medium", energy: "high", category: "health", status: "pending", x: 1080, y: 300, parentId: "4" },
  { id: "6", title: "Dinner", icon: "🍽️", time: "18:30", duration: "1h", priority: "low", energy: "low", category: "routine", status: "pending", x: 1280, y: 300, parentId: "5" },
  { id: "7", title: "Read Book", icon: "📚", time: "20:00", duration: "1h", priority: "medium", energy: "low", category: "personal", status: "pending", x: 1480, y: 300, parentId: "6" },
  { id: "8", title: "Sleep", icon: "😴", time: "22:00", duration: "8h", priority: "high", energy: "low", category: "routine", status: "pending", x: 1680, y: 300, parentId: "7" }
];

export default function FlowNode({ isDark }: FlowNodeProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [nodes, setNodes] = useState<FlowNodeItem[]>([]);
  const [activeSubView, setActiveSubView] = useState<"dashboard" | "today" | "planner" | "timeline" | "calendar" | "goals" | "habits" | "notes" | "journal" | "analytics" | "templates" | "settings">("today");
  const [viewMode, setViewMode] = useState<"node" | "timeline" | "calendar" | "flow">("node");
  
  // Canvas Navigation
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<"select" | "pan">("select");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Interaction State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ id: string; sx: number; sy: number; nx: number; ny: number } | null>(null);
  const [panDrag, setPanDrag] = useState<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const [connectFromId, setConnectFromId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Creation State
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeForm, setNewNodeForm] = useState({
    title: "",
    icon: "🎯",
    time: "09:00",
    duration: "1h",
    priority: "medium" as "high" | "medium" | "low",
    energy: "medium" as "high" | "medium" | "low",
    category: "work" as FlowNodeItem["category"],
    parentId: ""
  });

  // Focus Timer State
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerType, setTimerType] = useState<"focus" | "break">("focus");

  // Stats Log State
  const [distractions, setDistractions] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(80);
  const [mood, setMood] = useState<string>("😊");
  const [streak, setStreak] = useState(5);

  // AI Assistant Chat Box State
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLog, setChatLog] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Hi! I am your FlowNode assistant. I analyze your habits, focus patterns, and visual daily plan. How can I help you today?" }
  ]);

  // Evening Review Overlay
  const [showEveningReview, setShowEveningReview] = useState(false);
  const [eveningReviewStep, setEveningReviewStep] = useState<"intro" | "animation" | "results">("intro");
  const [isReviewAnimating, setIsReviewAnimating] = useState(false);

  // --- LOCAL STORAGE ---
  useEffect(() => {
    const saved = localStorage.getItem("budgettree_flownode_state");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.nodes) setNodes(data.nodes);
        if (data.distractions !== undefined) setDistractions(data.distractions);
        if (data.energyLevel !== undefined) setEnergyLevel(data.energyLevel);
        if (data.mood !== undefined) setMood(data.mood);
        if (data.streak !== undefined) setStreak(data.streak);
      } catch (e) {
        console.error("Failed to parse local FlowNode state", e);
        setNodes(DEFAULT_NODES);
      }
    } else {
      setNodes(DEFAULT_NODES);
    }
  }, []);

  const saveState = (updatedNodes: FlowNodeItem[], updatedDist = distractions, updatedEnergy = energyLevel, updatedMoodState = mood, updatedStreakState = streak) => {
    localStorage.setItem("budgettree_flownode_state", JSON.stringify({
      nodes: updatedNodes,
      distractions: updatedDist,
      energyLevel: updatedEnergy,
      mood: updatedMoodState,
      streak: updatedStreakState
    }));
  };

  // --- FOCUS TIMER ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      alert(timerType === "focus" ? "Great job! Time for a short break." : "Break is over! Ready to focus?");
      setTimeLeft(timerType === "focus" ? 300 : 1500); // 5 min break or 25 min focus
      setTimerType(t => t === "focus" ? "break" : "focus");
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerRunning, timeLeft, timerType]);

  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(timerType === "focus" ? 1500 : 300);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // --- CANVAS HANDLERS ---
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (connectFromId) {
      setConnectFromId(null);
      return;
    }

    const isBg = (e.target as HTMLElement).classList.contains("canvas-bg") || 
                 (e.target as HTMLElement).tagName === "svg" || 
                 (e.target as HTMLElement).classList.contains("canvas-svg");
                 
    if (isBg || tool === "pan" || e.button === 1) {
      setPanDrag({
        sx: e.clientX,
        sy: e.clientY,
        px: pan.x,
        py: pan.y
      });
      setSelectedNodeId(null);
    }
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate canvas coordinates
    const mx = (e.clientX - rect.left - pan.x) / zoom;
    const my = (e.clientY - rect.top - pan.y) / zoom;
    setMousePos({ x: mx, y: my });

    if (panDrag) {
      setPan({
        x: panDrag.px + (e.clientX - panDrag.sx),
        y: panDrag.py + (e.clientY - panDrag.sy)
      });
    } else if (dragState) {
      const dx = (e.clientX - dragState.sx) / zoom;
      const dy = (e.clientY - dragState.sy) / zoom;
      
      const updated = nodes.map(n => {
        if (n.id === dragState.id) {
          // ponytail: snap to 10px grid for clean look
          return {
            ...n,
            x: Math.round((dragState.nx + dx) / 10) * 10,
            y: Math.round((dragState.ny + dy) / 10) * 10
          };
        }
        return n;
      });
      setNodes(updated);
    }
  }, [panDrag, dragState, pan.x, pan.y, zoom, nodes]);

  const handleCanvasMouseUp = useCallback(() => {
    if (dragState || panDrag) {
      saveState(nodes);
    }
    setPanDrag(null);
    setDragState(null);
  }, [dragState, panDrag, nodes]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * factor, 0.2), 2);
    
    // Zoom centered on cursor
    setPan(p => ({
      x: mx - (mx - p.x) * (newZoom / zoom),
      y: my - (my - p.y) * (newZoom / zoom)
    }));
    setZoom(newZoom);
  };

  // Node actions
  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tool === "pan") return;
    
    const nd = nodes.find(n => n.id === id);
    if (!nd) return;
    setSelectedNodeId(id);
    setDragState({
      id,
      sx: e.clientX,
      sy: e.clientY,
      nx: nd.x,
      ny: nd.y
    });
  };

  const handleNodeMouseUp = (e: React.MouseEvent, id: string) => {
    if (connectFromId && connectFromId !== id) {
      e.stopPropagation();
      // Establish connection: set connectFromId as parent of current node
      const updated = nodes.map(n => {
        if (n.id === id) {
          return { ...n, parentId: connectFromId };
        }
        return n;
      });
      setNodes(updated);
      saveState(updated);
      setConnectFromId(null);
    }
  };

  const startConnection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConnectFromId(id);
  };

  const toggleNodeStatus = (id: string) => {
    const updated = nodes.map(n => {
      if (n.id === id) {
        let nextStatus: FlowNodeItem["status"] = "pending";
        if (n.status === "pending") nextStatus = "completed";
        else if (n.status === "completed") nextStatus = "missed";
        return { ...n, status: nextStatus };
      }
      return n;
    });
    setNodes(updated);
    saveState(updated);
  };

  const deleteNode = (id: string) => {
    const updated = nodes.filter(n => n.id !== id).map(n => {
      if (n.parentId === id) return { ...n, parentId: null };
      return n;
    });
    setNodes(updated);
    saveState(updated);
    setSelectedNodeId(null);
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeForm.title.trim()) return;

    // Place node in center of current screen coordinates
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    const cx = rect ? (rect.width / 2 - pan.x) / zoom : 300;
    const cy = rect ? (rect.height / 2 - pan.y) / zoom : 300;

    const newNd: FlowNodeItem = {
      id: `node_${Date.now()}`,
      title: newNodeForm.title,
      icon: newNodeForm.icon,
      time: newNodeForm.time,
      duration: newNodeForm.duration,
      priority: newNodeForm.priority,
      energy: newNodeForm.energy,
      category: newNodeForm.category,
      status: "pending",
      x: cx + (Math.random() * 60 - 30),
      y: cy + (Math.random() * 60 - 30),
      parentId: newNodeForm.parentId || null
    };

    const updated = [...nodes, newNd];
    setNodes(updated);
    saveState(updated);
    setShowAddNodeModal(false);
    setNewNodeForm({
      title: "",
      icon: "🎯",
      time: "09:00",
      duration: "1h",
      priority: "medium",
      energy: "medium",
      category: "work",
      parentId: ""
    });
  };

  const createDefaultPlan = () => {
    setNodes(DEFAULT_NODES);
    saveState(DEFAULT_NODES);
  };

  // --- STATS CALCULATIONS ---
  const totalDurationMin = nodes.reduce((sum, n) => {
    const num = parseFloat(n.duration);
    const unit = n.duration.includes("h") ? 60 : 1;
    return sum + (isNaN(num) ? 0 : num * unit);
  }, 0);

  const completedCount = nodes.filter(n => n.status === "completed").length;
  const completionRate = nodes.length > 0 ? Math.round((completedCount / nodes.length) * 100) : 0;
  
  const deepWorkHours = nodes
    .filter(n => n.status === "completed" && n.energy === "high" && n.category === "work")
    .reduce((sum, n) => {
      const num = parseFloat(n.duration);
      const val = n.duration.includes("h") ? num : num / 60;
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

  // --- EVENING REVIEW PROCESS ---
  const triggerEveningReview = () => {
    setEveningReviewStep("intro");
    setShowEveningReview(true);
  };

  const startReviewAnimation = () => {
    setEveningReviewStep("animation");
    setIsReviewAnimating(true);
    
    // Simulate node graph updating and particles fading
    setTimeout(() => {
      // Mark pending items as missed/skipped or keep them
      setIsReviewAnimating(false);
      setEveningReviewStep("results");
    }, 3000);
  };

  // --- AI ASSISTANT CHAT ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage.trim();
    const updatedLog = [...chatLog, { sender: "user" as const, text: userMsg }];
    setChatLog(updatedLog);
    setChatMessage("");

    // Simulate response based on keywords
    setTimeout(() => {
      let reply = "I've analyzed your daily plan. You have a good distribution of high and low energy nodes today!";
      
      if (userMsg.toLowerCase().includes("work") || userMsg.toLowerCase().includes("coding")) {
        reply = "Looking at your schedule, your Deep Work session (9:00 AM) requires High Energy. Try to tackle it before lunch for optimal productivity.";
      } else if (userMsg.toLowerCase().includes("gym") || userMsg.toLowerCase().includes("health")) {
        reply = "You scheduled your Gym session for 3:00 PM. Taking a physical break after deep work helps recover focus!";
      } else if (userMsg.toLowerCase().includes("distraction") || userMsg.toLowerCase().includes("focus")) {
        reply = `You logged ${distractions} distractions today. Try setting a 25-minute Pomodoro timer for your next session to keep it low.`;
      } else if (userMsg.toLowerCase().includes("review") || userMsg.toLowerCase().includes("reflection")) {
        reply = "You can initiate the 'Evening Review' from the sidebar once you've finished today's flow. It compiles your metrics automatically!";
      }
      
      setChatLog(prev => [...prev, { sender: "ai", text: reply }]);
    }, 800);
  };

  // SVG connection drawer helper
  const getEdgePath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1);
    const cpOff = Math.max(dx * 0.4, 50);
    return `M ${x1} ${y1} C ${x1 + cpOff} ${y1}, ${x2 - cpOff} ${y2}, ${x2} ${y2}`;
  };

  // Filtered nodes
  const filteredNodes = nodes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${isDark ? "bg-[#0a0e12] text-slate-200" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Internal FlowNode Dashboard Sub-Layout */}
      <div className="flex flex-1 min-h-0 relative">
        
        {/* ================= MAIN CONTENT WINDOW ================= */}
        <main className="flex-1 flex flex-col min-w-0">
          
          <header className={`px-6 py-3 border-b flex items-center justify-between ${isDark ? "bg-[#0b0e14]/70 border-slate-800" : "bg-white/70 border-slate-200"}`}>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </header>

          {/* Canvas or Alternating Views */}
          <div className="flex-1 min-h-0 relative">
            
            {/* View 1: Infinite Node Canvas */}
            {viewMode === "node" && (
              <div 
                ref={canvasContainerRef}
                className="w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing canvas-bg select-none"
                style={{ background: isDark ? "radial-gradient(#1f2937 1px, transparent 1px)" : "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onWheel={handleWheel}
              >
                
                {/* Empty state placeholder removed as requested */}

                {/* SVG Connections Layer */}
                {nodes.length > 0 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none canvas-svg">
                    <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                      {nodes.map(n => {
                        if (!n.parentId) return null;
                        const parent = nodes.find(p => p.id === n.parentId);
                        if (!parent) return null;

                        const x1 = parent.x + 160; // Output point (approx right side)
                        const y1 = parent.y + 45;  // Center y
                        const x2 = n.x;            // Input point (left side)
                        const y2 = n.y + 45;       // Center y

                        const path = getEdgePath(x1, y1, x2, y2);

                        return (
                          <g key={`edge-${n.id}`}>
                            {/* Glow trail */}
                            <path 
                              d={path} 
                              stroke={n.status === "completed" ? "rgba(34,197,94,0.15)" : isDark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.6)"}
                              strokeWidth="4" 
                              fill="none" 
                            />
                            {/* Main path */}
                            <path 
                              d={path} 
                              stroke={n.status === "completed" ? "#22C55E" : isDark ? "#334155" : "#cbd5e1"} 
                              strokeWidth="2" 
                              fill="none" 
                            />
                            {/* Money-like flowing particle animation */}
                            <circle r="3" fill={n.status === "completed" ? "#22C55E" : "#3b82f6"}>
                              <animateMotion 
                                dur="2.5s" 
                                repeatCount="indefinite" 
                                path={path} 
                              />
                            </circle>
                          </g>
                        );
                      })}

                      {/* Connector Line from active dragging handle */}
                      {connectFromId && (() => {
                        const fromNode = nodes.find(n => n.id === connectFromId);
                        if (!fromNode) return null;
                        const x1 = fromNode.x + 160;
                        const y1 = fromNode.y + 45;
                        return (
                          <path 
                            d={getEdgePath(x1, y1, mousePos.x, mousePos.y)} 
                            stroke="#22C55E" 
                            strokeDasharray="4 4" 
                            strokeWidth="2" 
                            fill="none" 
                          />
                        );
                      })()}
                    </g>
                  </svg>
                )}

                {/* Nodes Container */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
                >
                  {filteredNodes.map(node => {
                    const isSelected = selectedNodeId === node.id;
                    const catColor = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.other;
                    
                    return (
                      <div
                        key={node.id}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
                        className={`absolute w-[170px] h-[60px] rounded-xl border flex items-center justify-between transition-all pointer-events-auto cursor-grab active:cursor-grabbing select-none group shadow-md hover:shadow-lg ${
                          node.status === "completed" 
                            ? "border-green-500/80 bg-green-500/[0.03]" 
                            : node.status === "missed"
                            ? "border-red-500/50 bg-red-500/[0.02] opacity-60"
                            : isSelected
                            ? "border-green-500 ring-2 ring-green-500/20"
                            : isDark ? "bg-[#0c1015] border-slate-800/80 hover:border-slate-700" : "bg-white border-slate-200/80 hover:border-slate-300"
                        }`}
                        style={{ 
                          left: `${node.x}px`, 
                          top: `${node.y}px`
                        }}
                      >
                        <div className="flex items-center gap-2.5 px-3 py-2 w-full h-full relative">
                          {/* Icon Badge */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${catColor.bg}`}>
                            <span className="text-base select-none">{node.icon}</span>
                          </div>

                          {/* Title & Time */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-[11px] font-bold truncate leading-snug">{node.title}</h4>
                            <span className="text-[9px] text-slate-400 font-medium">{node.time} • {node.duration}</span>
                          </div>

                          {/* Checkbox button */}
                          <button 
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => toggleNodeStatus(node.id)}
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors cursor-pointer border flex-shrink-0 ${
                              node.status === "completed" 
                                ? "bg-green-500 border-green-500 text-white" 
                                : node.status === "missed"
                                ? "bg-red-500 border-red-500 text-white"
                                : isDark ? "border-slate-700 hover:border-slate-500" : "border-slate-300 hover:border-slate-400"
                            }`}
                          >
                            {node.status === "completed" && <Check className="w-2.5 h-2.5" />}
                            {node.status === "missed" && <span className="text-[8px] font-bold">X</span>}
                          </button>

                          {/* Connection Drag Dot */}
                          <button
                            onMouseDown={(e) => startConnection(e, node.id)}
                            className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-700 border border-slate-500 hover:bg-green-500 hover:border-green-400 cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Drag to connect next node"
                          />
                        </div>

                        {/* Node controls panel */}
                        {isSelected && (
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-1 rounded-full shadow-xl pointer-events-auto">
                            <button 
                              onClick={() => deleteNode(node.id)}
                              className="p-1 hover:text-red-400 transition-colors text-slate-400"
                              title="Delete node"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <div className="w-[1px] h-3 bg-slate-800" />
                            <button 
                              onClick={() => {
                                const newTitle = prompt("Edit Title", node.title);
                                if (newTitle) {
                                  const updated = nodes.map(n => n.id === node.id ? { ...n, title: newTitle } : n);
                                  setNodes(updated);
                                  saveState(updated);
                                }
                              }}
                              className="px-2 py-0.5 hover:text-slate-100 text-[9px] font-bold text-slate-400"
                            >
                              Rename
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Floating toolbars */}
                <div className="absolute bottom-5 left-5 flex gap-2">
                  <div className={`p-1 rounded-xl border flex gap-1 ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"}`}>
                    <button 
                      onClick={() => setTool("select")}
                      className={`p-1.5 rounded-lg text-xs font-semibold ${tool === "select" ? "bg-green-500/10 text-green-500" : "text-slate-400"}`}
                      title="Select & Edit Mode"
                    >
                      Select
                    </button>
                    <button 
                      onClick={() => setTool("pan")}
                      className={`p-1.5 rounded-lg text-xs font-semibold ${tool === "pan" ? "bg-green-500/10 text-green-500" : "text-slate-400"}`}
                      title="Pan Mode"
                    >
                      Pan Canvas
                    </button>
                  </div>
                  
                  <div className={`p-1 rounded-xl border flex gap-1 ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"}`}>
                    <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))} className="p-1.5 text-slate-400 hover:text-slate-200">
                      -
                    </button>
                    <span className="px-1 text-slate-400 text-xs flex items-center font-mono">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button onClick={() => setZoom(z => Math.min(z + 0.1, 2.0))} className="p-1.5 text-slate-400 hover:text-slate-200">
                      +
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-5 right-5">
                  <button
                    onClick={() => setShowAddNodeModal(true)}
                    className="p-3 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg shadow-green-950/20 flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* View 2: Timeline View */}
            {viewMode === "timeline" && (
              <div className="w-full h-full p-6 overflow-y-auto space-y-6">
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-300">Timeline Scheduler</h3>
                    <span className="text-xs text-slate-400">{nodes.length} Scheduled Tasks</span>
                  </div>

                  <div className={`border rounded-2xl overflow-hidden ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className="divide-y divide-slate-800">
                      {nodes
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map(node => (
                          <div key={node.id} className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{node.icon}</span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-200">{node.title}</h4>
                                <span className="text-[10px] text-slate-400">{node.time} ({node.duration})</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full capitalize font-bold ${
                                node.priority === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-slate-800 text-slate-400"
                              }`}>
                                {node.priority} Priority
                              </span>
                              <span className={`text-[10px] font-bold ${
                                node.status === "completed" ? "text-green-500" : "text-slate-400"
                              }`}>
                                {node.status}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View 3: Calendar View */}
            {viewMode === "calendar" && (
              <div className="w-full h-full p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-300">Monthly Calendar Overview</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded bg-slate-800 text-xs">Prev</button>
                      <span className="text-xs font-bold">July 2026</span>
                      <button className="p-1 rounded bg-slate-800 text-xs">Next</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="text-center text-[10px] font-bold text-slate-500 py-1">{day}</div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => {
                      const dayNum = i + 1;
                      const isToday = dayNum === 17; // July 17
                      return (
                        <div 
                          key={i} 
                          className={`min-h-[75px] rounded-xl border p-2 flex flex-col justify-between transition-all ${
                            isToday 
                              ? "bg-green-500/5 border-green-500" 
                              : isDark ? "bg-slate-900/20 border-slate-800/80 hover:bg-slate-800/20" : "bg-white border-slate-200"
                          }`}
                        >
                          <span className={`text-[10px] font-bold ${isToday ? "text-green-500" : "text-slate-400"}`}>
                            {dayNum}
                          </span>
                          {isToday && (
                            <div className="text-[9px] bg-green-500/10 border border-green-500/20 text-green-500 rounded px-1 truncate font-bold">
                              {nodes.length} items planned
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* View 4: Flow Focus Mode */}
            {viewMode === "flow" && (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#090b0e]">
                {nodes.find(n => n.status === "pending") ? (() => {
                  const activeTask = nodes.find(n => n.status === "pending")!;
                  return (
                    <div className="max-w-md w-full p-8 rounded-3xl border border-slate-800 bg-[#0d1017] text-center space-y-6 shadow-2xl">
                      <div className="space-y-2">
                        <span className="text-[10px] tracking-widest text-green-500 font-bold uppercase">Current Focus Focus</span>
                        <div className="text-4xl">{activeTask.icon}</div>
                        <h2 className="text-xl font-bold text-slate-100">{activeTask.title}</h2>
                        <p className="text-xs text-slate-400">Time scheduled: {activeTask.time} ({activeTask.duration})</p>
                      </div>

                      {/* Focus Mode Timer Dashboard */}
                      <div className="py-6 rounded-2xl bg-slate-950/40 border border-slate-900 flex flex-col items-center justify-center space-y-3">
                        <span className="text-5xl font-mono font-bold tracking-tight text-slate-100">{formatTime(timeLeft)}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={toggleTimer}
                            className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                          >
                            {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            {timerRunning ? "Pause" : "Start Focus"}
                          </button>
                          <button 
                            onClick={resetTimer}
                            className="p-2 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-xl transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => toggleNodeStatus(activeTask.id)}
                          className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Complete Task
                        </button>
                        <button
                          onClick={() => {
                            const updated = nodes.map(n => n.id === activeTask.id ? { ...n, status: "missed" as const } : n);
                            setNodes(updated);
                            saveState(updated);
                          }}
                          className="px-4 py-2 border border-slate-800 text-slate-400 rounded-xl text-xs font-semibold transition-all hover:bg-slate-800/40"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center space-y-4 max-w-sm">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto text-green-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">All Tasks Completed!</h3>
                    <p className="text-xs text-slate-400">You don't have any pending focus nodes for today. Time for review!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Reflection footer removed as requested */}
        </main>


      </div>

      {/* ================= ADD NODE MODAL ================= */}
      {showAddNodeModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl border p-6 space-y-4 shadow-2xl transition-all ${
            isDark ? "bg-[#0c1015] border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold">Create Focus Node</h3>
              <button 
                onClick={() => setShowAddNodeModal(false)} 
                className={`p-1 rounded cursor-pointer ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Task Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Code Review"
                  value={newNodeForm.title}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, title: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border outline-none transition ${
                    isDark ? "bg-slate-900 border-slate-800 focus:border-green-500 text-white" : "bg-white border-slate-200 focus:border-green-500 text-slate-800"
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Icon Emoji</label>
                  <input 
                    type="text" 
                    value={newNodeForm.icon}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, icon: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none text-center transition ${
                      isDark ? "bg-slate-900 border-slate-800 focus:border-green-500 text-white" : "bg-white border-slate-200 focus:border-green-500 text-slate-800"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Time</label>
                  <input 
                    type="text" 
                    value={newNodeForm.time}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, time: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none text-center transition ${
                      isDark ? "bg-slate-900 border-slate-800 focus:border-green-500 text-white" : "bg-white border-slate-200 focus:border-green-500 text-slate-800"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Duration</label>
                  <input 
                    type="text" 
                    value={newNodeForm.duration}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, duration: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none text-center transition ${
                      isDark ? "bg-slate-900 border-slate-800 focus:border-green-500 text-white" : "bg-white border-slate-200 focus:border-green-500 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Category</label>
                  <select
                    value={newNodeForm.category}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, category: e.target.value as any })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none cursor-pointer transition ${
                      isDark ? "bg-slate-900 border-slate-800 focus:border-green-500 text-white" : "bg-white border-slate-200 focus:border-green-500 text-slate-800"
                    }`}
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="routine">Routine</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Energy Level</label>
                  <select
                    value={newNodeForm.energy}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, energy: e.target.value as any })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none cursor-pointer transition ${
                      isDark ? "bg-slate-900 border-slate-800 focus:border-green-500 text-white" : "bg-white border-slate-200 focus:border-green-500 text-slate-800"
                    }`}
                  >
                    <option value="high">High Energy</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low Energy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Parent Node Connection (Optional)</label>
                <select
                  value={newNodeForm.parentId}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, parentId: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border outline-none cursor-pointer transition ${
                    isDark ? "bg-slate-900 border-slate-800 focus:border-green-500 text-white" : "bg-white border-slate-200 focus:border-green-500 text-slate-800"
                  }`}
                >
                  <option value="">No connection (Start Node)</option>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.icon} {n.title} ({n.time})</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer"
              >
                Create Node
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= AI CHAT COMPONENT ================= */}
      {showAIChat && (
        <div className={`absolute bottom-16 right-6 w-[320px] rounded-2xl border shadow-2xl overflow-hidden flex flex-col z-50 ${isDark ? "bg-[#0c1015] border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-850"}`}>
          <header className="p-3 bg-green-600 flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              <span className="text-xs font-bold">FlowNode Brain</span>
            </div>
            <button onClick={() => setShowAIChat(false)} className="p-0.5 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Message log */}
          <div className="h-[240px] p-3 overflow-y-auto space-y-2.5 flex flex-col">
            {chatLog.map((log, idx) => (
              <div 
                key={idx} 
                className={`max-w-[85%] rounded-2xl p-2.5 text-[11px] leading-relaxed ${
                  log.sender === "ai" 
                    ? "bg-slate-900 border border-slate-850 text-slate-350 self-start" 
                    : "bg-green-600 text-white self-end font-medium"
                }`}
              >
                {log.text}
              </div>
            ))}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-850 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask anything..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-250 outline-none focus:border-green-500/50"
            />
            <button 
              type="submit" 
              className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-xl flex items-center justify-center cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ================= EVENING REVIEW OVERLAY ================= */}
      {showEveningReview && (
        <div className="absolute inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-6">
          <div className={`w-full max-w-lg rounded-3xl border p-8 space-y-6 text-center ${isDark ? "bg-[#0b0e14] border-slate-800" : "bg-white border-slate-200"}`}>
            
            {eveningReviewStep === "intro" && (
              <div className="space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center mx-auto text-green-500">
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-100">Ready to review your day?</h2>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    We will analyze your nodes, calculate your scores, and archive your reflection patterns.
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={startReviewAnimation}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
                  >
                    Start Evening Review
                  </button>
                  <button 
                    onClick={() => setShowEveningReview(false)}
                    className="px-4 py-2.5 border border-slate-850 text-slate-400 rounded-xl text-xs font-semibold hover:bg-slate-800/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {eveningReviewStep === "animation" && (
              <div className="space-y-6 py-6">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-spin border-t-green-500" />
                  <Sparkles className="w-8 h-8 text-green-500 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-300">Analyzing Your Living Graph...</h3>
                  <p className="text-[10px] text-slate-500">Completed nodes glowing green. Fading skipped paths.</p>
                </div>
              </div>
            )}

            {eveningReviewStep === "results" && (
              <div className="space-y-5 text-left">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-black text-slate-100">Daily Review Completed</h2>
                  <button 
                    onClick={() => setShowEveningReview(false)}
                    className="p-1 rounded bg-slate-900 border border-slate-800 hover:text-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3.5 rounded-2xl border border-slate-850 bg-slate-900/60 text-center">
                    <span className="text-slate-500 text-[9px] font-bold block uppercase">Focus Score</span>
                    <span className="text-xl font-black text-green-500 block mt-1">92</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-slate-850 bg-slate-900/60 text-center">
                    <span className="text-slate-500 text-[9px] font-bold block uppercase">Productivity</span>
                    <span className="text-xl font-black text-purple-400 block mt-1">{completionRate}%</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-slate-850 bg-slate-900/60 text-center">
                    <span className="text-slate-500 text-[9px] font-bold block uppercase">Distractions</span>
                    <span className="text-xl font-black text-red-400 block mt-1">{distractions}</span>
                  </div>
                </div>

                {/* Score details */}
                <div className="p-4 rounded-2xl border border-slate-850 bg-slate-900/30 space-y-3">
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-wide block">Today's Wins</span>
                  <div className="space-y-1.5">
                    {nodes.filter(n => n.status === "completed").slice(0, 3).map(n => (
                      <div key={n.id} className="flex items-center gap-2 text-xs text-slate-350">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span>Completed {n.title} ({n.time})</span>
                      </div>
                    ))}
                    {nodes.filter(n => n.status === "completed").length === 0 && (
                      <p className="text-xs text-slate-500">No tasks completed today.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Daily Journal Summary</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    You started the day at 7:00 AM. Focused for a total of 45 minutes on deep work, logged {distractions} distraction events, and finished with an average energy level of {energyLevel}%. Excellent flow!
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setShowEveningReview(false);
                    // increment streak
                    setStreak(s => s + 1);
                    saveState(nodes, distractions, energyLevel, mood, streak + 1);
                  }}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-md"
                >
                  Done & Log Day
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
