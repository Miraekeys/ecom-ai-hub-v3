import { useState, useEffect, useRef } from "react";

// ============================================================
// CONFIGURATION — AGENTS ET COULEURS
// ============================================================
const AGENTS = {
  "Script YouTube": { color: "#FF6B35", bg: "#FFF0E8", emoji: "🎬", desc: "Génère des scripts vidéo YouTube optimisés basés sur les pratiques e-commerce mondiales." },
  "CMO": { color: "#2196F3", bg: "#E8F4FD", emoji: "📣", desc: "Stratégies marketing complètes avec plans d'acquisition et calendriers de contenu." },
  "Chef de Projet": { color: "#4CAF50", bg: "#E8F5E9", emoji: "📋", desc: "Structure tes projets avec phases, jalons, risques et ressources sur 90 jours." },
  "UX Produit": { color: "#9C27B0", bg: "#F3E5F5", emoji: "✨", desc: "Optimise tes fiches produits selon les standards internationaux qui convertissent." },
  "Veille": { color: "#FF9800", bg: "#FFF8E1", emoji: "🔍", desc: "Surveille les tendances e-commerce mondiales et identifie les opportunités non exploitées." },
  "Logistique": { color: "#009688", bg: "#E0F2F1", emoji: "📦", desc: "Stratégies logistiques adaptées à tes volumes et marchés cibles." },
  "Monitoring": { color: "#E91E63", bg: "#FCE4EC", emoji: "📊", desc: "Surveille la santé du système et la qualité des données." },
  "Gardien": { color: "#795548", bg: "#EFEBE9", emoji: "🛡️", desc: "Vérifie la sécurité de tes actions avant chaque modification importante." },
};

const CATEGORIES = {
  "IA & Automation": { color: "#8B5CF6", bg: "#EDE9FE" },
  "Mindset": { color: "#F59E0B", bg: "#FEF3C7" },
  "Boutique": { color: "#10B981", bg: "#D1FAE5" },
  "Niche Cosmétiques": { color: "#EC4899", bg: "#FCE7F3" },
  "Niche Amazon KDP": { color: "#F97316", bg: "#FFEDD5" },
  "Niche Services": { color: "#3B82F6", bg: "#DBEAFE" },
  "Marketing": { color: "#14B8A6", bg: "#CCFBF1" },
  "Logistique": { color: "#6B7280", bg: "#F3F4F6" },
};

const CHANNELS = [
  { id: 1, name: "단아쌤TV", lang: "🇰🇷", category: "Boutique", lastVideo: "Il y a 3h", active: true },
  { id: 2, name: "창업다마고치", lang: "🇰🇷", category: "Boutique", lastVideo: "Hier", active: true },
  { id: 3, name: "소신사장", lang: "🇰🇷", category: "Niche Cosmétiques", lastVideo: "Il y a 2j", active: true },
  { id: 4, name: "Oberlo", lang: "🇺🇸", category: "Boutique", lastVideo: "Il y a 5h", active: false },
  { id: 5, name: "Think Media", lang: "🇺🇸", category: "Marketing", lastVideo: "Il y a 1j", active: true },
];

const SAMPLE_VIDEOS = [
  { id: 1, title: "5 stratégies de fiche produit qui convertissent", channel: "단아쌤TV", category: "Boutique", lang: "🇰🇷", date: "2026-03-25", agent: "Veille", score: 9, duplicate: false, tools: ["Canva", "Notion"], excerpt: "Les images produit doivent montrer le contexte d'utilisation, pas seulement le produit isolé..." },
  { id: 2, title: "Comment créer une boutique de cosmétiques rentable", channel: "소신사장", category: "Niche Cosmétiques", lang: "🇰🇷", date: "2026-03-24", agent: "Script YouTube", score: 8, duplicate: false, tools: ["Shopify", "Klaviyo"], excerpt: "La niche cosmétiques naturels en Corée a une croissance de 34% annuelle..." },
  { id: 3, title: "Marketing automation pour e-commerce débutant", channel: "Oberlo", category: "Marketing", lang: "🇺🇸", date: "2026-03-23", agent: "CMO", score: 7, duplicate: true, duplicateOf: "Vidéo similaire déjà ingérée le 15/03", tools: ["Klaviyo", "Mailchimp", "Zapier"], excerpt: "L'email marketing génère 42$ pour chaque dollar investi selon les études récentes..." },
];

const SAMPLE_TOOLS = [
  { name: "Klaviyo", category: "Marketing", agent: "CMO", mentions: 12, desc: "Email marketing e-commerce" },
  { name: "Shopify", category: "Boutique", agent: "Chef de Projet", mentions: 23, desc: "Plateforme e-commerce" },
  { name: "Canva", category: "IA & Automation", agent: "UX Produit", mentions: 8, desc: "Création visuels produits" },
  { name: "Notion", category: "IA & Automation", agent: "Chef de Projet", mentions: 6, desc: "Gestion de projet" },
  { name: "Zapier", category: "IA & Automation", agent: "Monitoring", mentions: 9, desc: "Automatisation workflows" },
  { name: "Oberlo", category: "Boutique", agent: "Logistique", mentions: 7, desc: "Dropshipping sourcing" },
];

const KANBAN_COLUMNS = [
  { id: "backlog", label: "📥 Backlog", color: "#94A3B8" },
  { id: "todo", label: "📋 À faire", color: "#3B82F6" },
  { id: "doing", label: "⚡ En cours", color: "#F59E0B" },
  { id: "done", label: "✅ Terminé", color: "#10B981" },
];

const INITIAL_TASKS = [
  { id: 1, title: "Analyser stratégies fiches produit coréennes", agent: "Veille", column: "done", priority: "high" },
  { id: 2, title: "Générer 3 scripts YouTube sur le live commerce", agent: "Script YouTube", column: "doing", priority: "high" },
  { id: 3, title: "Plan de lancement boutique cosmétiques", agent: "Chef de Projet", column: "todo", priority: "medium" },
  { id: 4, title: "Optimiser titres vidéos existantes", agent: "UX Produit", column: "backlog", priority: "low" },
  { id: 5, title: "Rapport tendances hebdomadaires", agent: "Monitoring", column: "todo", priority: "medium" },
];

const BUDGET_THRESHOLD = 50;
const BUDGET_WARNING = 35;
const CURRENT_SPEND = 12.40;

export default function App() {
  const [activeView, setActiveView] = useState("feed");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [openChats, setOpenChats] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const [chatInputs, setChatInputs] = useState({});
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightVisible, setRightVisible] = useState(true);
  const [addUrlModal, setAddUrlModal] = useState(false);
  const [tagModal, setTagModal] = useState(null);
  const [newUrl, setNewUrl] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [budgetVisible, setBudgetVisible] = useState(true);
  const [dragTask, setDragTask] = useState(null);
  const [newTaskModal, setNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", agent: "Chef de Projet", priority: "medium" });
  const [calView, setCalView] = useState("week");
  const [isLoading, setIsLoading] = useState({});

  const budgetPct = (CURRENT_SPEND / BUDGET_THRESHOLD) * 100;
  const budgetColor = budgetPct >= 80 ? "#EF4444" : budgetPct >= 60 ? "#F59E0B" : "#10B981";
  const budgetWarning = budgetPct >= 60;

  const openChat = (agent) => {
    if (!openChats.includes(agent)) setOpenChats(prev => [...prev.slice(-2), agent]);
  };
  const closeChat = (agent) => setOpenChats(prev => prev.filter(a => a !== agent));

  const sendMessage = async (agent) => {
    const msg = chatInputs[agent]?.trim();
    if (!msg) return;
    setChatMessages(prev => ({ ...prev, [agent]: [...(prev[agent] || []), { role: "user", content: msg, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }] }));
    setChatInputs(prev => ({ ...prev, [agent]: "" }));
    setIsLoading(prev => ({ ...prev, [agent]: true }));
    setTimeout(() => {
      setChatMessages(prev => ({ ...prev, [agent]: [...(prev[agent] || []), { role: "agent", agent, content: `[${AGENTS[agent].emoji} ${agent}] Connecte le webhook http://178.104.84.46:5678/webhook/UUID pour recevoir ma vraie réponse sur : "${msg}"`, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }] }));
      setIsLoading(prev => ({ ...prev, [agent]: false }));
    }, 1200);
  };

  const tagAgent = (agent, videoId) => {
    openChat(agent);
    setTimeout(() => setChatMessages(prev => ({ ...prev, [agent]: [...(prev[agent] || []), { role: "system", content: `📌 Tagué sur la transcription vidéo #${videoId}. Analyse en cours...`, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }] })), 300);
    setTagModal(null);
  };

  const moveTask = (taskId, newCol) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: newCol } : t));

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), ...newTask, column: "backlog" }]);
    setNewTask({ title: "", agent: "Chef de Projet", priority: "medium" });
    setNewTaskModal(false);
  };

  const weeks = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const today = new Date();

  // ---- RENDER HELPERS ----
  const BudgetBadge = () => (
    <div onClick={() => setBudgetVisible(!budgetVisible)} style={{ position: "relative", cursor: "pointer" }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%",
        background: `conic-gradient(${budgetColor} ${budgetPct}%, #E5E7EB ${budgetPct}%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: budgetWarning ? "pulse 2s infinite" : "none"
      }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
          {budgetPct >= 80 ? "🔴" : budgetPct >= 60 ? "🟡" : "🟢"}
        </div>
      </div>
      {budgetWarning && <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444", border: "2px solid white", animation: "ping 1s infinite" }} />}
      {budgetVisible && (
        <div style={{ position: "absolute", top: "44px", right: 0, background: "white", borderRadius: "12px", padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", width: "220px", zIndex: 999, border: "1px solid #F3F4F6" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>💰 Budget Claude API</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
            <span style={{ color: "#666" }}>Dépensé</span>
            <span style={{ fontWeight: "700", color: budgetColor }}>{CURRENT_SPEND.toFixed(2)}€</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
            <span style={{ color: "#666" }}>Seuil d'alerte</span>
            <span style={{ fontWeight: "600" }}>{BUDGET_THRESHOLD}€</span>
          </div>
          <div style={{ height: "6px", background: "#F3F4F6", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${budgetPct}%`, background: budgetColor, borderRadius: "3px", transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: "11px", color: "#999", marginTop: "6px" }}>Cliquer pour masquer</div>
        </div>
      )}
    </div>
  );

  const VideoCard = ({ video }) => {
    const cat = CATEGORIES[video.category] || CATEGORIES["Boutique"];
    const agent = AGENTS[video.agent];
    return (
      <div style={{ background: "white", borderRadius: "14px", padding: "16px", marginBottom: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: video.duplicate ? "2px solid #FEE2E2" : "1px solid #F3F4F6" }}>
        {video.duplicate && (
          <div style={{ background: "#FEE2E2", borderRadius: "8px", padding: "6px 10px", marginBottom: "10px", fontSize: "12px", color: "#B91C1C", fontWeight: "600" }}>
            ⚠ Contenu similaire détecté — {video.duplicateOf}
          </div>
        )}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "22px" }}>{video.lang}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#111", marginBottom: "4px" }}>{video.title}</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "12px", background: cat.bg, color: cat.color, fontWeight: "600" }}>{video.category}</span>
              <span style={{ fontSize: "12px", color: "#888" }}>{video.channel} · {video.date}</span>
              <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "12px", background: agent.bg, color: agent.color, fontWeight: "600" }}>{agent.emoji} {video.agent}</span>
            </div>
          </div>
          <div style={{ fontSize: "18px", fontWeight: "800", color: video.score >= 8 ? "#10B981" : video.score >= 6 ? "#F59E0B" : "#EF4444" }}>{video.score}/10</div>
        </div>
        <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6", margin: "0 0 10px", fontStyle: "italic" }}>"{video.excerpt}"</p>
        {video.tools.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", color: "#999", fontWeight: "600" }}>🔧 Outils mentionnés :</span>
            {video.tools.map(tool => {
              const t = SAMPLE_TOOLS.find(x => x.name === tool);
              const a = t ? AGENTS[t.agent] : null;
              return (
                <span key={tool} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: a ? a.bg : "#F3F4F6", color: a ? a.color : "#555", fontWeight: "600" }}>
                  {tool}
                </span>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #F9FAFB", paddingTop: "10px" }}>
          <button onClick={() => openChat(video.agent)} style={{ flex: 1, padding: "7px", background: agent.bg, border: `1px solid ${agent.color}20`, borderRadius: "8px", fontSize: "12px", color: agent.color, cursor: "pointer", fontWeight: "600" }}>{agent.emoji} Discuter avec {video.agent}</button>
          <button onClick={() => setTagModal(video.id)} style={{ padding: "7px 12px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>@ Tag</button>
          <button onClick={() => navigator.clipboard?.writeText(video.excerpt)} style={{ padding: "7px 12px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>📋</button>
        </div>
      </div>
    );
  };

  const ChatWindow = ({ agent }) => {
    const a = AGENTS[agent];
    const messages = chatMessages[agent] || [];
    const endRef = useRef(null);
    useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
    return (
      <div style={{ width: "300px", height: "400px", background: "white", borderRadius: "14px 14px 0 0", boxShadow: "0 -4px 20px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", border: `2px solid ${a.color}30`, borderBottom: "none" }}>
        <div style={{ padding: "10px 14px", background: a.color, borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>{a.emoji}</span>
          <span style={{ color: "white", fontWeight: "700", fontSize: "13px", flex: 1 }}>{agent}</span>
          <button onClick={() => setOpenChats(prev => [...prev, Object.keys(AGENTS).find(x => !prev.includes(x) && x !== agent) || prev[0]])} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", cursor: "pointer" }}>+</button>
          <button onClick={() => closeChat(agent)} style={{ background: "none", border: "none", color: "white", fontSize: "18px", cursor: "pointer" }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {messages.length === 0 && <div style={{ textAlign: "center", padding: "24px 12px", color: "#999", fontSize: "13px" }}><div style={{ fontSize: "28px", marginBottom: "8px" }}>{a.emoji}</div><p style={{ margin: 0 }}>{a.desc}</p></div>}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "85%", padding: "7px 11px", borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px", background: msg.role === "user" ? a.color : msg.role === "system" ? "#FEF9C3" : a.bg, color: msg.role === "user" ? "white" : "#333", fontSize: "13px", lineHeight: "1.5" }}>
                {msg.content}
                <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "2px", textAlign: "right" }}>{msg.time}</div>
              </div>
            </div>
          ))}
          {isLoading[agent] && <div style={{ display: "flex", gap: "4px", padding: "4px 8px" }}>{[0,1,2].map(i => <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: a.color, animation: `bounce 1s infinite ${i*0.2}s` }} />)}</div>}
          <div ref={endRef} />
        </div>
        <div style={{ padding: "8px 10px", borderTop: "1px solid #F3F4F6", display: "flex", gap: "6px" }}>
          <input value={chatInputs[agent] || ""} onChange={e => setChatInputs(prev => ({ ...prev, [agent]: e.target.value }))} onKeyDown={e => e.key === "Enter" && sendMessage(agent)} placeholder="Message..." style={{ flex: 1, padding: "7px 11px", borderRadius: "16px", border: `1px solid ${a.color}30`, fontSize: "13px", outline: "none", background: a.bg }} />
          <button onClick={() => sendMessage(agent)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: a.color, border: "none", color: "white", cursor: "pointer", fontSize: "14px" }}>→</button>
        </div>
      </div>
    );
  };

  const KanbanView = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#111" }}>🗂️ Tableau de bord projet</h2>
        <button onClick={() => setNewTaskModal(true)} style={{ padding: "8px 16px", background: "#4CAF50", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>+ Nouvelle tâche</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {KANBAN_COLUMNS.map(col => (
          <div key={col.id} style={{ background: "white", borderRadius: "14px", padding: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", minHeight: "400px" }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (dragTask) { moveTask(dragTask, col.id); setDragTask(null); } }}
          >
            <div style={{ fontSize: "14px", fontWeight: "700", color: col.color, marginBottom: "12px", paddingBottom: "8px", borderBottom: `2px solid ${col.color}20` }}>
              {col.label} <span style={{ fontSize: "12px", background: `${col.color}20`, padding: "1px 6px", borderRadius: "10px" }}>{tasks.filter(t => t.column === col.id).length}</span>
            </div>
            {tasks.filter(t => t.column === col.id).map(task => {
              const a = AGENTS[task.agent];
              return (
                <div key={task.id} draggable onDragStart={() => setDragTask(task.id)} style={{ background: a.bg, borderRadius: "10px", padding: "10px", marginBottom: "8px", cursor: "grab", borderLeft: `3px solid ${a.color}`, transition: "transform 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#222", marginBottom: "6px" }}>{task.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: a.color, color: "white", fontWeight: "600" }}>{a.emoji} {task.agent}</span>
                    <span style={{ fontSize: "11px", color: task.priority === "high" ? "#EF4444" : task.priority === "medium" ? "#F59E0B" : "#94A3B8", fontWeight: "700" }}>
                      {task.priority === "high" ? "🔴 Urgent" : task.priority === "medium" ? "🟡 Normal" : "⚪ Bas"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                    {KANBAN_COLUMNS.filter(c => c.id !== task.column).map(c => (
                      <button key={c.id} onClick={() => moveTask(task.id, c.id)} style={{ flex: 1, padding: "3px", background: "white", border: `1px solid ${c.color}40`, borderRadius: "6px", fontSize: "10px", cursor: "pointer", color: c.color, fontWeight: "600" }}>→{c.label.split(" ")[1]}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const CalendarView = () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - today.getDay() + i + 1);
      return d;
    });
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>📅 Calendrier des vidéos</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            {["week", "month"].map(v => <button key={v} onClick={() => setCalView(v)} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: calView === v ? "#FF6B35" : "white", color: calView === v ? "white" : "#555", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>{v === "week" ? "Semaine" : "Mois"}</button>)}
          </div>
        </div>
        <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#F9FAFB" }}>
            {days.map((d, i) => (
              <div key={i} style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ fontSize: "12px", color: "#888", fontWeight: "600" }}>{weeks[i]}</div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: d.toDateString() === today.toDateString() ? "#FF6B35" : "#222" }}>{d.getDate()}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", minHeight: "300px" }}>
            {days.map((d, i) => {
              const dayVideos = SAMPLE_VIDEOS.filter(v => v.date === d.toISOString().split("T")[0]);
              return (
                <div key={i} style={{ padding: "8px", borderRight: i < 6 ? "1px solid #F3F4F6" : "none", minHeight: "200px", background: d.toDateString() === today.toDateString() ? "#FFFBF7" : "white" }}>
                  {dayVideos.map(v => {
                    const cat = CATEGORIES[v.category] || CATEGORIES["Boutique"];
                    return (
                      <div key={v.id} style={{ background: cat.bg, borderRadius: "6px", padding: "5px 7px", marginBottom: "4px", borderLeft: `3px solid ${cat.color}`, fontSize: "11px" }}>
                        <div style={{ fontWeight: "700", color: cat.color, marginBottom: "2px" }}>{v.lang} {v.category}</div>
                        <div style={{ color: "#555", lineHeight: "1.3" }}>{v.title.substring(0, 40)}...</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {Object.entries(CATEGORIES).map(([name, cat]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: cat.bg, borderRadius: "20px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cat.color }} />
              <span style={{ fontSize: "12px", color: cat.color, fontWeight: "600" }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ToolsView = () => (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: "20px" }}>🔧 Outils détectés dans les transcriptions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
        {SAMPLE_TOOLS.map(tool => {
          const a = AGENTS[tool.agent];
          const cat = CATEGORIES[tool.category] || CATEGORIES["Boutique"];
          return (
            <div key={tool.name} style={{ background: "white", borderRadius: "14px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderTop: `3px solid ${a.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "#111" }}>{tool.name}</div>
                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: cat.bg, color: cat.color, fontWeight: "700" }}>{tool.category}</span>
              </div>
              <p style={{ fontSize: "13px", color: "#666", margin: "0 0 10px" }}>{tool.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "10px", background: a.bg, color: a.color, fontWeight: "700" }}>{a.emoji} {tool.agent}</span>
                <span style={{ fontSize: "12px", color: "#888" }}>🔁 {tool.mentions} mentions</span>
              </div>
              <button onClick={() => openChat(tool.agent)} style={{ width: "100%", marginTop: "10px", padding: "7px", background: a.bg, border: `1px solid ${a.color}30`, borderRadius: "8px", fontSize: "12px", color: a.color, cursor: "pointer", fontWeight: "700" }}>Demander à {tool.agent} →</button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const AgentProfileView = ({ agent }) => {
    const a = AGENTS[agent];
    const agentVideos = SAMPLE_VIDEOS.filter(v => v.agent === agent);
    return (
      <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
        <div style={{ height: "120px", background: `linear-gradient(135deg, ${a.bg}, ${a.color}30)` }} />
        <div style={{ padding: "0 24px 24px", marginTop: "-32px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", border: "4px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", marginBottom: "12px" }}>{a.emoji}</div>
          <h2 style={{ margin: "0 0 4px", fontSize: "22px" }}>{agent}</h2>
          <span style={{ fontSize: "13px", color: a.color, background: a.bg, padding: "3px 12px", borderRadius: "20px", fontWeight: "700" }}>Agent IA Spécialisé</span>
          <p style={{ marginTop: "14px", color: "#555", fontSize: "14px", lineHeight: "1.7" }}>{a.desc}</p>
          <button onClick={() => openChat(agent)} style={{ width: "100%", marginTop: "12px", padding: "12px", background: a.color, color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>💬 Démarrer une conversation</button>
          {agentVideos.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "12px" }}>Activité récente</h3>
              {agentVideos.map(v => (
                <div key={v.id} style={{ padding: "10px", background: a.bg, borderRadius: "10px", marginBottom: "8px", borderLeft: `3px solid ${a.color}` }}>
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>{v.title}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "3px" }}>{v.date} · Score {v.score}/10</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const navItems = [
    { id: "feed", icon: "🏠", label: "Accueil" },
    { id: "videos", icon: "📹", label: "Transcriptions" },
    { id: "tools", icon: "🔧", label: "Outils détectés" },
    { id: "kanban", icon: "🗂️", label: "Projets" },
    { id: "calendar", icon: "📅", label: "Calendrier" },
    { id: "channels", icon: "📡", label: "Chaînes suivies" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
        @keyframes ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.8);opacity:0} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #D4C9B8; border-radius: 3px; }
      `}</style>

      {/* HEADER */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "54px", background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", padding: "0 16px", gap: "12px", zIndex: 100 }}>
        <div style={{ fontWeight: "900", fontSize: "19px", color: "#FF6B35", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>⚡ AssistantIA</div>
        <input placeholder="🔍 Rechercher..." style={{ flex: 1, maxWidth: "380px", padding: "7px 14px", borderRadius: "18px", border: "1px solid #E0D8CC", background: "#FAF7F2", fontSize: "13px", outline: "none" }} />
        <div style={{ flex: 1 }} />
        <button onClick={() => setAddUrlModal(true)} style={{ padding: "7px 14px", background: "#FF6B35", color: "white", border: "none", borderRadius: "18px", fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}>+ Vidéo</button>
        <BudgetBadge />
        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#FF6B35", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "15px", cursor: "pointer", flexShrink: 0 }}>M</div>
      </div>

      {/* LAYOUT */}
      <div style={{ paddingTop: "54px", display: "flex" }}>

        {/* LEFT NAV */}
        <div style={{ width: leftCollapsed ? "54px" : "220px", transition: "width 0.25s", position: "fixed", left: 0, top: "54px", bottom: 0, background: "white", padding: "12px 6px", overflowY: "auto", boxShadow: "2px 0 10px rgba(0,0,0,0.04)", zIndex: 50 }}>
          <button onClick={() => setLeftCollapsed(!leftCollapsed)} style={{ width: "100%", padding: "6px", background: "#FAF7F2", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", marginBottom: "10px", color: "#888" }}>{leftCollapsed ? "→" : "← "}</button>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setSelectedAgent(null); }} style={{ width: "100%", padding: "9px 10px", background: activeView === item.id ? "#FFF0E8" : "transparent", border: "none", borderRadius: "9px", cursor: "pointer", display: "flex", alignItems: "center", gap: "9px", fontSize: "13px", fontWeight: activeView === item.id ? "700" : "500", color: activeView === item.id ? "#FF6B35" : "#555", marginBottom: "3px", textAlign: "left" }}>
              <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
              {!leftCollapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
            </button>
          ))}
          {!leftCollapsed && (
            <>
              <div style={{ margin: "14px 0 6px", fontSize: "10px", color: "#AAA", fontWeight: "800", paddingLeft: "10px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Agents</div>
              {Object.entries(AGENTS).map(([name, a]) => (
                <button key={name} onClick={() => { setSelectedAgent(name); setActiveView("agent"); }} style={{ width: "100%", padding: "7px 10px", background: "transparent", border: "none", borderRadius: "9px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px", textAlign: "left" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", border: `2px solid ${a.color}30`, flexShrink: 0 }}>{a.emoji}</div>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* CENTER */}
        <div style={{ marginLeft: leftCollapsed ? "54px" : "220px", marginRight: rightVisible ? "240px" : "0", flex: 1, padding: "20px 24px", transition: "all 0.25s", minWidth: 0 }}>

          {/* CATEGORY FILTER */}
          {(activeView === "feed" || activeView === "videos") && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
              <button onClick={() => setFilterCat("all")} style={{ padding: "5px 14px", borderRadius: "18px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "700", background: filterCat === "all" ? "#FF6B35" : "white", color: filterCat === "all" ? "white" : "#555", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>Tout</button>
              {Object.entries(CATEGORIES).map(([name, cat]) => (
                <button key={name} onClick={() => setFilterCat(name)} style={{ padding: "5px 12px", borderRadius: "18px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: "700", background: filterCat === name ? cat.color : cat.bg, color: filterCat === name ? "white" : cat.color, boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>{name}</button>
              ))}
            </div>
          )}

          {activeView === "feed" && SAMPLE_VIDEOS.filter(v => filterCat === "all" || v.category === filterCat).map(v => <VideoCard key={v.id} video={v} />)}
          {activeView === "videos" && SAMPLE_VIDEOS.filter(v => filterCat === "all" || v.category === filterCat).map(v => <VideoCard key={v.id} video={v} />)}
          {activeView === "tools" && <ToolsView />}
          {activeView === "kanban" && <KanbanView />}
          {activeView === "calendar" && <CalendarView />}
          {activeView === "agent" && selectedAgent && <AgentProfileView agent={selectedAgent} />}
          {activeView === "channels" && (
            <div>
              <h2 style={{ marginBottom: "20px", fontSize: "20px" }}>📡 Chaînes suivies</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
                {CHANNELS.map(ch => {
                  const cat = CATEGORIES[ch.category] || CATEGORIES["Boutique"];
                  return (
                    <div key={ch.id} style={{ background: "white", borderRadius: "14px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderTop: `3px solid ${cat.color}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "24px" }}>{ch.lang}</span>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "14px" }}>{ch.name}</div>
                          <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: cat.bg, color: cat.color, fontWeight: "600" }}>{ch.category}</span>
                        </div>
                        <div style={{ marginLeft: "auto", width: "10px", height: "10px", borderRadius: "50%", background: ch.active ? "#10B981" : "#D1D5DB" }} />
                      </div>
                      <div style={{ fontSize: "12px", color: "#888" }}>Dernière vidéo : {ch.lastVideo}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — AGENTS */}
        <div style={{ width: rightVisible ? "230px" : "0", transition: "width 0.25s", position: "fixed", right: 0, top: "54px", bottom: 0, background: "white", overflowX: "hidden", boxShadow: "-2px 0 10px rgba(0,0,0,0.04)", zIndex: 50 }}>
          {rightVisible && (
            <div style={{ padding: "14px 12px", width: "230px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#AAA", textTransform: "uppercase", letterSpacing: "0.5px" }}>Agents</span>
                <button onClick={() => setRightVisible(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#CCC" }}>×</button>
              </div>
              {Object.entries(AGENTS).map(([name, a]) => (
                <div key={name} onClick={() => openChat(name)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "10px", cursor: "pointer", marginBottom: "4px", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = a.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", border: `2px solid ${a.color}30`, flexShrink: 0 }}>{a.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                    <div style={{ fontSize: "10px", color: a.color, fontWeight: "600" }}>● Disponible</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!rightVisible && (
          <button onClick={() => setRightVisible(true)} style={{ position: "fixed", right: "14px", bottom: "80px", width: "44px", height: "44px", borderRadius: "50%", background: "#FF6B35", color: "white", border: "none", fontSize: "18px", cursor: "pointer", boxShadow: "0 4px 14px rgba(255,107,53,0.4)", zIndex: 200 }}>👥</button>
        )}
      </div>

      {/* CHAT WINDOWS */}
      <div style={{ position: "fixed", bottom: 0, right: rightVisible ? "242px" : "14px", display: "flex", gap: "10px", alignItems: "flex-end", zIndex: 300, transition: "right 0.25s" }}>
        {openChats.map(agent => <ChatWindow key={agent} agent={agent} />)}
      </div>

      {/* TAG MODAL */}
      {tagModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "22px", width: "340px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
            <h3 style={{ marginBottom: "14px", fontSize: "17px" }}>@ Taguer un agent</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
              {Object.entries(AGENTS).map(([name, a]) => (
                <button key={name} onClick={() => tagAgent(name, tagModal)} style={{ padding: "9px 14px", background: a.bg, border: `1px solid ${a.color}30`, borderRadius: "9px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: a.color, fontWeight: "700", textAlign: "left" }}>
                  <span>{a.emoji}</span> {name}
                </button>
              ))}
            </div>
            <button onClick={() => setTagModal(null)} style={{ width: "100%", padding: "9px", background: "#F5F5F5", border: "none", borderRadius: "9px", cursor: "pointer", fontSize: "13px", color: "#666" }}>Annuler</button>
          </div>
        </div>
      )}

      {/* ADD URL MODAL */}
      {addUrlModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "22px", width: "460px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
            <h3 style={{ marginBottom: "8px", fontSize: "17px" }}>📹 Ajouter une vidéo</h3>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "14px" }}>Colle l'URL YouTube — n'importe quelle langue. Le système transcrit, traduit, évalue la pertinence et extrait les outils automatiquement.</p>
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #E0D8CC", fontSize: "13px", outline: "none", marginBottom: "12px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setAddUrlModal(false); setNewUrl(""); }} style={{ flex: 1, padding: "9px", background: "#F5F5F5", border: "none", borderRadius: "9px", cursor: "pointer", fontSize: "13px" }}>Annuler</button>
              <button onClick={() => { alert("Webhook à connecter : http://178.104.84.46:5678/webhook/UUID\n\nURL : " + newUrl); setAddUrlModal(false); setNewUrl(""); }} style={{ flex: 2, padding: "9px", background: "#FF6B35", color: "white", border: "none", borderRadius: "9px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>Ingérer cette vidéo</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {newTaskModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "22px", width: "400px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
            <h3 style={{ marginBottom: "16px", fontSize: "17px" }}>+ Nouvelle tâche</h3>
            <input value={newTask.title} onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))} placeholder="Titre de la tâche..." style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #E0D8CC", fontSize: "13px", outline: "none", marginBottom: "10px" }} />
            <select value={newTask.agent} onChange={e => setNewTask(prev => ({ ...prev, agent: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #E0D8CC", fontSize: "13px", outline: "none", marginBottom: "10px" }}>
              {Object.keys(AGENTS).map(a => <option key={a}>{a}</option>)}
            </select>
            <select value={newTask.priority} onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #E0D8CC", fontSize: "13px", outline: "none", marginBottom: "14px" }}>
              <option value="high">🔴 Urgent</option>
              <option value="medium">🟡 Normal</option>
              <option value="low">⚪ Bas</option>
            </select>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setNewTaskModal(false)} style={{ flex: 1, padding: "9px", background: "#F5F5F5", border: "none", borderRadius: "9px", cursor: "pointer", fontSize: "13px" }}>Annuler</button>
              <button onClick={addTask} style={{ flex: 2, padding: "9px", background: "#4CAF50", color: "white", border: "none", borderRadius: "9px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>Créer la tâche</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
