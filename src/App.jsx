import { useState, useEffect } from 'react'
import { supabase, CLIENT } from './supabase.js'
import {
  ComposedChart, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts'

const PASSWORD    = 'strand2026!'
const SESSION_KEY = 'strand_auth'
const ACCENT      = '#60a5fa'   // blue

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

// ─── ALL SEED DATA ─────────────────────────────────────────────────────────────
const SEED = {
  // ── CONSOLIDATED GROUP ──────────────────────────────────────────────────────
  group: {
    2024: {
      revenue:      [32561.8,0,4320,5966.74,3884.7,10273.99,1000,111266.34,205991.19,242533.92,235221.87,4043308.37],
      materials:    [-24211.8,-9798.39,0,0,-3884.7,-11783.99,-5444.36,-254731.95,-220514.05,-161617.24,-76384.96,-2620567.81],
      employee_cost:[-5020.79,-2157.3,-6710.59,-7001.26,-4553.29,-13979.27,-23824.84,-65828.52,-43823.63,-49818.19,-48869.03,-564219.78],
      dep_tangible: [0,0,0,0,0,0,0,0,0,0,0,-283676.63],
      ebitda:       [-97010.29,-45569.53,117461.23,-5812.55,-37668.88,-59504.83,-103451.75,-407264.14,-153622.85,-226500.24,-39743.62,-592446.39],
      ebit:         [-97010.29,-45569.53,117461.23,-5812.55,-37668.88,-59504.83,-103451.75,-407264.14,-153622.85,-226500.24,-39743.62,-876123.02],
      fin_expenses: [-808.89,-778.84,-1186.47,-1723.56,-1039.14,-839.04,-898.33,-6.04,98.33,-1570.39,-965.13,-7821.77],
      profit_loss:  [-97819.18,-46331.58,116274.76,-7529.06,-38469.69,-60335.12,-104348.57,-407252.92,-153515.11,-227941.97,-40698.06,-712587.68],
    },
    2025: {
      revenue:      [313053.49,425754.07,690001.21,443617.06,657178.22,438972.23,614450.44,358980.85,408744.75,606830.31,877625.58,741576.63],
      materials:    [-227378.58,-283075.94,-269221.18,-345262.46,-268386.41,-402205.54,-377217.48,-168686.84,-147351.35,-352455.42,-541175.89,-266345.19],
      employee_cost:[-93571.48,-91475.26,-86154.07,-84328.81,-81836.56,-93380.96,-69772.84,-85385.4,-99536.51,-136212.44,-133651.73,-199856.25],
      dep_tangible: [-32243.86,-32757.42,-33889.39,-34927.11,-35057.46,-41032.89,-49746.05,-41443.74,-34575.02,-39200.54,-39209.11,-123904.32],
      ebitda:       [-222681.77,-220014.96,166859.65,-211151.99,-36871.01,-474818.83,-98149.38,-155829.52,-78421.66,-156763.08,-225.45,47574.1],
      ebit:         [-254925.63,-252772.38,132970.26,-246079.1,-71928.47,-515851.72,-147895.43,-197273.26,-112996.68,-195963.62,-39434.56,-76330.22],
      fin_expenses: [-179.4,-765.82,-8628.99,-3011.29,-75.28,-3681.34,-2863,-296.87,-1853.28,-14387.16,-702.67,-3203.81],
      profit_loss:  [-254916.89,-253531.45,124272.17,-249035.06,-71957.85,-519444.5,-150768.43,-197540.13,-114582.87,-209651.91,-38058.1,-79517.8],
    },
    2026: {
      revenue:      [457793.48,524028.23,555022.78,588232.84,623835.75,662024.4,703008.63,747016.84,794297.69,845122.06,899785.05,958608.34],
      materials:    [-283942.03,-318799.15,-321452.41,-324371,-327581.45,-331112.95,-334997.59,-339270.7,-343971.12,-349141.59,-354829.1,-361085.35],
      employee_cost:[-120984.54,-135413.25,-139124.33,-148614.66,-152706.12,-157002.15,-161512.99,-166249.37,-171222.57,-176444.43,-181927.38,-187684.48],
      dep_tangible: [-38342.26,-44212.88,-44212.88,-44212.88,-44212.88,-44212.88,-44212.88,-44212.88,-44212.88,-44212.88,-44212.88,-44212.88],
      ebitda:       [-128294.92,-194125.97,-169495.76,-148694.62,-120393.62,-90032.5,-57443.75,-22445.03,15162.2,55594.25,99086.78,145896.71],
      ebit:         [-166637.18,-238338.84,-213708.63,-192907.49,-164606.49,-134245.38,-101656.63,-66657.91,-29050.67,11381.37,54873.9,101683.84],
      fin_expenses: [-2359.99,-1810.37,-1740.37,-1670.37,-1600.37,-1530.37,-1460.37,-1390.37,-1320.37,-1250.37,-1180.37,-4027.04],
      profit_loss:  [-168996.31,-240087.48,-215387.27,-194516.13,-166145.13,-135714.01,-103055.26,-67986.55,-30309.31,10192.73,53755.27,97718.54],
    },
    bs: {
      2024: { intangible:2100005, tangible:375077, lt_invest:65691, total_noncurrent:2540773, inventory:80000, trade_rec:99048, cash:186169, total_current:1433202, total_assets:3973974, total_equity:1780520, retained_earnings:-1239061, long_term_loan:837333, trade_payables:502993, total_liabilities:2193434 },
      2025: { intangible:2988544, tangible:300026, lt_invest:95034, total_noncurrent:3383603, inventory:80000, trade_rec:167573, cash:396476, total_current:2241241, total_assets:5624845, total_equity:2390859, retained_earnings:-3495831, long_term_loan:260000, trade_payables:940981, total_liabilities:3233965 },
      2026: { intangible:2496601, tangible:233575, lt_invest:94528, total_noncurrent:2824704, inventory:80000, trade_rec:403158, cash:128152, total_current:2081093, total_assets:4905798, total_equity:1668748, retained_earnings:-5592784, long_term_loan:643000, trade_payables:504603, total_liabilities:3237080 },
    },
  },
  // ── ENTITIES ─────────────────────────────────────────────────────────────────
  sfg: {
    2024: {
      revenue:      [32562,0,4320,5967,3885,10274,1000,100280,112326,127104,77198,159690],
      ebitda:       [-97010,-45570,117461,-5813,-35523,-45331,-31265,-87624,-71113,-19000,11531,-76034],
      ebit:         [-97010,-45570,117461,-5813,-35523,-45331,-31265,-87624,-71113,-19000,11531,-248873],
      profit_loss:  [-97819,-46332,116275,-7529,-36324,-46149,-32128,-87606,-71008,-20502,10738,-178054],
    },
    2025: {
      revenue:      [10333,51612,105596,64790,141824,221756,68903,79192,67957,7445,90522,50258],
      ebitda:       [-91171,-100798,10887,-56096,-74222,-49062,-18234,-36173,-82094,-117371,-60383,38230],
      ebit:         [-106565,-116193,-5508,-73490,-91616,-72645,-50561,-60350,-98771,-139048,-82059,-68544],
      profit_loss:  [-106669,-116198,-14118,-76432,-91616,-76311,-52424,-60359,-100666,-152792,-82601,-72015],
    },
    2026: {
      revenue:      [22946,22946,22946,22946,22946,22946,22946,22946,22946,22946,22946,22946],
      ebitda:       [-13317,3469,3469,3469,3469,3469,3469,3469,3469,3469,3469,3469],
      ebit:         [-40642,-23855,-23855,-23855,-23855,-23855,-23855,-23855,-23855,-23855,-23855,-23855],
      profit_loss:  [-40667,-25302,-25232,-25162,-25092,-25022,-24952,-24882,-24812,-24742,-24672,-27519],
    },
  },
  digital: {
    2024: {
      revenue:      [0,0,0,0,0,0,0,102,47737,30451,53033,52170],
      ebitda:       [0,0,0,0,-146,-6950,-19484,-28280,16427,-24871,14496,8614],
      ebit:         [0,0,0,0,-146,-6950,-19484,-28280,16427,-24871,14496,-18720],
      profit_loss:  [0,0,0,0,-146,-6962,-19484,-28280,16426,-24871,14496,-18717],
    },
    2025: {
      revenue:      [31890,12099,46837,16835,69237,24581,6975,46338,31737,33574,42341,56079],
      ebitda:       [-8658,-22705,-9167,-44171,30739,-32853,-45824,12344,-27442,-22517,-3243,22478],
      ebit:         [-13550,-27597,-14059,-49063,25847,-37745,-50716,7451,-32334,-27409,-8135,17586],
      profit_loss:  [-13550,-27610,-14129,-49073,25892,-37770,-50799,7475,-32021,-26813,-6123,17894],
    },
    2026: {
      revenue:      [37293,37293,37293,37293,37293,37293,37293,37293,37293,37293,37293,37293],
      ebitda:       Array(12).fill(-12678),
      ebit:         Array(12).fill(-18548),
      profit_loss:  Array(12).fill(-18548),
    },
  },
  properties: {
    2024: {
      revenue:      [0,0,0,0,0,0,0,10884,45928,84979,104991,99316],
      ebitda:       [0,0,0,0,-2000,-7224,-52702,-291360,-98936,-182629,-65771,-168535],
      ebit:         [0,0,0,0,-2000,-7224,-52702,-291360,-98936,-182629,-65771,-241113],
      profit_loss:  [0,0,0,0,-2000,-7224,-52737,-291366,-98933,-182569,-65933,-241277],
    },
    2025: {
      revenue:      [58464,77609,104108,94642,83135,92863,97165,135891,156403,188988,253530,198013],
      ebitda:       [-94240,-131063,4319,-37406,-139249,-226190,-125165,-60633,69807,28772,-41518,-104241],
      ebit:         [-105182,-142602,-7239,-49036,-150980,-237740,-136716,-72184,57600,16909,-53381,-115674],
      profit_loss:  [-105069,-142689,-7247,-49049,-151030,-237635,-136716,-72184,57427,16897,-53406,-115701],
    },
    2026: {
      revenue:      [121050,133155,146471,161118,177230,194953,214448,235893,259482,285430,313973,345371],
      ebitda:       [-40429,-110933,-103982,-96150,-87341,-77445,-66345,-53910,-39994,-24438,-7066,12318],
      ebit:         [-50543,-121047,-114096,-106264,-97454,-87559,-76459,-64023,-50108,-34552,-17179,2205],
      profit_loss:  [-50645,-121150,-114198,-106367,-97557,-87661,-76561,-64126,-50210,-34655,-17282,2102],
    },
  },
  spain: {
    2024: {
      revenue:      [0,0,0,0,0,0,0,0,0,0,0,4365978],
      ebitda:       [0,0,0,0,0,0,0,0,0,0,0,-341882],
      ebit:         [0,0,0,0,0,0,0,0,0,0,0,-352808],
      profit_loss:  [0,0,0,0,0,0,0,0,0,0,0,-259931],
    },
    2025: {
      revenue:      [222699,337146,538658,332140,504807,330131,510311,176752,220604,384268,581755,487484],
      ebitda:       [-25066,44989,164189,-72926,146009,-166311,38688,-70478,-35603,-45325,105017,91295],
      ebit:         [-26082,44057,163144,-73936,144970,-167318,37713,-71302,-36403,-46094,104239,90489],
      profit_loss:  [-26082,43403,163134,-73927,144945,-167325,36785,-71583,-36234,-46622,104171,13717],
    },
    2026: {
      revenue:      [336743,353580,371259,389822,409313,429779,451268,473831,497523,522399,548519,575945],
      ebitda:       [-74043,-73984,-56305,-43336,-23844,-3379,18110,40674,64365,89241,115361,142787],
      ebit:         [-74947,-74888,-57209,-44240,-24749,-4283,17206,39769,63461,88337,114457,141883],
      profit_loss:  [-77179,-75087,-57408,-44439,-24948,-4482,17007,39570,63262,88138,114258,141684],
    },
  },
  developments: {
    2024: {
      revenue: Array(12).fill(0),
      ebitda:  [0,0,0,0,0,0,0,0,0,0,0,-14609],
      ebit:    [0,0,0,0,0,0,0,0,0,0,0,-14609],
      profit_loss: [0,0,0,0,0,0,0,0,0,0,0,-14609],
    },
    2025: {
      revenue: Array(12).fill(0),
      ebitda:  [-3547,-10437,-3368,-554,-149,-403,52386,-889,-3089,-321,-98,-188],
      ebit:    [-3547,-10437,-3368,-554,-149,-403,52386,-889,-3089,-321,-98,-188],
      profit_loss: [-3547,-10437,-3368,-554,-149,-403,52386,-889,-3089,-321,-98,-188],
    },
    2026: {
      revenue: Array(12).fill(0),
      ebitda:  [-506,0,0,0,0,0,0,0,0,0,0,0],
      ebit:    [-506,0,0,0,0,0,0,0,0,0,0,0],
      profit_loss: [-506,0,0,0,0,0,0,0,0,0,0,0],
    },
  },
}

const DEADLINES = [
  {month:'JAN',deadline:'18 Feb 2026'},
  {month:'FEB',deadline:'18 Mar 2026'},
  {month:'MAR',deadline:'15 Apr 2026'},
  {month:'APR',deadline:'18 May 2026'},
  {month:'MAY',deadline:'18 Jun 2026'},
  {month:'JUN',deadline:'18 Aug 2026', note:'No Jul reporting'},
  {month:'JUL',deadline:'18 Aug 2026'},
  {month:'AUG',deadline:'17 Sep 2026'},
  {month:'SEP',deadline:'18 Oct 2026'},
  {month:'OCT',deadline:'18 Nov 2026'},
  {month:'NOV',deadline:'17 Dec 2026'},
  {month:'DEC',deadline:'18 Jan 2027'},
]

const ENTITIES = [
  { key:'group',        label:'Strand Group',         accent:'#60a5fa', subtitle:'Consolidated' },
  { key:'sfg',          label:'Family Group Oy',       accent:'#a78bfa', subtitle:'SFG Oy' },
  { key:'digital',      label:'Digital Oy',            accent:'#34d399', subtitle:'Strand Digital' },
  { key:'properties',   label:'Properties Oy',         accent:'#f59e0b', subtitle:'Strand Properties' },
  { key:'spain',        label:'Properties SL',         accent:'#fb923c', subtitle:'Spain' },
  { key:'developments', label:'Developments Oy',       accent:'#94a3b8', subtitle:'Strand Dev' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const sum      = arr => (arr||[]).reduce((a,b) => a + (b||0), 0)
const fmt      = (n, short=false) => {
  if (n === null || n === undefined || isNaN(n)) return '–'
  const abs = Math.abs(n)
  if (short && abs >= 1000000) return (n/1000000).toFixed(2) + 'M'
  if (short && abs >= 1000)    return (n/1000).toFixed(0) + 'k'
  return new Intl.NumberFormat('fi-FI', {style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n)
}
const pct      = n => (n===null||isNaN(n)) ? '–' : (n*100).toFixed(1) + '%'
const vc       = n => (n||0) >= 0 ? '#34d399' : '#f87171'

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, color=ACCENT }) => (
  <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:'14px 18px',position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:color}}/>
    <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',color:'#475569',textTransform:'uppercase',marginBottom:6}}>{label}</div>
    <div style={{fontSize:20,fontWeight:700,color:'#f1f5f9',fontFamily:'monospace'}}>{value}</div>
    {sub && <div style={{fontSize:11,color:'#475569',marginTop:3}}>{sub}</div>}
  </div>
)

const ST = ({ children, mt=28 }) => (
  <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'#334155',marginBottom:12,marginTop:mt,paddingBottom:6,borderBottom:'1px solid rgba(255,255,255,0.05)'}}>{children}</div>
)

const YBtn = ({ year, label, active, onClick }) => (
  <button onClick={onClick} style={{padding:'4px 14px',borderRadius:16,border:'none',cursor:'pointer',background:active?ACCENT:'rgba(255,255,255,0.05)',color:active?'#080b12':'#64748b',fontWeight:700,fontSize:12,fontFamily:'inherit',transition:'all 0.12s'}}>{label||year}</button>
)

const TT = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'10px 14px',fontSize:11}}>
      <div style={{color:'#64748b',marginBottom:5,fontWeight:700}}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{color:p.color||p.fill,marginBottom:2}}>{p.name}: <strong>{fmt(p.value,true)}</strong></div>)}
    </div>
  )
}

// ─── ENTITY P&L CARD (used in overview) ───────────────────────────────────────
function EntityCard({ ent, yr, onClick, active }) {
  const d = SEED[ent.key]?.[yr] || {}
  const rev  = sum(d.revenue)
  const ebit = sum(d.ebit)
  const net  = sum(d.profit_loss)
  return (
    <div onClick={onClick} style={{background:active?'rgba(96,165,250,0.08)':'rgba(255,255,255,0.02)',border:`1px solid ${active?ent.accent:'rgba(255,255,255,0.07)'}`,borderRadius:10,padding:'14px 16px',cursor:'pointer',transition:'all 0.15s',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:ent.accent}}/>
      <div style={{fontSize:11,fontWeight:700,color:'#f1f5f9',marginBottom:2}}>{ent.label}</div>
      <div style={{fontSize:10,color:'#475569',marginBottom:10}}>{ent.subtitle}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
        <div><div style={{fontSize:9,color:'#334155',textTransform:'uppercase',letterSpacing:'0.08em'}}>Revenue</div><div style={{fontSize:14,fontWeight:700,fontFamily:'monospace',color:'#94a3b8'}}>{fmt(rev,true)}</div></div>
        <div><div style={{fontSize:9,color:'#334155',textTransform:'uppercase',letterSpacing:'0.08em'}}>Net P/L</div><div style={{fontSize:14,fontWeight:700,fontFamily:'monospace',color:vc(net)}}>{fmt(net,true)}</div></div>
      </div>
    </div>
  )
}

// ─── P&L VIEW ─────────────────────────────────────────────────────────────────
function PLView({ entityKey }) {
  const [yr, setYr] = useState(2025)
  const ent   = ENTITIES.find(e => e.key === entityKey)
  const d     = SEED[entityKey]?.[yr] || {}
  const color = ent?.accent || ACCENT

  const tRev  = sum(d.revenue)
  const tMat  = sum(d.materials)
  const tEmp  = sum(d.employee_cost)
  const tEB   = sum(d.ebitda)
  const tEBIT = sum(d.ebit)
  const tNet  = sum(d.profit_loss)
  const grossPct = tRev !== 0 ? (tRev + tMat) / tRev : 0
  const netPct   = tRev !== 0 ? tNet / tRev : 0

  const prevD   = SEED[entityKey]?.[yr-1] || {}
  const prevRev = sum(prevD.revenue||[])
  const revGrowth = prevRev !== 0 ? ((tRev - prevRev) / Math.abs(prevRev)) * 100 : null

  const chartData = MONTHS.map((m,i) => ({
    month:m,
    Revenue:       (d.revenue||[])[i]||0,
    EBITDA:        (d.ebitda||[])[i]||0,
    EBIT:          (d.ebit||[])[i]||0,
    'Net Profit':  (d.profit_loss||[])[i]||0,
  }))

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20,alignItems:'center',flexWrap:'wrap'}}>
        <YBtn year={2024} active={yr===2024} onClick={()=>setYr(2024)}/>
        <YBtn year={2025} active={yr===2025} onClick={()=>setYr(2025)}/>
        <YBtn year={2026} label="2026 BUD" active={yr===2026} onClick={()=>setYr(2026)}/>
        {revGrowth !== null && (
          <span style={{fontSize:11,color:revGrowth>=0?'#34d399':'#f87171',marginLeft:4}}>
            {revGrowth>=0?'▲':'▼'} {Math.abs(revGrowth).toFixed(1)}% vs {yr-1}
          </span>
        )}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:22}}>
        <KPI label="Revenue"    value={fmt(tRev,true)}    color={color}/>
        <KPI label="Gross %"    value={pct(grossPct)}     color={vc(grossPct)}/>
        <KPI label="EBITDA"     value={fmt(tEB,true)}     color={vc(tEB)}/>
        <KPI label="EBIT"       value={fmt(tEBIT,true)}   color={vc(tEBIT)}/>
        <KPI label="Net Profit" value={fmt(tNet,true)}    color={vc(tNet)} sub={pct(netPct)+' margin'}/>
      </div>

      <ST>Monthly Revenue & Profitability — {yr}{yr===2026?' (BUD)':' (ACT)'}</ST>
      <div style={{height:230,marginBottom:22}}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{top:0,right:0,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>}/>
            <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
            <Bar dataKey="Revenue" fill={color} opacity={0.7} radius={[2,2,0,0]}/>
            <Line type="monotone" dataKey="EBITDA"    stroke="#f59e0b" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="EBIT"      stroke="#34d399" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="Net Profit" stroke="#f87171" strokeWidth={2} dot={false} strokeDasharray="4 3"/>
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)"/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ST>Year-on-Year Revenue Comparison</ST>
      <div style={{height:180,marginBottom:22}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MONTHS.map((m,i) => ({
            month:m,
            '2024 ACT': (SEED[entityKey]?.[2024]?.revenue||[])[i]||0,
            '2025 ACT': (SEED[entityKey]?.[2025]?.revenue||[])[i]||0,
            '2026 BUD': (SEED[entityKey]?.[2026]?.revenue||[])[i]||0,
          }))} margin={{top:0,right:0,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>}/>
            <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
            <Line type="monotone" dataKey="2024 ACT" stroke="#475569" strokeWidth={2} dot={false} strokeDasharray="4 3"/>
            <Line type="monotone" dataKey="2025 ACT" stroke="#64748b" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="2026 BUD" stroke={color}   strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ST>Monthly P&L Table — {yr}</ST>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',fontSize:11,fontFamily:'monospace'}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              <th style={{textAlign:'left',padding:'7px 10px',color:'#475569',minWidth:140}}>Line</th>
              {MONTHS.map(m => <th key={m} style={{textAlign:'right',padding:'7px 5px',color:'#475569',minWidth:58}}>{m}</th>)}
              <th style={{textAlign:'right',padding:'7px 10px',color:'#475569'}}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {[
              {l:'Revenue',      a:d.revenue,      c:'#e2e8f0'},
              {l:'Materials',    a:d.materials,     c:'#94a3b8'},
              {l:'Employee',     a:d.employee_cost, c:'#94a3b8'},
              {l:'EBITDA',       a:d.ebitda,        c:null, b:true},
              {l:'Depreciation', a:d.dep_tangible,  c:'#64748b'},
              {l:'EBIT',         a:d.ebit,          c:null, b:true},
              {l:'Net Profit',   a:d.profit_loss,   c:null, b:true},
            ].map(({l,a,c,b}) => {
              const tot = sum(a||[])
              const isDyn = c === null
              return (
                <tr key={l} style={{borderBottom:'1px solid rgba(255,255,255,0.03)',background:b?'rgba(255,255,255,0.02)':'transparent'}}>
                  <td style={{padding:'5px 10px',color:isDyn?vc(tot):c,fontWeight:b?700:400}}>{l}</td>
                  {(a||[]).map((v,i) => (
                    <td key={i} style={{textAlign:'right',padding:'5px 5px',color:isDyn?vc(v):c,fontWeight:b?700:400}}>{v!==0?fmt(v,true):'–'}</td>
                  ))}
                  <td style={{textAlign:'right',padding:'5px 10px',color:isDyn?vc(tot):c,fontWeight:700}}>{fmt(tot,true)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── BALANCE SHEET VIEW ───────────────────────────────────────────────────────
function BSView() {
  const [yr, setYr] = useState(2025)
  const bs = SEED.group.bs[yr] || {}
  const tA = bs.total_assets || 0
  const tE = bs.total_equity || 0
  const tL = bs.total_liabilities || 0
  const eqR = tA !== 0 ? tE/tA : 0

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        <YBtn year={2024} active={yr===2024} onClick={()=>setYr(2024)}/>
        <YBtn year={2025} active={yr===2025} onClick={()=>setYr(2025)}/>
        <YBtn year={2026} label="2026 BUD" active={yr===2026} onClick={()=>setYr(2026)}/>
        <span style={{fontSize:11,color:'#334155',marginLeft:4}}>DEC snapshot · Consolidated</span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:22}}>
        <KPI label="Total Assets"  value={fmt(tA,true)}  color={ACCENT}/>
        <KPI label="Total Equity"  value={fmt(tE,true)}  color={vc(tE)}/>
        <KPI label="Equity Ratio"  value={pct(eqR)}      color={vc(eqR)}/>
        <KPI label="Cash"          value={fmt(bs.cash,true)} color="#f59e0b"/>
        <KPI label="LT Loan"       value={fmt(bs.long_term_loan,true)} color="#94a3b8"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:22}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#475569',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.1em'}}>Assets</div>
          {[
            {l:'Intangible Assets',   v:bs.intangible},
            {l:'Tangible Assets',     v:bs.tangible},
            {l:'LT Investments',      v:bs.lt_invest},
            {l:'Total Non-Current',   v:bs.total_noncurrent, b:true},
            {l:'Inventory',           v:bs.inventory,  indent:true},
            {l:'Trade Receivables',   v:bs.trade_rec,  indent:true},
            {l:'Cash & Equivalents',  v:bs.cash,       indent:true},
            {l:'Total Current',       v:bs.total_current, b:true},
            {l:'TOTAL ASSETS',        v:tA, b:true},
          ].map(({l,v,b,indent}) => (
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 10px',background:b?'rgba(255,255,255,0.04)':'transparent',borderRadius:4,marginBottom:2}}>
              <span style={{fontSize:11,color:indent?'#475569':'#94a3b8',fontWeight:b?700:400,paddingLeft:indent?12:0}}>{l}</span>
              <span style={{fontSize:11,color:b?'#f1f5f9':'#64748b',fontFamily:'monospace',fontWeight:b?700:400}}>{fmt(v,true)}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#475569',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.1em'}}>Equity & Liabilities</div>
          {[
            {l:'Retained Earnings',  v:bs.retained_earnings},
            {l:'TOTAL EQUITY',       v:tE, b:true, color:vc(tE)},
            {l:'Long-term Loan',     v:bs.long_term_loan},
            {l:'Trade Payables',     v:bs.trade_payables},
            {l:'TOTAL LIABILITIES',  v:tL, b:true},
          ].map(({l,v,b,color}) => (
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 10px',background:b?'rgba(255,255,255,0.04)':'transparent',borderRadius:4,marginBottom:2}}>
              <span style={{fontSize:11,color:'#94a3b8',fontWeight:b?700:400}}>{l}</span>
              <span style={{fontSize:11,color:color||(b?'#f1f5f9':'#64748b'),fontFamily:'monospace',fontWeight:b?700:400}}>{fmt(v,true)}</span>
            </div>
          ))}
        </div>
      </div>

      <ST>Group vs Entities — Revenue {yr===2026?'(BUD)':'(ACT)'}</ST>
      <div style={{height:200,marginBottom:22}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ENTITIES.filter(e=>e.key!=='group').map(e => ({
            name: e.label.replace(' Oy','').replace(' SL',''),
            Revenue: sum(SEED[e.key]?.[yr]?.revenue||[]),
            color: e.accent,
          }))} margin={{top:0,right:0,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="name" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>}/>
            <Bar dataKey="Revenue" fill={ACCENT} opacity={0.8} radius={[2,2,0,0]}/>
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── OVERVIEW VIEW ────────────────────────────────────────────────────────────
function OverviewView({ onEntityClick }) {
  const [yr, setYr] = useState(2025)
  const grp = SEED.group[yr] || {}
  const tRev = sum(grp.revenue)
  const tNet = sum(grp.profit_loss)
  const tEB  = sum(grp.ebitda)

  const waterfall = ENTITIES.filter(e=>e.key!=='group').map(e => {
    const net = sum(SEED[e.key]?.[yr]?.profit_loss||[])
    return { name: e.label.replace(' Oy','').replace(' SL',''), value: net, color: vc(net) }
  })

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        <YBtn year={2024} active={yr===2024} onClick={()=>setYr(2024)}/>
        <YBtn year={2025} active={yr===2025} onClick={()=>setYr(2025)}/>
        <YBtn year={2026} label="2026 BUD" active={yr===2026} onClick={()=>setYr(2026)}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:22}}>
        <KPI label="Group Revenue"  value={fmt(tRev,true)}  color={ACCENT}/>
        <KPI label="Group EBITDA"   value={fmt(tEB,true)}   color={vc(tEB)}/>
        <KPI label="Group Net P/L"  value={fmt(tNet,true)}  color={vc(tNet)}/>
        <KPI label="Net Margin"     value={tRev?pct(tNet/tRev):'–'} color={vc(tNet)}/>
      </div>

      <ST>Entity Summary — click to drill in</ST>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:24}}>
        {ENTITIES.map(ent => (
          <EntityCard key={ent.key} ent={ent} yr={yr} onClick={()=>onEntityClick(ent.key)} active={false}/>
        ))}
      </div>

      <ST>Net Profit / Loss by Entity — {yr}</ST>
      <div style={{height:200,marginBottom:22}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={waterfall} margin={{top:0,right:0,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="name" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>}/>
            <Bar dataKey="value" name="Net P/L" fill={ACCENT} opacity={0.8} radius={[2,2,0,0]}/>
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ST>Group Revenue Trend 2024–2026</ST>
      <div style={{height:180,marginBottom:22}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MONTHS.map((m,i) => ({
            month:m,
            '2024 ACT': (SEED.group[2024].revenue||[])[i]||0,
            '2025 ACT': (SEED.group[2025].revenue||[])[i]||0,
            '2026 BUD': (SEED.group[2026].revenue||[])[i]||0,
          }))} margin={{top:0,right:0,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>}/>
            <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
            <Line type="monotone" dataKey="2024 ACT" stroke="#475569" strokeWidth={2} dot={false} strokeDasharray="4 3"/>
            <Line type="monotone" dataKey="2025 ACT" stroke="#64748b" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="2026 BUD" stroke={ACCENT}  strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── DEADLINES VIEW ───────────────────────────────────────────────────────────
function DeadlinesView() {
  const today = new Date()
  return (
    <div>
      <ST mt={0}>Reporting Deadlines 2026</ST>
      <div style={{overflowX:'auto',marginBottom:24}}>
        <table style={{width:'100%',fontSize:12}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              {['Month','Deadline','Note','Status'].map(h =>
                <th key={h} style={{textAlign:'left',padding:'8px 12px',color:'#475569',fontWeight:700}}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {DEADLINES.map((d,i) => {
              const dl = new Date(d.deadline)
              const ip = dl < today
              const is = !ip && (dl - today) < 14*24*3600*1000
              const sc = ip?'#334155':is?'#f59e0b':'#34d399'
              return (
                <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',opacity:ip?0.5:1}}>
                  <td style={{padding:'9px 12px',fontWeight:700,color:'#f1f5f9'}}>{d.month}</td>
                  <td style={{padding:'9px 12px'}}><span style={{color:sc,fontWeight:600}}>{d.deadline}</span></td>
                  <td style={{padding:'9px 12px',color:'#475569',fontSize:11}}>{d.note||''}</td>
                  <td style={{padding:'9px 12px'}}><span style={{fontSize:10,color:sc,background:`${sc}20`,padding:'2px 8px',borderRadius:8}}>{ip?'DONE':is?'SOON':'OPEN'}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onSuccess }) {
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState(false)
  const attempt = () => {
    if (pw === PASSWORD) { sessionStorage.setItem(SESSION_KEY,'1'); onSuccess() }
    else { setErr(true); setTimeout(()=>setErr(false),1500) }
  }
  return (
    <div style={{minHeight:'100vh',background:'#080b12',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Mono','Courier New',monospace"}}>
      <div style={{width:340,textAlign:'center'}}>
        <div style={{fontSize:11,letterSpacing:'0.3em',color:'#334155',marginBottom:12,textTransform:'uppercase'}}>Board Dashboard</div>
        <div style={{fontSize:28,fontWeight:800,letterSpacing:'-0.03em',color:'#f1f5f9',marginBottom:4}}>Strand Group</div>
        <div style={{width:40,height:2,background:ACCENT,margin:'0 auto 32px'}}/>
        <input
          type="password" placeholder="Enter password" value={pw}
          onChange={e=>setPw(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&attempt()}
          style={{width:'100%',padding:'13px 16px',background:'rgba(255,255,255,0.04)',border:`1px solid ${err?'#f87171':'rgba(255,255,255,0.1)'}`,borderRadius:8,color:'#f1f5f9',fontSize:14,outline:'none',fontFamily:'inherit',marginBottom:10}}
          autoFocus
        />
        <button onClick={attempt} style={{width:'100%',padding:'13px',background:ACCENT,border:'none',borderRadius:8,color:'#080b12',fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>ENTER</button>
        {err && <div style={{marginTop:10,color:'#f87171',fontSize:13}}>Incorrect password</div>}
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TOP_TABS = [
  { id:'overview',  label:'Overview' },
  { id:'pl',        label:'P & L' },
  { id:'bs',        label:'Balance Sheet' },
  { id:'deadlines', label:'Deadlines' },
]

export default function App() {
  const [authed,      setAuthed]      = useState(!!sessionStorage.getItem(SESSION_KEY))
  const [topTab,      setTopTab]      = useState('overview')
  const [entityKey,   setEntityKey]   = useState('group')
  const [dbStatus,    setDbStatus]    = useState('idle')

  useEffect(() => { if (authed) checkDb() }, [authed])

  const checkDb = async () => {
    if (!supabase) { setDbStatus('offline'); return }
    setDbStatus('loading')
    try {
      const { data, error } = await supabase.from('dashboard_pnl').select('id').eq('client', CLIENT).limit(1)
      if (error) throw error
      setDbStatus('ok')
    } catch { setDbStatus('error') }
  }

  if (!authed) return <Login onSuccess={() => setAuthed(true)}/>

  const activeEnt = ENTITIES.find(e => e.key === entityKey) || ENTITIES[0]

  return (
    <div style={{minHeight:'100vh',background:'#080b12',color:'#e2e8f0',fontFamily:"'DM Mono','Courier New',monospace"}}>
      <header style={{borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 28px',display:'flex',alignItems:'center',justifyContent:'space-between',height:52,position:'sticky',top:0,zIndex:100,background:'rgba(8,11,18,0.97)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{fontSize:16,fontWeight:800,letterSpacing:'-0.02em',color:'#f1f5f9'}}>Strand Group</div>
          <div style={{width:1,height:16,background:'rgba(255,255,255,0.08)'}}/>
          <div style={{fontSize:11,color:'#334155',letterSpacing:'0.05em'}}>Board Dashboard</div>
        </div>
        <nav style={{display:'flex',gap:2}}>
          {TOP_TABS.map(t => (
            <button key={t.id} onClick={()=>setTopTab(t.id)} style={{padding:'5px 14px',borderRadius:6,border:'none',cursor:'pointer',background:topTab===t.id?`${ACCENT}20`:'transparent',color:topTab===t.id?ACCENT:'#475569',fontWeight:topTab===t.id?700:400,fontSize:12,fontFamily:'inherit',transition:'all 0.12s'}}>{t.label}</button>
          ))}
        </nav>
        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'#334155'}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:dbStatus==='ok'?'#34d399':dbStatus==='loading'?'#f59e0b':dbStatus==='offline'?'#475569':'#f87171',display:'inline-block'}}/>
          {dbStatus==='ok'?'Supabase':dbStatus==='loading'?'Syncing…':dbStatus==='offline'?'Offline':'Error'}
        </div>
      </header>

      {/* Entity sub-nav for P&L tab */}
      {topTab === 'pl' && (
        <div style={{borderBottom:'1px solid rgba(255,255,255,0.04)',padding:'0 28px',display:'flex',gap:4,overflowX:'auto'}}>
          {ENTITIES.map(e => (
            <button key={e.key} onClick={()=>setEntityKey(e.key)} style={{padding:'8px 14px',borderBottom:`2px solid ${entityKey===e.key?e.accent:'transparent'}`,border:'none',background:'transparent',color:entityKey===e.key?e.accent:'#475569',fontWeight:entityKey===e.key?700:400,fontSize:11,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',transition:'all 0.1s'}}>{e.label}</button>
          ))}
        </div>
      )}

      <main style={{padding:'24px 28px',maxWidth:1400,margin:'0 auto'}}>
        <h1 style={{fontSize:18,fontWeight:800,color:'#f1f5f9',marginBottom:22,letterSpacing:'-0.02em',display:'flex',alignItems:'center',gap:10}}>
          {topTab==='pl' ? (
            <>
              <span style={{color:activeEnt.accent}}>{activeEnt.label}</span>
              <span style={{fontSize:12,color:'#334155',fontWeight:400}}>P&L · 2024–2026 · ACT + BUD</span>
            </>
          ) : topTab==='overview' ? (
            <>Overview <span style={{fontSize:12,color:'#334155',fontWeight:400}}>All entities · 2024–2026</span></>
          ) : topTab==='bs' ? (
            <>Balance Sheet <span style={{fontSize:12,color:'#334155',fontWeight:400}}>Consolidated · DEC snapshot</span></>
          ) : (
            <>Deadlines <span style={{fontSize:12,color:'#334155',fontWeight:400}}>2026</span></>
          )}
        </h1>

        {topTab === 'overview'  && <OverviewView onEntityClick={key => { setEntityKey(key); setTopTab('pl') }}/>}
        {topTab === 'pl'        && <PLView entityKey={entityKey}/>}
        {topTab === 'bs'        && <BSView/>}
        {topTab === 'deadlines' && <DeadlinesView/>}
      </main>

      <div style={{textAlign:'center',padding:'18px',borderTop:'1px solid rgba(255,255,255,0.04)',fontSize:11,color:'#1e293b'}}>
        Strand Group · Board Dashboard · Confidential · {new Date().getFullYear()}
      </div>
    </div>
  )
}
