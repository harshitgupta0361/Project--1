import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Download,
  FileJson,
  FileText,
  Info,
  Layers3,
  Map as MapIcon,
  Menu,
  ScanLine,
  UploadCloud,
  Waves,
  X,
  ZoomIn,
  ZoomOut,
  Grid,
  Activity
} from 'lucide-react';

type Decision = 'Needs Human Verification' | 'Confirmed debris' | 'Rejected';
type Marker = {
  id: string;
  x: number;
  y: number;
  type: string;
  confidence: string;
  score: string;
  depth: string;
  position: string;
};
type Detection = {
  id: string;
  class: string;
  confidence: number;
  artificiality_score: number;
  bounding_box: { x: number; y: number; width: number; height: number };
  evidence: string[];
};
type AnalysisPayload = {
  processed_image: string;
  detections: Detection[];
  image: { width: number; height: number; mean: number; threshold: number };
};

const DEMO_SWEEP = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#182b31"/><stop offset=".55" stop-color="#29454a"/><stop offset="1" stop-color="#111f27"/></linearGradient><filter id="noise"><feTurbulence baseFrequency=".55" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .16"/></feComponentTransfer></filter><radialGradient id="object"><stop stop-color="#d1d7c3"/><stop offset=".4" stop-color="#82948c"/><stop offset="1" stop-color="#283f42"/></radialGradient></defs><rect width="1200" height="640" fill="url(#bg)"/><rect width="1200" height="640" filter="url(#noise)" opacity=".7"/><path d="M0 160 Q280 90 560 176 T1200 125 M0 345 Q300 280 620 367 T1200 300 M0 540 Q340 470 760 565 T1200 470" fill="none" stroke="#78a099" stroke-opacity=".2" stroke-width="3"/><ellipse cx="718" cy="322" rx="74" ry="44" fill="url(#object)" transform="rotate(-13 718 322)"/><path d="M750 343 l240 130 -282 -93z" fill="#101c23" opacity=".72"/><ellipse cx="312" cy="486" rx="42" ry="24" fill="#738a85" opacity=".6"/><path d="M337 500 l135 56 -148 -33z" fill="#101c23" opacity=".6"/></svg>`
)}`;

const markers: Marker[] = [
  {
    id: 'MD-001',
    x: 57,
    y: 43,
    type: 'Potential Marine Debris',
    confidence: '87%',
    score: '82 / 100',
    depth: '18.4 m',
    position: 'DEMO 36.8421° N, 122.4186° W',
  },
  {
    id: 'MD-002',
    x: 30,
    y: 72,
    type: 'Possible rock cluster',
    confidence: '63%',
    score: '48 / 100',
    depth: '21.1 m',
    position: 'DEMO 36.8399° N, 122.4262° W',
  },
  {
    id: 'MD-003',
    x: 79,
    y: 27,
    type: 'Low confidence return',
    confidence: '41%',
    score: '29 / 100',
    depth: '16.7 m',
    position: 'DEMO 36.8474° N, 122.4108° W',
  },
];

function downloadFile(content: string, name: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Header({
  title,
  onToggleSidebar,
  sidebarCollapsed,
}: {
  title: string;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}) {
  const [location, setLocation] = useLocation();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-btn"
          aria-label="Toggle navigation menu"
          onClick={onToggleSidebar}
          data-testid="button-menu"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Menu size={15} />
        </button>

        <Link href="/" className="brand-badge" data-testid="link-brand">
          <span className="brand-mark">
            <Waves size={15} />
          </span>
          <span className="brand-title">
            <span className="brand-name">MARINE DEBRIS</span>
            <span className="brand-sub">COMMAND CENTER v0.8.4</span>
          </span>
        </Link>

        <div className="topbar-divider" />

        <div className="crumb">
          <span>SONAR CONSOLE</span>
          <ChevronRight size={13} />
          <strong>{title}</strong>
        </div>
      </div>

      <div className="topbar-right">
        <div className="telemetry-pills">
          <div className="sys-pill">
            <i className="sys-dot" />
            <span>SYS <strong>OK</strong></span>
          </div>
          <div className="sys-pill">
            <span>MODEL <strong>LOCAL CV</strong></span>
          </div>
          <div className="sys-pill">
            <span>PORT <strong>5000</strong></span>
          </div>
        </div>

        <div className="top-actions">
          <button
            className="ghost-btn"
            onClick={() => setLocation('/')}
            data-testid="button-new-sweep"
          >
            <UploadCloud size={13} /> New sweep
          </button>
        </div>
      </div>
    </header>
  );
}

function Shell({
  children,
  title,
  sidebarCollapsed,
  setSidebarCollapsed,
}: {
  children: ReactNode;
  title: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
}) {
  const [location, setLocation] = useLocation();

  const nav = [
    { href: '/', label: '01 Ingest Sweep', icon: UploadCloud, test: 'link-ingest' },
    { href: '/analysis', label: '02 Analysis Queue', icon: ScanLine, test: 'link-analysis' },
    { href: '/map', label: '03 Anomaly Map', icon: MapIcon, test: 'link-map' },
    { href: '/unified', label: '04 Command Grid', icon: Grid, test: 'link-unified' },
  ];

  return (
    <div className="desktop-app">
      <Header
        title={title}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="workspace-body">
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="nav-group-label">NAVIGATION</div>
          <nav className="nav-list" aria-label="Primary navigation">
            {nav.map(({ href, label, icon: Icon, test }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link ${location === href ? 'active' : ''}`}
                data-testid={test}
              >
                <Icon className="nav-icon" />
                <span className="nav-text">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-foot">
            <div className="system-line">
              <span>LOCAL SYSTEM</span>
              <span>v0.8.4</span>
            </div>
            <div className="system-line">
              <span>MODEL ADAPTER</span>
              <span style={{ color: '#39d6c2' }}>LOCAL CV</span>
            </div>
            <div className="system-line">
              <span>METADATA</span>
              <span>NOT FOUND</span>
            </div>
          </div>
        </aside>

        <main className="main-viewport">{children}</main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* INGEST PANEL                                                               */
/* -------------------------------------------------------------------------- */
function IngestPanel({
  image,
  fileName,
  hasFile,
  onImage,
  onAnalyze,
}: {
  image: string;
  fileName: string;
  hasFile: boolean;
  onImage: (file: File) => void;
  onAnalyze: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file && file.type.startsWith('image/')) onImage(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="panel" aria-labelledby="upload-heading">
      <div className="panel-header">
        <div className="panel-title-group">
          <i className="panel-indicator" />
          <span className="panel-title" id="upload-heading">
            01 / SOURCE SWEEP INGEST
          </span>
        </div>
        <span className="panel-note">PNG · JPG · WEBP (MAX 25 MB)</span>
      </div>

      <div className="panel-body-scroll">
        <div
          className={`dropzone ${dragging ? 'dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
          }}
          data-testid="dropzone-sonar"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleFiles(event.target.files)
            }
            data-testid="input-sonar-file"
          />
          {image ? (
            <>
              <img
                src={image}
                alt="Uploaded sonar sweep preview"
                className="preview-img"
                data-testid="img-sonar-preview"
              />
              <div className="preview-scan" />
              <div className="preview-overlay">
                <span className="file-tag" data-testid="text-uploaded-file">
                  {fileName}
                </span>
                <span className="file-tag">LOCAL PREVIEW</span>
              </div>
            </>
          ) : (
            <div className="drop-inner">
              <UploadCloud className="drop-cross" strokeWidth={1.2} />
              <div className="drop-title">Drop sonar sweep frame here</div>
              <div className="drop-copy">
                or click to select a local acoustic image from device
                <br />
                Recommended minimum 1200 × 600 px
              </div>
              <div className="drop-meta">LOCAL CV PROCESSING · NO EXTERNAL UPLOAD</div>
            </div>
          )}
        </div>

        <div className="upload-note">
          <span>{image ? 'Sweep loaded & ready for analysis' : 'No sweep image loaded'}</span>
          <button
            className="sample-btn"
            onClick={async (event) => {
              event.stopPropagation();
              const response = await fetch(DEMO_SWEEP);
              const blob = await response.blob();
              onImage(new File([blob], 'demo-sweep.svg', { type: 'image/svg+xml' }));
            }}
            data-testid="button-load-demo"
          >
            Load demo sweep →
          </button>
        </div>

        <div className="analysis-submit">
          <button
            className="solid-btn"
            disabled={!hasFile || analyzing}
            onClick={async () => {
              setAnalyzing(true);
              setError('');
              try {
                await onAnalyze();
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : 'Analysis failed');
              } finally {
                setAnalyzing(false);
              }
            }}
            data-testid="button-analyze-sonar"
          >
            <ScanLine size={14} />{' '}
            {analyzing ? 'Processing sonar image…' : 'Analyze sonar sweep'}
          </button>
          {error && (
            <span className="form-error" role="alert" data-testid="status-analysis-error">
              {error}
            </span>
          )}
        </div>

        <div className="panel info-card" style={{ background: '#071b24', marginTop: 'auto' }}>
          <h3>Review Protocol</h3>
          <p>
            The computer vision pass detects acoustic return anomalies locally. A human researcher verification state is recorded for every flagged candidate.
          </p>
          <div className="workflow">
            <div className="step">
              <span className="step-num">1</span>
              <div>
                <h4>Ingest locally</h4>
                <p>Read acoustic image frame locally without cloud transmission.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <div>
                <h4>Inspect evidence</h4>
                <p>Verify intensity contrast, spatial dimensions and directional shadow.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <div>
                <h4>Record decision</h4>
                <p>Confirm debris or reject with audit trace logging.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ANALYSIS QUEUE PANEL                                                       */
/* -------------------------------------------------------------------------- */
function AnalysisQueuePanel({
  image,
  result,
  decision,
  onDecision,
}: {
  image: string;
  result: AnalysisPayload | null;
  decision: Decision;
  onDecision: (value: Decision) => void;
}) {
  const [, setLocation] = useLocation();
  const shownImage = image || DEMO_SWEEP;
  const primary = result?.detections[0];
  const evidence = primary?.evidence ?? [];

  return (
    <div className="panel" aria-labelledby="sonar-heading">
      <div className="panel-header">
        <div className="panel-title-group">
          <i className="panel-indicator" style={{ background: '#f0cf62' }} />
          <span className="panel-title" id="sonar-heading">
            02 / ANALYSIS QUEUE & EVIDENCE VERIFICATION
          </span>
        </div>
        <span className="status-pill" data-testid="status-analysis">
          {decision}
        </span>
      </div>

      <div className="panel-body-scroll">
        <div className="sonar-frame">
          <img
            src={result?.processed_image || shownImage}
            alt="Processed side-scan sonar evidence frame"
            className="sonar-image"
            data-testid="img-analysis-sweep"
          />
          <div className="sonar-grid" />
          <div className="scanline" />
          <span className="frame-label tl">ACOUSTIC INTENSITY / LOCAL CV</span>
          <span className="frame-label br">
            {result ? `${result.image.width} × ${result.image.height} PX` : 'NO ANALYSIS RUN'}
          </span>
          {result?.detections.map((detection) => (
            <div
              key={detection.id}
              className="bbox"
              style={{
                left: `${detection.bounding_box.x * 100}%`,
                top: `${detection.bounding_box.y * 100}%`,
                width: `${detection.bounding_box.width * 100}%`,
                height: `${detection.bounding_box.height * 100}%`,
              }}
            >
              <span className="bbox-tag">{detection.id}</span>
            </div>
          ))}
        </div>

        <div className="frame-footer">
          <span>ACOUSTIC RANGE / 42.0 M</span>
          <span>GAIN 18 DB · NORTH-UP UNAVAILABLE</span>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">CV confidence</div>
            <div className="metric-value teal" data-testid="value-ai-confidence">
              {primary ? `${primary.confidence}%` : '—'}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Anomaly score</div>
            <div className="metric-value gold" data-testid="value-artificiality">
              {primary ? primary.artificiality_score : '—'}
              <span style={{ fontSize: 11, color: '#7a9e97' }}>/100</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Review state</div>
            <div
              className="metric-value"
              style={{ fontSize: 13, marginTop: 8 }}
              data-testid="value-review-state"
            >
              {result
                ? decision === 'Needs Human Verification'
                  ? 'OPEN'
                  : 'RECORDED'
                : 'NOT RUN'}
            </div>
          </div>
        </div>

        <div className="panel" style={{ background: '#071c26', padding: 14 }}>
          <div className="classification-box">
            <div className="classification-label">Classification</div>
            <div className="classification-name" data-testid="text-classification">
              {primary?.class || 'No strong anomaly detected'}
            </div>
          </div>

          <div
            className="status-pill"
            style={{ marginTop: 10 }}
            data-testid="status-human-verification"
          >
            {decision}
          </div>

          <div className="evidence-head" style={{ marginTop: 14 }}>
            <span>MEASURED EVIDENCE SIGNALS</span>
            <span>{evidence.length} signals</span>
          </div>

          <div className="evidence-list" style={{ marginTop: 8 }}>
            {evidence.length ? (
              evidence.map((item, index) => (
                <div
                  className="evidence-item"
                  key={item}
                  data-testid={`evidence-item-${index}`}
                >
                  <Check className="check" />
                  {item}
                </div>
              ))
            ) : (
              <div className="evidence-item">Run sonar analysis from the ingest screen.</div>
            )}
          </div>

          <div className="verify-actions">
            <button
              className="solid-btn"
              disabled={!primary}
              onClick={() => onDecision('Confirmed debris')}
              data-testid="button-confirm"
            >
              <Check size={14} /> Confirm
            </button>
            <button
              className="danger-btn"
              disabled={!primary}
              onClick={() => onDecision('Rejected')}
              data-testid="button-reject"
            >
              <X size={14} /> Reject
            </button>
          </div>

          <button
            className="ghost-btn"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => setLocation('/map')}
            data-testid="button-open-map"
          >
            <MapIcon size={14} /> Open anomaly map
          </button>

          <div className="decision-log">
            <strong>DECISION LOG</strong>
            <br />
            {decision === 'Needs Human Verification'
              ? 'Awaiting researcher field input.'
              : `${decision} · recorded locally just now.`}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAP PANEL                                                                  */
/* -------------------------------------------------------------------------- */
function MapPanel({
  decision,
  result,
  onToast,
}: {
  decision: Decision;
  result: AnalysisPayload | null;
  onToast: (message: string) => void;
}) {
  const mapMarkers = result?.detections.length
    ? result.detections.map((detection, index) => ({
        ...markers[index % markers.length],
        id: detection.id,
        x: detection.bounding_box.x * 100,
        y: detection.bounding_box.y * 100,
        type: detection.class,
        confidence: `${detection.confidence}%`,
        score: `${detection.artificiality_score} / 100`,
      }))
    : markers;

  const [selected, setSelected] = useState(mapMarkers[0]);
  const [zoom, setZoom] = useState(1);

  const exportCsv = () => {
    const rows = [
      ['id', 'classification', 'confidence', 'artificiality_score', 'depth', 'coordinates', 'decision'],
      ...mapMarkers.map((m) => [
        m.id,
        m.type,
        m.confidence,
        m.score,
        m.depth,
        m.position,
        m.id === mapMarkers[0].id ? decision : 'Unreviewed',
      ]),
    ];
    downloadFile(rows.map((row) => row.join(',')).join('\n'), 'marine-debris-anomalies.csv', 'text/csv');
    onToast('CSV report downloaded');
  };

  const exportJson = () => {
    downloadFile(
      JSON.stringify(
        {
          report: 'Marine Debris Sonar',
          mode: 'Prototype Sonar Anomaly Detection / Computer Vision Prototype',
          generatedAt: new Date().toISOString(),
          metadata: 'Unavailable — coordinates are DEMO values',
          anomalies: mapMarkers.map((m) => ({
            ...m,
            decision: m.id === mapMarkers[0].id ? decision : 'Unreviewed',
          })),
        },
        null,
        2
      ),
      'marine-debris-report.json',
      'application/json'
    );
    onToast('JSON report downloaded');
  };

  return (
    <div className="panel" aria-label="Interactive anomaly map">
      <div className="panel-header">
        <div className="panel-title-group">
          <i className="panel-indicator" style={{ background: '#48d5c4' }} />
          <span className="panel-title">03 / GIS ANOMALY MAP & EXPORT</span>
        </div>
        <span className="panel-note">SPATIAL TRACKING CONSOLE</span>
      </div>

      <div className="panel-body-scroll">
        <div className="map-canvas" data-testid="map-canvas">
          <div
            className="map-sea"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform .25s' }}
          />
          <div className="map-grid" />
          <div className="map-routes" />

          <span className="map-label" style={{ left: '12%', top: '16%' }}>
            MONTEREY BAY / TEST GRID
          </span>
          <span className="map-label" style={{ right: '8%', bottom: '20%' }}>
            SECTOR 04B
          </span>

          {mapMarkers.map((marker) => (
            <button
              key={marker.id}
              className={`marker ${selected.id === marker.id ? 'selected' : ''}`}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              onClick={() => setSelected(marker)}
              aria-label={`Select anomaly ${marker.id}`}
              data-testid={`marker-${marker.id}`}
            >
              <span>{marker.id.slice(-1)}</span>
            </button>
          ))}

          <div className="map-legend">
            <span>
              <i className="legend-dot" /> ANOMALY
            </span>
            <span>
              <i className="legend-line" /> SURVEY TRACK
            </span>
          </div>

          <div className="map-controls">
            <button
              className="icon-btn"
              onClick={() => setZoom((value) => Math.min(1.35, value + 0.1))}
              aria-label="Zoom in"
              data-testid="button-map-zoom-in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              className="icon-btn"
              onClick={() => setZoom((value) => Math.max(1, value - 0.1))}
              aria-label="Zoom out"
              data-testid="button-map-zoom-out"
            >
              <ZoomOut size={14} />
            </button>
          </div>
        </div>

        <div className="panel" style={{ background: '#071c26', padding: 14 }}>
          <div className="selected-card">
            <div className="selected-id" data-testid="text-selected-id">
              {selected.id}
            </div>
            <h4 data-testid="text-selected-type">{selected.type}</h4>

            <div className="detail-row">
              <span>AI confidence</span>
              <strong data-testid="text-selected-confidence">{selected.confidence}</strong>
            </div>
            <div className="detail-row">
              <span>Artificiality score</span>
              <strong>{selected.score}</strong>
            </div>
            <div className="detail-row">
              <span>Estimated depth</span>
              <strong>{selected.depth}</strong>
            </div>
            <div className="detail-row">
              <span>Position</span>
              <strong data-testid="text-selected-position">{selected.position}</strong>
            </div>
            <div className="detail-row">
              <span>Review state</span>
              <strong>
                {selected.id === mapMarkers[0].id ? decision : 'Unreviewed'}
              </strong>
            </div>
          </div>

          <div className="export-block">
            <h4>EXPORT FIELD REPORT</h4>
            <button className="solid-btn" onClick={exportCsv} data-testid="button-export-csv">
              <FileText size={14} /> Download CSV
            </button>
            <button className="ghost-btn" onClick={exportJson} data-testid="button-export-json">
              <FileJson size={14} /> Download JSON
            </button>
            <div className="coord-note">
              Coordinates are marked DEMO because this source sweep contains no navigation metadata.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN ROUTER & VIEWS                                                        */
/* -------------------------------------------------------------------------- */
function App() {
  const [location, setLocation] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [image, setImage] = useState('');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisPayload | null>(null);
  const [decision, setDecision] = useState<Decision>('Needs Human Verification');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleImage = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setDecision('Needs Human Verification');
    setFileName(selectedFile.name);
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) throw new Error('Select an image before analyzing.');
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('/api/analyze', { method: 'POST', body: formData });
    const payload = (await response.json()) as AnalysisPayload & { error?: string };
    if (!response.ok) throw new Error(payload.error || 'Analysis failed.');
    setResult(payload);
    setLocation('/analysis');
  };

  const pageTitle =
    location === '/analysis'
      ? 'Analysis queue'
      : location === '/map'
      ? 'Anomaly map'
      : location === '/unified'
      ? 'Unified Command Grid'
      : 'Ingest sweep';

  return (
    <>
      {toast && (
        <div className="toast" role="status" data-testid="status-toast">
          {toast}
        </div>
      )}

      <Shell
        title={pageTitle}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      >
        <Switch>
          <Route path="/">
            <div className="dashboard-grid mode-ingest">
              <IngestPanel
                image={image}
                fileName={fileName}
                hasFile={!!file}
                onImage={handleImage}
                onAnalyze={handleAnalyze}
              />
              <AnalysisQueuePanel
                image={image}
                result={result}
                decision={decision}
                onDecision={(val) => {
                  setDecision(val);
                  setToast(`Decision recorded: ${val}`);
                }}
              />
            </div>
          </Route>

          <Route path="/analysis">
            <div className="dashboard-grid mode-analysis">
              <AnalysisQueuePanel
                image={image}
                result={result}
                decision={decision}
                onDecision={(val) => {
                  setDecision(val);
                  setToast(`Decision recorded: ${val}`);
                }}
              />
              <MapPanel decision={decision} result={result} onToast={setToast} />
            </div>
          </Route>

          <Route path="/map">
            <div className="dashboard-grid mode-map">
              <MapPanel decision={decision} result={result} onToast={setToast} />
              <AnalysisQueuePanel
                image={image}
                result={result}
                decision={decision}
                onDecision={(val) => {
                  setDecision(val);
                  setToast(`Decision recorded: ${val}`);
                }}
              />
            </div>
          </Route>

          <Route path="/unified">
            <div className="dashboard-grid mode-unified">
              <IngestPanel
                image={image}
                fileName={fileName}
                hasFile={!!file}
                onImage={handleImage}
                onAnalyze={handleAnalyze}
              />
              <AnalysisQueuePanel
                image={image}
                result={result}
                decision={decision}
                onDecision={(val) => {
                  setDecision(val);
                  setToast(`Decision recorded: ${val}`);
                }}
              />
              <MapPanel decision={decision} result={result} onToast={setToast} />
            </div>
          </Route>

          <Route>
            <div className="dashboard-grid">
              <div className="panel" style={{ padding: 24, textTransform: 'none' }}>
                <div className="panel-title" style={{ color: '#e5c35c', fontSize: 14 }}>
                  404 / UNCHARTED CHANNEL
                </div>
                <h2 style={{ color: '#e3f0ee', margin: '12px 0' }}>Requested view was not found.</h2>
                <Link
                  href="/"
                  className="solid-btn"
                  style={{ width: 'fit-content' }}
                  data-testid="link-return-home"
                >
                  Return to command center
                </Link>
              </div>
            </div>
          </Route>
        </Switch>
      </Shell>
    </>
  );
}

export default function RoutedApp() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <App />
    </WouterRouter>
  );
}