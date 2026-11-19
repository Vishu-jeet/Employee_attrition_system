import { useEffect, useMemo, useState } from 'react'
import { Activity, Users, UserRoundX, BriefcaseBusiness, LayoutDashboard, BarChart3, BrainCircuit, Database, ShieldCheck, Search, Bell, Settings, ChevronDown, RefreshCw, Menu, X, ArrowUpRight, Zap } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts'

const API = 'http://127.0.0.1:8000'
const nav = [
    ['overview', 'Overview', LayoutDashboard, 'WORKSPACE'],
    ['analytics', 'People analytics', BarChart3, 'WORKSPACE'],
    ['predict', 'Attrition prediction', BrainCircuit, 'WORKSPACE'],
    ['employees', 'Employee records', Users, 'MANAGEMENT'],
    ['model', 'Model performance', Activity, 'MANAGEMENT'],
    ['dataset', 'Dataset management', Database, 'MANAGEMENT'],
    ['about', 'About project', ShieldCheck, 'GENERAL']
]
const initial = { Age: 29, Department: 'IT', JobRole: 'Developer', MonthlyIncome: 55000, YearsAtCompany: 3, JobSatisfaction: 3, WorkLifeBalance: 3, OverTime: 'No', PerformanceRating: 3 }
const fmt = n => Number(n || 0).toLocaleString('en-IN')
const palette = ['#3979ef', '#9584ed', '#24ae91', '#e6aa4c']
function Card({ children, className = '' }) { return <section className={`card ${className}`}>{children}</section> }
function Heading({ eyebrow, title, desc, action }) { return <div className="heading"><div><small>{eyebrow}</small><h1>{title}</h1><p>{desc}</p></div>{action}</div> }
function Stat({ title, value, note, Icon, tone }) { return <Card className="stat"><div className={`staticon ${tone}`}><Icon size={19} /></div><small>{title}</small><strong>{value ?? '—'}</strong><p>{note}</p></Card> }
function Tip({ active, payload, label }) { if (!active || !payload?.length) return null; return <div className="tip"><b>{label || payload[0].name}</b>{payload.map((p, i) => <div key={i}>{p.name}: <strong>{fmt(p.value)}</strong></div>)}</div> }
function Overview({ s, a, setPage }) {
    const d = a?.department || []
    return <><Heading eyebrow="WORKSPACE / OVERVIEW" title="Workforce overview" desc="A clear snapshot of your generated sample workforce." action={<button className="btn secondary" onClick={() => setPage('analytics')}><BarChart3 size={16} /> Explore analytics</button>} />
        <div className="notice"><ShieldCheck size={17} /> Demo workspace — all employee records are synthetic sample data.</div>
        <div className="stats">{[
            ['Employee records', fmt(s?.totalEmployees), 'Generated sample rows', Users, 'blue'],
            ['Attrition cases', fmt(s?.attritionCount), 'Sample attrition labels', UserRoundX, 'purple'],
            ['Attrition rate', s ? `${s.attritionRate}%` : '—', 'Share of sample records', Activity, 'orange'],
            ['Retained records', fmt(s?.retainedCount), 'Sample retained labels', BriefcaseBusiness, 'green']
        ].map(([t, v, n, I, c]) => <Stat key={t} title={t} value={v} note={n} Icon={I} tone={c} />)}</div>
        <div className="twocol">
            <Card><div className="cardhead"><div><h3>Employees by department</h3><p>Sample workforce distribution</p></div><span className="tag">By team</span></div><div className="chart"><ResponsiveContainer><BarChart data={d}><CartesianGrid vertical={false} stroke="#edf1f6" /><XAxis dataKey="Department" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip content={<Tip />} /><Bar dataKey="employees" name="Employees" fill="#3979ef" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
            <Card><div className="cardhead"><div><h3>Attrition distribution</h3><p>Retained versus left labels</p></div><span className="tag">Dataset</span></div><div className="donut"><div className="chart"><ResponsiveContainer><PieChart><Pie data={a?.attritionDistribution || []} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={4}>{(a?.attritionDistribution || []).map((x, i) => <Cell key={x.name} fill={i ? '#9584ed' : '#3979ef'} />)}</Pie><Tooltip content={<Tip />} /></PieChart></ResponsiveContainer></div><div className="legend">{(a?.attritionDistribution || []).map((x, i) => <div key={x.name}><i style={{ background: i ? '#9584ed' : '#3979ef' }} />{x.name}<b>{fmt(x.value)}</b></div>)}</div></div></Card></div>
        <div className="twocol lower"><Card><div className="cardhead"><div><h3>Department snapshot</h3><p>Employee and attrition counts</p></div><button className="linkbtn" onClick={() => setPage('analytics')}>Full report ↗</button></div><div className="simpletable"><div><b>Department</b><b>Employees</b><b>Attrition</b><b>Rate</b></div>{d.map(x => <div key={x.Department}><span>{x.Department}</span><span>{x.employees}</span><span>{x.attrition}</span><b>{x.attritionRate}%</b></div>)}</div></Card><Card className="callout"><div className="callicon"><Zap /></div><small>PROJECT EXPLORATION</small><h3>Try an attrition prediction</h3><p>Submit a fictional employee profile to explore the model's output.</p><button className="btn primary" onClick={() => setPage('predict')}>Open prediction <ArrowUpRight size={15} /></button></Card></div></>
}
function Analytics({ a }) {
    return <><Heading eyebrow="WORKSPACE / PEOPLE ANALYTICS" title="People analytics" desc="Explore department, satisfaction, income and overtime patterns." /><div className="notice"><Database size={17} /> All charts are calculated from the generated synthetic dataset.</div><div className="twocol">
        <Card><div className="cardhead"><div><h3>Attrition by department</h3><p>Retained and attrition sample labels</p></div></div><div className="chart tall"><ResponsiveContainer><BarChart data={a?.department || []}><CartesianGrid vertical={false} stroke="#edf1f6" /><XAxis dataKey="Department" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip content={<Tip />} /><Legend /><Bar dataKey="retained" stackId="x" fill="#3979ef" /><Bar dataKey="attrition" stackId="x" fill="#9584ed" /></BarChart></ResponsiveContainer></div></Card>
        <Card><div className="cardhead"><div><h3>Job satisfaction</h3><p>Number of records at each level</p></div></div><div className="chart tall"><ResponsiveContainer><AreaChart data={a?.satisfaction || []}><defs><linearGradient id="fillSat" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3979ef" stopOpacity=".25" /><stop offset="100%" stopColor="#3979ef" stopOpacity="0" /></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf1f6" /><XAxis dataKey="label" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip content={<Tip />} /><Area dataKey="employees" stroke="#3979ef" strokeWidth={3} fill="url(#fillSat)" /></AreaChart></ResponsiveContainer></div></Card>
        <Card><div className="cardhead"><div><h3>Monthly income bands</h3><p>Distribution across income ranges</p></div></div><div className="chart"><ResponsiveContainer><BarChart data={a?.income || []}><CartesianGrid vertical={false} stroke="#edf1f6" /><XAxis dataKey="band" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip content={<Tip />} /><Bar dataKey="employees" fill="#24ae91" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
        <Card><div className="cardhead"><div><h3>Overtime categories</h3><p>Sample records by overtime value</p></div></div><div className="chart"><ResponsiveContainer><BarChart data={a?.overtime || []}><CartesianGrid vertical={false} stroke="#edf1f6" /><XAxis dataKey="OverTime" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip content={<Tip />} /><Bar dataKey="employees" fill="#9584ed" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></Card></div></>
}
function Predict() {
    const [f, F] = useState(initial), [r, R] = useState(null), [err, E] = useState(''), [busy, B] = useState(false); const set = (k, v) => F(o => ({ ...o, [k]: v })); const fields = [['Age', 'Age', null], ['Department', 'Department', ['IT', 'Sales', 'Research', 'Human Resources']], ['Job role', 'JobRole', ['Developer', 'Analyst', 'Manager', 'Executive']], ['Monthly income', 'MonthlyIncome', null], ['Years at company', 'YearsAtCompany', null], ['Job satisfaction', 'JobSatisfaction', ['1', '2', '3', '4']], ['Work-life balance', 'WorkLifeBalance', ['1', '2', '3', '4']], ['Overtime', 'OverTime', ['No', 'Yes']], ['Performance rating', 'PerformanceRating', ['1', '2', '3', '4']]];
    async function go(e) { e.preventDefault(); B(true); E(''); R(null); try { const body = { ...f, Age: +f.Age, MonthlyIncome: +f.MonthlyIncome, YearsAtCompany: +f.YearsAtCompany, JobSatisfaction: +f.JobSatisfaction, WorkLifeBalance: +f.WorkLifeBalance, PerformanceRating: +f.PerformanceRating }; const res = await fetch(API + '/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const data = await res.json(); if (!res.ok) throw Error(data.detail || 'Prediction failed'); R(data) } catch (x) { E(x.message) } finally { B(false) } }
    return <><Heading eyebrow="WORKSPACE / PREDICTION" title="Attrition prediction" desc="Submit a fictional employee profile to test the trained Random Forest model." /><div className="notice"><ShieldCheck size={17} /> Educational use only. Never use this sample model to make real employment decisions.</div><div className="predictgrid"><Card><div className="cardhead"><div><h3>Employee profile</h3><p>Enter the nine model input fields.</p></div><span className="tag">9 inputs</span></div><form className="form" onSubmit={go}>{fields.map(([label, key, opts]) => <label key={key}>{label}{opts ? <select value={f[key]} onChange={e => set(key, e.target.value)}>{opts.map(v => <option key={v} value={v}>{['1', '2', '3', '4'].includes(v) ? `${v} / 4` : v}</option>)}</select> : <input type="number" required value={f[key]} onChange={e => set(key, e.target.value)} />}</label>)}<div className="formactions"><button className="btn primary" disabled={busy}>{busy ? 'Analysing…' : 'Generate prediction'}</button><button type="button" className="btn secondary" onClick={() => { F(initial); R(null); E('') }}>Reset</button></div></form></Card><div className="stack"><Card className="result"><small>MODEL OUTPUT</small><h3>Prediction result</h3>{!r && !err ? <div className="empty"><BrainCircuit size={28} /><b>Ready to analyse</b><p>Your prediction appears here after submission.</p></div> : null}{err ? <p className="err">{err}</p> : null}{r ? <><div className={`risk ${r.class ? 'high' : 'low'}`}>{r.class ? 'Higher' : 'Lower'} predicted attrition risk</div><div className="prob">{(r.probability * 100).toFixed(1)}<small>%</small></div><div className="track"><div style={{ width: `${r.probability * 100}%` }} className={r.class ? 'high' : ''} /></div><p className="muted">Estimated probability for the positive attrition class.</p><div className="disclaimer">{r.disclaimer}</div></> : null}</Card><Card><small>INTERPRETATION</small><h3>Probability is not certainty</h3><p className="muted">This statistical estimate comes from synthetic training data and is not a statement about any real employee.</p></Card></div></div></>
}
function Employees({ rows }) { const [q, Q] = useState(''), [dep, D] = useState('All'); const deps = ['All', ...new Set(rows.map(x => x.Department))]; const data = useMemo(() => rows.filter(x => (dep === 'All' || x.Department === dep) && `${x.Department} ${x.JobRole} ${x.OverTime}`.toLowerCase().includes(q.toLowerCase())), [rows, q, dep]); return <><Heading eyebrow="MANAGEMENT / EMPLOYEE RECORDS" title="Employee records" desc="Browse the first 100 generated sample records." /><Card><div className="toolbar"><div><h3>Sample employee dataset</h3><p>{data.length} matching records</p></div><div className="filters"><div className="search"><Search size={15} /><input placeholder="Search department or role" value={q} onChange={e => Q(e.target.value)} /></div><select value={dep} onChange={e => D(e.target.value)}>{deps.map(x => <option key={x}>{x}</option>)}</select></div></div><div className="tablewrap"><table><thead><tr><th>Age</th><th>Department</th><th>Job role</th><th>Monthly income</th><th>Tenure</th><th>Overtime</th><th>Label</th></tr></thead><tbody>{data.map((x, i) => <tr key={i}><td>{x.Age}</td><td>{x.Department}</td><td>{x.JobRole}</td><td>₹{fmt(x.MonthlyIncome)}</td><td>{x.YearsAtCompany} yrs</td><td>{x.OverTime}</td><td><span className={`pill ${x.Attrition ? 'left' : 'stay'}`}>{x.Attrition ? 'Left' : 'Retained'}</span></td></tr>)}</tbody></table>{!data.length ? <p className="muted">No matching rows.</p> : null}</div></Card></> }
function Model({ m }) { const rows = [['Accuracy', m?.accuracy], ['Precision', m?.precision], ['Recall', m?.recall], ['F1-score', m?.f1]]; return <><Heading eyebrow="MANAGEMENT / MODEL PERFORMANCE" title="Model performance" desc="Metrics from the held-out test split of the synthetic dataset." /><div className="notice"><ShieldCheck size={17} /> Accuracy alone does not describe model quality; review precision and recall too.</div><div className="stats">{rows.map(([k, v], i) => <Stat key={k} title={k} value={v == null ? '—' : (v * 100).toFixed(1) + '%'} note="Synthetic test split" Icon={[Activity, BarChart3, Users, BrainCircuit][i]} tone={['blue', 'purple', 'orange', 'green'][i]} />)}</div><Card><h3>Metric definitions</h3><div className="definitions">{[['Accuracy', 'Share of all test examples classified correctly.'], ['Precision', 'Among positive predictions, the share that were positive.'], ['Recall', 'Among positive records, the share detected by the model.'], ['F1-score', 'Harmonic mean of precision and recall.']].map(x => <div key={x[0]}><b>{x[0]}</b><p>{x[1]}</p></div>)}</div><div className="warn">The current sample model has relatively low precision and recall. Treat it as a learning demonstration, not a validated predictive system.</div></Card></> }
function About() { return <><Heading eyebrow="GENERAL / PROJECT INFORMATION" title="About this project" desc="A full-stack educational demonstration of an attrition analytics workflow." /><Card className="about"><div className="abouticon"><BrainCircuit size={30} /></div><div><small>DATA SCIENCE PROJECT</small><h2>Employee Performance & Attrition Prediction</h2><p>Explore generated workforce data, descriptive analytics and a sample classification model.</p></div></Card><Card><h3>Technology stack</h3><div className="definitions">{[['Frontend', 'React, Vite, Recharts, Lucide'], ['Backend', 'Python, FastAPI, Uvicorn'], ['Data processing', 'Pandas, NumPy'], ['Machine learning', 'scikit-learn, Random Forest'], ['Dataset', 'Generated CSV sample records']].map(x => <div key={x[0]}><b>{x[0]}</b><p>{x[1]}</p></div>)}</div></Card><div className="notice"><ShieldCheck size={17} /> Synthetic data only. Do not use these predictions for hiring, firing, promotion or other real employment decisions.</div></> }

function DatasetManagement({ onRefresh }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function uploadDataset() {
        if (!file) {
            setError('Please select a CSV file first.');
            return;
        }

        setBusy(true);
        setError('');
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(API + '/dataset/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || 'Upload failed');

            setPreview(result.preview || []);
            setMessage(`Upload successful! ${result.records ?? result.totalRecords ?? result.preview?.length ?? 0} employee records validated.`);
            await checkStatus();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function checkStatus() {
        try {
            const response = await fetch(API + '/dataset/status');
            if (!response.ok) throw new Error('Could not load dataset status');
            setStatus(await response.json());
        } catch (err) {
            setError(err.message);
        }
    }

    async function trainModel() {
        setBusy(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(API + '/dataset/train', {
                method: 'POST'
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || 'Model training failed');

            setMessage(
                `Model trained successfully! Accuracy: ${(result.metrics.accuracy * 100).toFixed(2)}%`
            );
            await checkStatus();
            if (onRefresh) await onRefresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        checkStatus();
    }, []);

    return (
        <div>
            <Heading
                eyebrow="MANAGEMENT / DATASET"
                title="Dataset management"
                desc="Upload employee data, validate records and train your attrition prediction model."
            />

            <Card>
                <div className="cardhead">
                    <div>
                        <h3>Upload employee dataset</h3>
                        <p>Select a CSV file containing employee records.</p>
                    </div>
                </div>

                <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={e => {
                        setFile(e.target.files?.[0] || null);
                        setPreview([]);
                        setMessage('');
                        setError('');
                    }}
                />

                {file && <p>Selected file: <b>{file.name}</b></p>}

                <button
                    className="btn"
                    onClick={uploadDataset}
                    disabled={busy || !file}
                >
                    {busy ? 'Please wait...' : 'Upload and validate CSV'}
                </button>

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </Card>

            <Card>
                <div className="cardhead">
                    <div>
                        <h3>Dataset status</h3>
                        <p>Current uploaded dataset information.</p>
                    </div>
                    <button className="btn-secondary" onClick={checkStatus}>
                        Refresh status
                    </button>
                </div>

                {status ? (
                    <>
                        <p>Uploaded: <b>{status.uploaded ? 'Yes' : 'No'}</b></p>
                        <p>Records: <b>{status.totalRecords ?? 0}</b></p>
                        <p>File: <b>{status.filename || 'No file uploaded'}</b></p>
                    </>
                ) : <p>Loading dataset status...</p>}

                <button
                    className="btn"
                    onClick={trainModel}
                    disabled={busy || !status?.uploaded}
                >
                    {busy ? 'Training model...' : 'Train and activate model'}
                </button>
            </Card>

            {preview.length > 0 && (
                <Card>
                    <div className="cardhead">
                        <div>
                            <h3>Dataset preview</h3>
                            <p>Preview of uploaded employee records.</p>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(preview[0]).map(key => (
                                        <th key={key}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((item, index) => (
                                    <tr key={index}>
                                        {Object.values(item).map((value, i) => (
                                            <td key={i}>{String(value ?? '')}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}


export default function App() {
  const [page, P] = useState('overview');
  const [s, S] = useState(null);
  const [m, M] = useState(null);
  const [a, A] = useState(null);
  const [rows, R] = useState([]);
  const [err, E] = useState('');
  const [loading, L] = useState(true);
  const [mobile, B] = useState(false);

  async function load() {
    L(true);
    E('');

    try {
      const [s1, m1, a1, r1] = await Promise.all(
        ['/summary', '/metrics', '/analytics', '/employees?limit=100'].map(
          async p => {
            const res = await fetch(API + p);
            if (!res.ok) throw Error(`${p} request failed`);
            return res.json();
          }
        )
      );

      S(s1);
      M(m1);
      A(a1);
      R(r1);
    } catch (x) {
      E(x.message);
    } finally {
      L(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const title = nav.find(x => x[0] === page)?.[1] || 'Overview';

  return (
    <div className="layout">
      <aside className={`sidebar ${mobile ? 'show' : ''}`}>
        <div className="brand">
          <div className="brandicon"><Activity /></div>
          <div>
            People<span>Pulse</span>
            <small>WORKFORCE INTELLIGENCE</small>
          </div>
          <button className="close" onClick={() => B(false)}>
            <X />
          </button>
        </div>

        <div className="workspace">
          <b className="workspaceletter">P</b>
          <span>
            <strong>Project workspace</strong>
            <small>Sample environment</small>
          </span>
          <ChevronDown size={15} />
        </div>

        {['WORKSPACE', 'MANAGEMENT', 'GENERAL'].map(g => (
          <div className="navgroup" key={g}>
            <small>{g}</small>

            {nav.filter(x => x[3] === g).map(([id, label, Icon]) => (
              <button
                key={id}
                className={page === id ? 'selected' : ''}
                onClick={() => {
                  P(id);
                  B(false);
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        ))}

        <div className="sidefoot">
          <div className="demo">
            <ShieldCheck size={18} />
            <b>Learning project</b>
            <p>Explore using synthetic sample records.</p>
          </div>

          <div className="user">
            <b>DS</b>
            <span>
              <strong>Data Science Demo</strong>
              <small>Local workspace</small>
            </span>
            <Settings size={16} />
          </div>
        </div>
      </aside>

      <section className="main">
        <header className="top">
          <div>
            <button className="hamb" onClick={() => B(true)}>
              <Menu />
            </button>
            <span>Workspace <i>/</i> {title}</span>
          </div>

          <div className="topright">
            <span className="api"><i /> API connected</span>
            <button onClick={load} title="Refresh data">
              <RefreshCw size={17} />
            </button>
            <Bell size={17} />
            <b>DS</b>
          </div>
        </header>

        <main className="content">
          {err ? (
            <div className="error">
              <b>Unable to load data:</b> {err}
              <button onClick={load}>Retry</button>
            </div>
          ) : null}

          {loading ? (
            <div className="loading">Loading dashboard…</div>
          ) : (
            <>
              {page === 'overview' ? (
                <Overview s={s} a={a} setPage={P} />
              ) : null}

              {page === 'analytics' ? <Analytics a={a} /> : null}

              {page === 'predict' ? <Predict /> : null}

              {page === 'employees' ? <Employees rows={rows} /> : null}

              {page === 'model' ? <Model m={m} /> : null}

              {page === 'dataset' ? (
                <DatasetManagement onRefresh={load} />
              ) : null}

              {page === 'about' ? <About /> : null}
            </>
          )}

          <footer>
            PeoplePulse · React · FastAPI · Python · scikit-learn
            <span>Educational project using synthetic data</span>
          </footer>
        </main>
      </section>
    </div>
  );
}
