import React, { useMemo, useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  AlertCircle, AlertOctagon, ShieldAlert, Activity,
  MessageSquare, Phone, Calendar,
  CheckCircle2, Timer, FastForward,
  Zap, AlertTriangle, Flame, X, RefreshCcw, UserCheck
} from 'lucide-react';

// --- DADOS CONSOLIDADOS (Versão 30/01) ---

const CRISES_DATA = [
  { id: 1, criticidade: 1, squad: "Bills & Payments", canal: "Chat", reason: "Altacriacao_Crash/Incidente", data: "22/01", hora: "08:45" },
  { id: 2, criticidade: 2, squad: "Chargeback", canal: "Telefone", reason: "Baixafinalizacao_Aderencia", data: "22/01", hora: "10:20" },
  { id: 3, criticidade: 1, squad: "Investments", canal: "Chat", reason: "Altacriacao_Forecast", data: "22/01", hora: "08:15" },
  { id: 4, criticidade: 3, squad: "Collections", canal: "E-mail", reason: "Baixafinalizacao_Produtividade", data: "22/01", hora: "13:40" },
  { id: 5, criticidade: 2, squad: "Lending", canal: "Chat", reason: "Baixafinalizacao_Crash/Incidente", data: "22/01", hora: "14:55" },
  { id: 6, criticidade: 1, squad: "Marketplace", canal: "Chat", reason: "Altacriacao_Crash/Incidente", data: "22/01", hora: "15:10" },
  { id: 7, criticidade: 2, squad: "NuCoin", canal: "Chat", reason: "Baixafinalizacao_Produtividade", data: "22/01", hora: "16:05" },
  { id: 8, criticidade: 1, squad: "Lending", canal: "Telefone", reason: "Baixafinalizacao_Aderencia", data: "22/01", hora: "16:45" },
  { id: 9, criticidade: 1, squad: "Bills & Payments", canal: "Chat", reason: "Altacriacao_Forecast", data: "22/01", hora: "17:20" },
  { id: 10, criticidade: 1, squad: "Nupay", canal: "Chat", reason: "Altacriacao_Crash/Incidente", data: "22/01", hora: "08:55" },
];

const BPO_CHAT_DATA = [
  { name: "Marketplace", total: 42 },
  { name: "Collections", total: 58 },
  { name: "Nucoin", total: 65 },
  { name: "Savings", total: 70 },
  { name: "Lending", total: 78 },
  { name: "Investments", total: 85 },
  { name: "PJ", total: 89 },
  { name: "Bills & Payments", total: 94 },
  { name: "Chargeback", total: 98 },
].sort((a, b) => a.total - b.total);

const BPO_PHONE_DATA = [
  { name: "Savings", total: 46 },
  { name: "Marketplace", total: 52 },
  { name: "Lending", total: 55 },
  { name: "Collections", total: 62 },
  { name: "Nucoin", total: 71 },
  { name: "Investments", total: 78 },
  { name: "Bills & Payments", total: 86 },
  { name: "PJ", total: 92 },
  { name: "Chargeback", total: 95 },
].sort((a, b) => a.total - b.total);

const REVERTED_SQUADS_DATA = [
  { name: "Marketplace", count: 10 },
  { name: "Bills & Payments", count: 8 },
  { name: "Lending", count: 6 },
  { name: "Chargeback", count: 5 },
  { name: "Investments", count: 5 },
  { name: "Collections", count: 3 },
  { name: "NuCoin", count: 3 },
];

const INCIDENTES_LIST_DATA = [
  { id: 1, sev: 1, data: "22/01", hora: "08:15", nome: "Lentidão no Processamento Pix", squad: "Savings", status: "Resolvido" },
  { id: 2, sev: 1, data: "21/01", hora: "09:30", nome: "Instabilidade Ferramenta Shuffle", squad: "OCC", status: "Em Acompanhamento" },
  { id: 3, sev: 2, data: "22/01", hora: "10:45", nome: "Falha de Envio SMS (Twilio)", squad: "OCC", status: "Resolvido" },
  { id: 4, sev: 2, data: "22/01", hora: "11:20", nome: "Erro no Resgate de Investimentos CDB", squad: "Investments", status: "Em Acompanhamento" },
  { id: 5, sev: 1, data: "22/01", hora: "13:05", nome: "Timeout Fluxo de Chargeback", squad: "Chargeback", status: "Resolvido" },
  { id: 6, sev: 2, data: "21/01", hora: "14:40", nome: "Indisponibilidade API de Conta PJ", squad: "PJ", status: "Em Acompanhamento" },
  { id: 7, sev: 3, data: "22/01", hora: "15:15", nome: "Deslogue Repentino no Zendesk", squad: "OCC", status: "Resolvido" },
  { id: 8, sev: 3, data: "20/01", hora: "16:25", nome: "Erro na Visualização de Extrato", squad: "Savings", status: "On Road" },
  { id: 9, sev: 1, data: "22/01", hora: "17:50", nome: "Latência no Fluxo de Empréstimos", squad: "Lending", status: "Resolvido" },
  { id: 10, sev: 3, data: "19/01", hora: "18:35", nome: "Falha na Sincronização NuReserve", squad: "Investments", status: "On Road" },
];

const COLORS = {
  C1: '#2E0561', C2: '#820AD1', C3: '#DAB8F3',
  REV: ['#2E0561', '#4B0082', '#6A0DAD', '#820AD1', '#9D33D3', '#B583E1', '#DAB8F3']
};

const App = () => {
  // --- ESTADOS PARA INTERATIVIDADE ---
  const [activeCriticidade, setActiveCriticidade] = useState(null);
  const [activeReason, setActiveReason] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);

  const otdValue = 84; 
  const otdMeta = 80;
  const isOtdOk = otdValue >= otdMeta;

  // --- LÓGICA DE FILTRAGEM ---
  const filteredCrises = useMemo(() => {
    return CRISES_DATA.filter(c => {
      const matchHour = selectedHour === null || parseInt(c.hora.split(':')[0]) === selectedHour;
      const matchCrit = activeCriticidade === null || c.criticidade === activeCriticidade;
      const matchReason = activeReason === null || c.reason === activeReason;
      return matchHour && matchCrit && matchReason;
    });
  }, [selectedHour, activeCriticidade, activeReason]);

  const heatmapData = useMemo(() => {
    const slots = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    CRISES_DATA.forEach(c => {
      const h = parseInt(c.hora.split(':')[0]);
      if (h >= 0 && h < 24) slots[h].count += 1;
    });
    return slots;
  }, []);

  const avgAdhChat = useMemo(() => (BPO_CHAT_DATA.reduce((acc, curr) => acc + curr.total, 0) / BPO_CHAT_DATA.length).toFixed(1), []);
  const avgAdhPhone = useMemo(() => (BPO_PHONE_DATA.reduce((acc, curr) => acc + curr.total, 0) / BPO_PHONE_DATA.length).toFixed(1), []);

  const crisesStatsData = useMemo(() => [
    { name: 'C1', value: CRISES_DATA.filter(c => c.criticidade === 1).length, crit: 1, color: COLORS.C1 },
    { name: 'C2', value: CRISES_DATA.filter(c => c.criticidade === 2).length, crit: 2, color: COLORS.C2 },
    { name: 'C3', value: CRISES_DATA.filter(c => c.criticidade === 3).length, crit: 3, color: COLORS.C3 },
  ], []);

  const reasonStatsData = useMemo(() => {
    const counts = CRISES_DATA.reduce((acc, curr) => {
      acc[curr.reason] = (acc[curr.reason] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value], index) => ({
      name, value, color: COLORS.REV[index % COLORS.REV.length]
    }));
  }, []);

  const squadChartData = useMemo(() => {
    const counts = filteredCrises.reduce((acc, curr) => {
      if (!acc[curr.squad]) acc[curr.squad] = { name: curr.squad, chat: 0, fone: 0 };
      if (curr.canal === 'Chat') acc[curr.squad].chat += 1; else acc[curr.squad].fone += 1;
      return acc;
    }, {});
    return Object.values(counts).sort((a, b) => (b.chat + b.fone) - (a.chat + a.fone));
  }, [filteredCrises]);

  // --- AUXILIARES ---
  const checkIncidenteAge = (data) => {
    const dia = parseInt(data.split('/')[0]);
    return (22 - dia) >= 3;
  };

  const getHeatmapColor = (count, hour) => {
    const isSelected = selectedHour === hour;
    if (count === 0) return isSelected ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-100';
    if (count === 1) return isSelected ? 'bg-indigo-300 ring-2 ring-indigo-600' : 'bg-indigo-200 text-indigo-700';
    if (count === 2) return isSelected ? 'bg-indigo-600 ring-2 ring-indigo-800 text-white' : 'bg-indigo-500 text-white';
    return isSelected ? 'bg-indigo-950 ring-2 ring-black text-white' : 'bg-indigo-900 text-white';
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 font-sans p-4 lg:p-8 overflow-x-hidden text-left antialiased">
      {/* HEADER */}
      <header className="bg-[#820AD1] text-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="bg-white text-[#820AD1] p-2 rounded-xl font-black italic text-xl shadow-inner">Nu</div>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tight leading-none">OCC Control Desk</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mt-1">Daily Report • Versão Final 30/01</p>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 text-xs font-bold">
          <Calendar size={14} /> 22 de Janeiro de 2024
        </div>
      </header>

      {/* BARRA DE FILTROS ATIVOS */}
      {(activeCriticidade || activeReason || selectedHour !== null) && (
        <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm mb-6 animate-in slide-in-from-top-4">
          <span className="text-[10px] font-black uppercase text-gray-400 mr-2">Filtros:</span>
          {selectedHour !== null && (
            <button onClick={() => setSelectedHour(null)} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-[10px] font-bold">Hora: {selectedHour}h <X size={10}/></button>
          )}
          {activeCriticidade && (
            <button onClick={() => setActiveCriticidade(null)} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-[10px] font-bold">C{activeCriticidade} <X size={10}/></button>
          )}
          {activeReason && (
            <button onClick={() => setActiveReason(null)} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-[10px] font-bold">{activeReason.split('_')[1]} <X size={10}/></button>
          )}
          <button onClick={() => {setActiveCriticidade(null); setActiveReason(null); setSelectedHour(null)}} className="text-[9px] font-black text-red-500 uppercase hover:underline ml-auto">Limpar Tudo</button>
        </div>
      )}

      {/* KPIS GLOBAIS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border flex items-center gap-4 shadow-sm h-full">
          <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Activity size={24}/></div>
          <div className="text-left"><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Incidentes</p><p className="text-2xl font-black text-gray-800">10</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border flex items-center gap-4 shadow-sm h-full border-l-4 border-l-red-500">
          <div className="bg-red-50 p-3 rounded-xl text-red-600"><AlertOctagon size={24}/></div>
          <div className="text-left"><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-red-600">Crises Ativas</p><p className="text-2xl font-black text-red-600">10</p></div>
        </div>
        <div className={`bg-white p-6 rounded-2xl border flex items-center gap-4 shadow-sm h-full ${isOtdOk ? 'border-green-100' : 'border-red-100'}`}>
          <div className={`p-3 rounded-xl ${isOtdOk ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}><Zap size={24}/></div>
          <div className="text-left"><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">OTD Global</p><p className={`text-2xl font-black ${isOtdOk ? 'text-green-600' : 'text-red-600'}`}>{otdValue}%</p></div>
        </div>
        {/* CARD ADH UNIFICADO - SEM ÍCONE */}
        <div className="bg-white p-6 rounded-2xl border flex items-center justify-between px-8 shadow-sm h-full">
          <div className="text-left">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 text-left">ADH Chat</p>
            <p className="text-2xl font-black text-blue-700 leading-none text-left">{avgAdhChat}%</p>
          </div>
          <div className="h-10 w-px bg-gray-100"></div>
          <div className="text-left">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 text-left">ADH Phone</p>
            <p className="text-2xl font-black text-indigo-700 leading-none text-left">{avgAdhPhone}%</p>
          </div>
        </div>
      </section>

      {/* CENÁRIO DE CRISE DETALHADO (INTERATIVO) */}
      <section className="bg-white rounded-3xl border shadow-sm overflow-hidden mb-8 text-left">
        <div className="p-6 border-b bg-gray-50/50 flex items-center gap-2">
          <ShieldAlert className="text-indigo-600" size={20} />
          <h2 className="text-lg font-black text-gray-700">Cenário de Crise Detalhado</h2>
        </div>
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-center border-r border-gray-100 pr-4 last:border-0 h-full text-left">
            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest text-center">Criticidade</h3>
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={crisesStatsData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none" onClick={(d) => setActiveCriticidade(activeCriticidade === d.crit ? null : d.crit)} className="cursor-pointer">
                    {crisesStatsData.map((e,i)=><Cell key={i} fill={e.color} opacity={activeCriticidade && activeCriticidade !== e.crit ? 0.3 : 1}/>)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {crisesStatsData.map((item, i) => (
                <button key={i} onClick={() => setActiveCriticidade(activeCriticidade === item.crit ? null : item.crit)} className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${activeCriticidade === item.crit ? 'bg-indigo-50 ring-1 ring-indigo-200' : ''}`}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className={`text-[9px] font-black uppercase ${activeCriticidade === item.crit ? 'text-indigo-700' : 'text-gray-500'}`}>{item.name} ({item.value})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center border-r border-gray-100 pr-4 last:border-0 h-full text-left">
            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest text-center text-center">Volume por Motivo</h3>
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reasonStatsData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none" onClick={(d) => setActiveReason(activeReason === d.name ? null : d.name)} className="cursor-pointer">
                    {reasonStatsData.map((e,i)=><Cell key={i} fill={e.color} opacity={activeReason && activeReason !== e.name ? 0.3 : 1}/>)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-xs">
              {reasonStatsData.map((item, idx) => (
                <button key={idx} onClick={() => setActiveReason(activeReason === item.name ? null : item.name)} className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all ${activeReason === item.name ? 'bg-indigo-50 ring-1 ring-indigo-100' : ''}`}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className={`text-[8px] font-bold uppercase truncate max-w-[80px] ${activeReason === item.name ? 'text-indigo-700' : 'text-gray-400'}`}>{item.name.split('_')[1]} ({item.value})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col text-left h-full">
            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest text-center">Impacto por Squad</h3>
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={squadChartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize:9, fontWeight:'bold'}} axisLine={false} tickLine={false} />
                  <Bar dataKey="chat" stackId="a" fill={COLORS.C1} barSize={12} />
                  <Bar dataKey="fone" stackId="a" fill={COLORS.C2} barSize={12} radius={[0,2,2,0]} />
                  <RechartsTooltip />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 mt-4 border-t border-gray-50 pt-3 text-[8px] font-black text-gray-400 uppercase">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#2E0561]"></div>Chat</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#820AD1]"></div>Fone</div>
            </div>
          </div>
        </div>
      </section>

      {/* ADERÊNCIA BPOS */}
      <section className="bg-white rounded-3xl border shadow-sm overflow-hidden mb-8 text-left">
        <div className="p-4 border-b bg-gray-50/50 flex items-center gap-2">
          <UserCheck className="text-indigo-600" size={18} />
          <h2 className="text-sm font-black text-gray-700">Cenário de Aderência das BPO's</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div><h4 className="text-[9px] font-black uppercase text-gray-400 mb-4 flex items-center gap-2 text-left"><MessageSquare size={10} className="text-blue-500"/> Chat por Squad</h4><div className="w-full h-[220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={BPO_CHAT_DATA} layout="vertical"><XAxis type="number" domain={[0,100]} hide /><YAxis dataKey="name" type="category" width={90} tick={{fontSize:8, fontWeight:'bold'}} axisLine={false} tickLine={false} /><Bar dataKey="total" fill={COLORS.C2} barSize={10} label={{position:'right', fontSize:8, fontWeight:'black', formatter:(v)=>v+'%'}} /></BarChart></ResponsiveContainer></div></div>
          <div className="border-l border-gray-100 pl-6 text-left"><h4 className="text-[9px] font-black uppercase text-gray-400 mb-4 flex items-center gap-2 text-left"><Phone size={10} className="text-green-500"/> Fone por Squad</h4><div className="w-full h-[220px] text-left"><ResponsiveContainer width="100%" height="100%"><BarChart data={BPO_PHONE_DATA} layout="vertical"><XAxis type="number" domain={[0,100]} hide /><YAxis dataKey="name" type="category" width={90} tick={{fontSize:8, fontWeight:'bold'}} axisLine={false} tickLine={false} /><Bar dataKey="total" fill={COLORS.C1} barSize={10} label={{position:'right', fontSize:8, fontWeight:'black', formatter:(v)=>v+'%'}} /></BarChart></ResponsiveContainer></div></div>
        </div>
      </section>

      {/* MAPA DE CALOR OPERACIONAL */}
      <section className="bg-white p-8 rounded-3xl border shadow-sm mb-8 text-left">
        <div className="flex justify-between items-center mb-6 border-b pb-4 text-left">
          <div className="flex items-center gap-2 text-left"><Flame className="text-orange-500" size={18}/><h3 className="text-sm font-black uppercase text-gray-500 tracking-widest text-left">Mapa de Calor Operacional</h3></div>
          <div className="flex gap-1 items-center text-left"><span className="text-[10px] font-black text-gray-400 uppercase mr-2 text-left">Intensidade</span><div className="w-3 h-3 bg-gray-50 border border-gray-100 rounded-sm"></div><div className="w-3 h-3 bg-indigo-200 rounded-sm"></div><div className="w-3 h-3 bg-indigo-500 rounded-sm"></div><div className="w-3 h-3 bg-indigo-900 rounded-sm"></div></div>
        </div>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2 text-left text-left">
          {heatmapData.map((s) => (<button key={s.hour} onClick={() => setSelectedHour(selectedHour === s.hour ? null : s.hour)} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${getHeatmapColor(s.count, s.hour)}`}><span className="text-[9px] font-black opacity-50">{s.hour.toString().padStart(2, '0')}h</span><span className="text-sm font-black">{s.count}</span></button>))}
        </div>
      </section>

      {/* TABELA DE CRISES (RESTAURADA) */}
      <section className="bg-white rounded-3xl border shadow-sm overflow-hidden mb-8 text-left">
        <div className="p-6 border-b bg-gray-900 flex justify-between items-center text-left">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white text-left">
            <AlertOctagon className="text-red-500" size={20} /> Cenário de Crises
          </h2>
          <div className="flex gap-2 font-black text-white text-xs">
            <span className="bg-red-900/40 text-red-400 border border-red-800/50 px-3 py-1 rounded-lg">C1: 5</span>
            <span className="bg-orange-900/40 text-orange-400 border border-orange-800/50 px-3 py-1 rounded-lg">C2: 4</span>
            <span className="bg-purple-900/40 text-purple-400 border border-purple-800/50 px-3 py-1 rounded-lg text-left">C3: 1</span>
          </div>
        </div>
        <div className="overflow-x-auto text-left">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900 text-gray-500 uppercase text-[11px] font-black tracking-wider border-b border-gray-800 text-left">
                <th className="p-4 text-left">Nível</th><th className="p-4 text-left text-left">Squad</th><th className="p-4 text-left text-left">Reason</th><th className="p-4 text-right">Ocorrência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-left">
              {filteredCrises.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors text-left">
                  <td className="p-4 text-left"><div className={`w-9 h-9 rounded-xl flex items-center justify-center border font-black text-sm ${c.criticidade === 1 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>C{c.criticidade}</div></td>
                  <td className="p-4 text-sm font-black text-gray-800 text-left">{c.squad}</td>
                  <td className="p-4 text-[12px] font-mono text-purple-700 font-bold text-left">{c.reason}</td>
                  <td className="p-4 text-right flex flex-col text-[10px] font-black text-gray-400 mt-4 uppercase text-right"><span>{c.data}</span><span className="text-purple-600">{c.hora}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* INSTABILIDADES REVERTIDAS */}
      <section className="bg-white rounded-3xl border shadow-sm overflow-hidden mb-8 text-left">
        <div className="p-6 border-b bg-indigo-50/30 flex items-center gap-2 text-left">
          <RefreshCcw className="text-indigo-600" size={20} />
          <h2 className="text-lg font-black text-indigo-800 text-left">Instabilidades Revertidas</h2>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start text-left">
          <div className="space-y-6 text-left">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest text-left">Total Revertidas</p>
              <p className="text-5xl font-black text-indigo-700 leading-none tracking-tighter text-left">40</p>
            </div>
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between p-3 bg-white border border-indigo-100 rounded-xl shadow-sm text-left"><span className="text-sm font-bold text-gray-700 text-left">Aderência</span><span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg font-black text-xs text-left">33</span></div>
              <div className="flex items-center justify-between p-3 bg-white border border-indigo-100 rounded-xl shadow-sm text-left"><span className="text-sm font-bold text-gray-700 text-left">Produtividade</span><span className="bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-lg font-black text-xs text-left">07</span></div>
            </div>
          </div>
          <div className="flex flex-col items-center text-left">
            <div className="w-full h-[220px] relative text-left">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={REVERTED_SQUADS_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="count" nameKey="name" stroke="none">{REVERTED_SQUADS_DATA.map((e,i)=><Cell key={i} fill={COLORS.REV[i % COLORS.REV.length]}/>)}</Pie><RechartsTooltip /></PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none text-center"><p className="text-3xl font-black text-indigo-800 leading-none text-center">40</p><p className="text-[9px] text-gray-400 font-bold uppercase mt-1 text-center">SQUADS</p></div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 max-w-sm text-left">
              {REVERTED_SQUADS_DATA.map((item, idx) => (<div key={idx} className="flex items-center gap-1.5 text-left"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.REV[idx % COLORS.REV.length] }}></div><span className="text-[9px] font-bold text-gray-500 uppercase text-left">{item.name} ({item.count})</span></div>))}
            </div>
          </div>
        </div>
      </section>

      {/* LISTA DE INCIDENTES (10 ITENS + IMPACTO ALL) */}
      <section className="bg-white rounded-3xl border shadow-sm overflow-hidden text-left text-left">
        <div className="p-6 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
          <div className="flex items-center gap-2 text-left"><AlertCircle className="text-blue-500" size={20} /><h2 className="text-lg font-black text-gray-700 text-left">Lista de Incidentes (D-1)</h2></div>
          <div className="flex flex-wrap gap-2 text-left">
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100 text-[9px] font-black text-gray-400 uppercase text-left"><div className="w-2 h-2 rounded-full bg-green-500"></div>Resolvido</div>
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100 text-[9px] font-black text-gray-400 uppercase text-left"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>Acompanhamento</div>
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100 text-[9px] font-black text-gray-400 uppercase text-left text-left"><div className="w-2 h-2 rounded-full bg-gray-400"></div>On Road</div>
          </div>
        </div>
        <div className="overflow-x-auto text-left">
          <table className="w-full text-left text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b text-left">
                <th className="p-4 text-left text-left text-left">Abertura</th><th className="p-4 text-center">Sev</th><th className="p-4 text-left text-left">Incidente</th><th className="p-4 text-left text-left">Squad</th><th className="p-4 text-left text-left">Impacto</th><th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-left">
              {INCIDENTES_LIST_DATA.sort((a,b) => a.status === 'Resolvido' ? 1 : -1).map(item => {
                const isOld = checkIncidenteAge(item.data);
                const isOCC = item.squad === 'OCC';
                return (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors text-left">
                    <td className="p-4 text-left"><div className="flex flex-col gap-1 text-[11px] text-left"><span className="bg-gray-100 px-1.5 py-0.5 rounded font-black text-gray-500 w-fit text-left">{item.data}</span><span className="font-bold text-gray-400 text-left">{item.hora}</span>{isOld && <span className="text-red-500 text-[8px] font-black uppercase flex items-center gap-0.5 text-left"><AlertTriangle size={8}/> Age {'>'} 3d</span>}</div></td>
                    <td className="p-4 text-center text-center"><div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-white text-[10px] font-black ${item.sev === 1 ? 'bg-red-600' : item.sev === 2 ? 'bg-orange-500' : 'bg-indigo-400'}`}>{item.sev}</div></td>
                    <td className="p-4 text-xs font-black text-left text-left">{item.nome}</td>
                    <td className="p-4 text-xs text-gray-400 font-bold italic text-left text-left">{item.squad}</td>
                    <td className="p-4 text-left text-left text-left"><span className={`text-[9px] px-2 py-1 rounded font-black uppercase ${isOCC ? 'bg-gray-200 text-gray-800' : 'bg-indigo-50 text-indigo-700'}`}>{isOCC ? 'All' : item.squad}</span></td>
                    <td className="p-4 text-right text-right"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase ${item.status==='Resolvido'?'bg-green-100 text-green-700':item.status==='On Road'?'bg-gray-100 text-gray-600':'bg-blue-100 text-blue-700 animate-pulse'}`}>{item.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default App;