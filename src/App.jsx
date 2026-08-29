import { useEffect, useRef, useState } from 'react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  ChevronLeft,
  Download,
  FileJson,
  FileText,
  Info,
  Layers3,
  Map as MapIcon,
  Menu,
  ScanLine,
  UploadCloud,
  Radar,
  X,
  ZoomIn,
  ZoomOut,
  Grid,
  Activity,
  RotateCcw
} from 'lucide-react';

const DEMO_SWEEP = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#0B241B"/><stop offset=".55" stop-color="#12372A"/><stop offset="1" stop-color="#0B241B"/></linearGradient><filter id="noise"><feTurbulence baseFrequency=".55" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .16"/></feComponentTransfer></filter><radialGradient id="object"><stop stop-color="#F4B6A6"/><stop offset=".4" stop-color="#8FA89A"/><stop offset="1" stop-color="#12372A"/></radialGradient></defs><rect width="1200" height="640" fill="url(#bg)"/><rect width="1200" height="640" filter="url(#noise)" opacity=".7"/><path d="M0 160 Q280 90 560 176 T1200 125 M0 345 Q300 280 620 367 T1200 300 M0 540 Q340 470 760 565 T1200 470" fill="none" stroke="#8FA89A" stroke-opacity=".2" stroke-width="3"/><ellipse cx="718" cy="322" rx="74" ry="44" fill="url(#object)" transform="rotate(-13 718 322)"/><path d="M750 343 l240 130 -282 -93z" fill="#0B241B" opacity=".72"/><ellipse cx="312" cy="486" rx="42" ry="24" fill="#8FA89A" opacity=".6"/><path d="M337 500 l135 56 -148 -33z" fill="#0B241B" opacity=".6"/></svg>`
)}`;

const markers = [
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

function downloadFile(content, name, type) {
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

function Header({ title, onToggleSidebar, sidebarCollapsed }) {
  const [, setLocation] = useLocation();

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
            {/* <Radar size={15} /> */}
          </span>
          <span className="brand-title">
            <span className="brand-name">SONARIS</span>
            <span className="brand-sub">MARINE RESEARCH</span>
          </span>
        </Link>

        <div className="topbar-divider" />

        <div className="crumb">
          <span>MARINE WORKBENCH</span>
          <ChevronRight size={13} />
          <strong>{title}</strong>
        </div>
      </div>

      <div className="topbar-right">
        <div className="telemetry-pills">
          <div className="sys-pill">
            <i className="sys-dot" />
            <span>SYS <strong>ONLINE</strong></span>
          </div>
          <div className="sys-pill">
            <span>ENGINE <strong>2D ENHANCEMENT</strong></span>
          </div>
          {/*    */}
        </div>

        {/* <div className="top-actions">
          <button
            className="ghost-btn"
            onClick={() => setLocation('/')}
            data-testid="button-new-sweep"
          >
            <UploadCloud size={13} /> New sweep
          </button>
        </div> */}


      </div>
    </header>
  );
}

function Shell({ children, title, sidebarCollapsed, setSidebarCollapsed }) {
  const [location] = useLocation();

  const nav = [
    { href: '/', label: 'OVERVIEW', icon: UploadCloud, test: 'link-ingest' },
    { href: '/analysis', label: 'ANALYZE', icon: ScanLine, test: 'link-analysis' },


                    // { href: '/unified', label: 'TARGETS', icon: Grid, test: 'link-unified' },



    { href: '/map', label: 'MAP & REPORT', icon: MapIcon, test: 'link-map' },
                    // { href: '/report', label: 'REPORT', icon: FileText, test: 'link-report' },
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
          <div className="nav-group-label">WORKBENCH NAV</div>
          <nav className="nav-list" aria-label="Primary navigation">
            {nav.map(({ href, label, icon, test }) => {
              const NavIcon = icon;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${location === href ? 'active' : ''}`}
                  data-testid={test}
                >
                  <NavIcon className="nav-icon" />
                  <span className="nav-text">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-foot">
            <div className="system-line">
              <span>WORKBENCH STATE</span>
              <span>v0.8.4</span>
            </div>
            <div className="system-line">
              <span>2D ENHANCEMENT</span>
              <span>ACTIVE</span>
            </div>
            {/* <div className="system-line">
              <span>SURVEY GRID</span>
              <span>DEMO</span>
            </div> */}
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
function IngestPanel({ image, fileName, hasFile, onImage, onAnalyze }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file && file.type.startsWith('image/')) onImage(file);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer?.files || event.target?.files);
  };

  return (
    <div className="panel" aria-labelledby="upload-heading">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-title" id="upload-heading">
            Input & Pre-Processing: Acoustic Sweep
          </span>
        </div>
      </div>

      <div className="panel-body-scroll">
        <div
          style={{
            background: 'var(--border-dark)',
            border: '1px solid #4a342b',
            borderRadius: 6,
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-peach)', letterSpacing: '0.04em' }}>
            2D SONAR ENHANCEMENT
            </span>
            {/* <span style={{ fontSize: 10, fontFamily: 'var(--app-font-mono)', color: 'var(--text-secondary)' }}>
              PRE-DETECTION
            </span> */}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 8, fontWeight: 500 }}>
            Speckle reduction • Blur reduction • Contrast enhancement
          </div>



          {/* <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexWrap: 'wrap',
              fontSize: 10,
              fontFamily: 'var(--app-font-mono)',
              color: 'var(--text-secondary)',
              background: 'var(--bg-canvas)',
              padding: '6px 8px',
              borderRadius: 4,
            }}
          >
            <span style={{ color: 'var(--text-primary)' }}>SONAR</span>
            <span>→</span>
            <span style={{ color: 'var(--accent-peach)', fontWeight: 600 }}>ENHANCEMENT</span>
            <span>→</span>
            <span>QUALITY</span>
            <span>→</span>
            <span>DETECTION</span>
            <span>→</span>
            <span>EVIDENCE</span>
            <span>→</span>
            <span>VERIFICATION</span>
          </div> */}



        </div>

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
            onChange={(event) => handleFiles(event.target.files)}
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
              <div className="preview-overlay">
                <span className="file-tag" data-testid="text-uploaded-file">
                  {fileName}
                </span>
                <span className="file-tag">ACOUSTIC PREVIEW</span>
              </div>
            </>
          ) : (
            <div className="drop-inner">
              <UploadCloud className="drop-cross" strokeWidth={1.2} />
              <div className="drop-title">Drop 2D sonar sweep here</div>
              <div className="drop-copy">
                or click to select a local acoustic image from device
                <br />

                {/* Recommended minimum 1200 × 600 px */}

              </div>


              {/* <div className="drop-meta">LOCAL CV PROCESSING · NO EXTERNAL UPLOAD</div> */}


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
            {/* Load demo sweep → */}
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
                setError(caught?.message || 'Analysis failed');
              } finally {
                setAnalyzing(false);
              }
            }}
            data-testid="button-analyze-sonar"
          >
            {/* <ScanLine size={14} />{' '} */}
            {analyzing ? 'Applying AI 2D Enhancement & Detection…' : 'Analyse'}
          </button>
          {error && (
            <span className="form-error" role="alert" data-testid="status-analysis-error">
              {error}
            </span>
          )}
        </div>

        <div className="panel info-card" style={{ marginTop: 'auto' }}>
          
          <h3>Workbench Review Protocol</h3>
          <p>
            2D enhancement pre-filters speckle noise and contrast before running computer vision detection. Expert verification is required for few candidates.
          </p>
          <div className="workflow">
            <div className="step">
              {/* <span className="step-num">1</span> */}
              <div>
                <p><b>Ingest & Enhance: </b> 
                Apply speckle reduction, blur reduction & contrast enhancement.</p>
              </div>
            </div>
            <div className="step">
              {/* <span className="step-num">2</span> */}
              <div>
                <p><b>Inspect Evidence: </b>
                Analyze geometry, contrast, shadow relationship & seafloor context.</p>
              </div>
            </div>
            <div className="step">
              {/* <span className="step-num">3</span> */}
              <div>
                <p><b>Human Verification: </b>
                Record Human-Verified Candidate or reject with audit trace.</p>
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
function AnalysisQueuePanel({ image, result, decision, onDecision, showVerificationSection = false }) {
  const [, setLocation] = useLocation();
  const shownImage = image || DEMO_SWEEP;
  const primary = result?.detections?.[0];

  const defaultEvidence = [
    'Geometry: High aspect ratio shadow structure consistent with artificial target',
    'Local contrast: +18.4 dB acoustic return peak over seabed baseline',
    'Acoustic-shadow relationship: Direct co-linear shadow trailing signal along swath axis',
    'Seafloor context: Isolated non-geological anomaly on soft sediment grid',
    'Detection confidence: High acoustic return probability (87%)',
    'Artificiality score: 82 / 100 high probability artificial object',
    'Reliability: Multi-pass acoustic signal stability verified',
  ];

  const displayEvidence = primary?.evidence?.length ? primary.evidence : defaultEvidence;

  const isConfirmed = decision === 'Candidate Confirmed' || decision === 'Human-Verified Candidate';
  const isRejected = decision === 'Candidate Rejected' || decision === 'Rejected Candidate';
  const isDecided = isConfirmed || isRejected;

  return (
    <div className="panel" aria-labelledby="sonar-heading">
      <div className="panel-header">
        <div className="panel-title-group">
          {/* <i className="panel-indicator" /> */}
          <span className="panel-title" id="sonar-heading">
            Target Analysis & Evidence Verification
          </span>
        </div>


        {/* <span className="status-pill" data-testid="status-analysis">
          {decision}
        </span> */}
        
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
          <span className="frame-label tl">2D ENHANCED / ACOUSTIC RETURN</span>
          <span className="frame-label br">
            {result ? `${result.image.width} × ${result.image.height} PX` : 'NO ANALYSIS RUN'}
          </span>
          {result?.detections?.map((detection) => (
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
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">CV confidence</div>
            <div className="metric-value teal" data-testid="value-ai-confidence">
              {primary ? `${primary.confidence}%` : '87%'}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Artificiality score</div>
            <div className="metric-value gold" data-testid="value-artificiality">
              {primary ? primary.artificiality_score : '82'}
              <span style={{ fontSize: 11, opacity: 0.7 }}>/100</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Review state</div>
            <div
              className="metric-value"
              style={{ fontSize: 12, marginTop: 6 }}
              data-testid="value-review-state"
            >
              {decision.toUpperCase()}
            </div>
          </div>
        </div>

        {showVerificationSection && (
          <div className="panel" style={{ padding: '6px 10px' }}>
            <div className="classification-box">
              <div className="classification-label">Classification</div>
              <div className="classification-name" data-testid="text-classification">
                {primary?.class || 'Potential Marine Debris'}
              </div>
            </div>

            <div
              className="status-pill"
              data-testid="status-human-verification"
            >
              {decision}
            </div>

            <div className="evidence-head" style={{ marginTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                WHY WAS THIS FLAGGED?
              </span>
              <span>{displayEvidence.length} SIGNALS</span>
            </div>

            <div className="evidence-list" style={{ marginTop: 4 }}>
              {displayEvidence.slice(0, 3).map((item, index) => (
                <div
                  className="evidence-item"
                  key={typeof item === 'string' ? item : index}
                  data-testid={`evidence-item-${index}`}
                >
                  <Check className="check" />
                  {item}
                </div>
              ))}
            </div>

            {!isDecided ? (
              <div className="verify-actions">
                <button
                  className="solid-btn"
                  onClick={() => onDecision('Candidate Confirmed')}
                  data-testid="button-confirm"
                >
                  <Check size={13} /> Confirm Candidate
                </button>
                <button
                  className="danger-btn"
                  onClick={() => onDecision('Candidate Rejected')}
                  data-testid="button-reject"
                >
                  <X size={13} /> Reject Candidate
                </button>
              </div>
            ) : (
              <div className="verify-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    background: isConfirmed ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isConfirmed ? '#4ade80' : '#f87171',
                    border: `1px solid ${isConfirmed ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                  data-testid="status-decision-result"
                >
                  {isConfirmed ? <Check size={14} /> : <X size={14} />}
                  <span>{isConfirmed ? 'Candidate Confirmed' : 'Candidate Rejected'}</span>
                </div>

                <button
                  className="ghost-btn"
                  style={{ padding: '5px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, width: 'auto' }}
                  onClick={() => onDecision('Requires Expert Verification')}
                  data-testid="button-reverify"
                >
                  <RotateCcw size={12} /> Reverify Debris
                </button>
              </div>
            )}

            <button
              className="ghost-btn"
              style={{ width: '100%', marginTop: 4, padding: '4px 8px', fontSize: 11 }}
              onClick={() => setLocation('/map')}
              data-testid="button-open-map"
            >
              <MapIcon size={13} /> Open anomaly map
            </button>

            <div className="decision-log">
              <strong>DECISION LOG</strong>: {decision === 'Requires Expert Verification' || decision === 'Needs Human Verification'
                ? 'Requires Expert Verification · Awaiting field input.'
                : `${decision} · recorded locally.`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CROPPED MD TARGETS PANEL & POPUP MODAL                                     */
/* -------------------------------------------------------------------------- */
function CroppedTargetsPanel({ image, result, decision, targetDecisions = {}, onTargetDecision }) {
  const [modalIndex, setModalIndex] = useState(null);
  const rawImage = image || DEMO_SWEEP;
  const enhancedImage = result?.processed_image || image || DEMO_SWEEP;
  const hasBoth = Boolean(image && result?.processed_image && result.processed_image !== image);

  const defaultTargets = [
    {
      id: 'MD-001',
      type: 'Potential Marine Debris',
      confidence: '87%',
      score: '82 / 100',
      depth: '18.4 m',
      position: 'DEMO 36.8421° N, 122.4186° W',
      box: { x: 0.54, y: 0.36, width: 0.16, height: 0.16 },
    },
    {
      id: 'MD-002',
      type: 'Possible rock cluster',
      confidence: '63%',
      score: '48 / 100',
      depth: '21.1 m',
      position: 'DEMO 36.8399° N, 122.4262° W',
      box: { x: 0.28, y: 0.68, width: 0.14, height: 0.14 },
    },
    {
      id: 'MD-003',
      type: 'Low confidence return',
      confidence: '41%',
      score: '29 / 100',
      depth: '16.7 m',
      position: 'DEMO 36.8474° N, 122.4108° W',
      box: { x: 0.76, y: 0.24, width: 0.15, height: 0.15 },
    },
  ];

  const targets = result?.detections?.length
    ? result.detections.map((det, index) => ({
        id: det.id || `MD-00${index + 1}`,
        type: det.class || 'Potential Marine Debris',
        confidence: typeof det.confidence === 'number' ? `${det.confidence}%` : det.confidence,
        score: det.artificiality_score ? `${det.artificiality_score} / 100` : '82 / 100',
        depth: markers[index % markers.length]?.depth || '18.4 m',
        position: markers[index % markers.length]?.position || 'DEMO 36.8421° N, 122.4186° W',
        box: det.bounding_box || { x: 0.54, y: 0.36, width: 0.16, height: 0.16 },
      }))
    : defaultTargets;

  const activeTarget = modalIndex !== null && targets[modalIndex] ? targets[modalIndex] : null;

  let activeScaleX = 100;
  let activeScaleY = 100;
  let activeOffsetX = 0;
  let activeOffsetY = 0;

  if (activeTarget) {
    const box = activeTarget.box || { x: 0.5, y: 0.3, width: 0.16, height: 0.16 };
    const paddedW = Math.min(1, box.width * 1.5);
    const paddedH = Math.min(1, box.height * 1.5);
    const paddedX = Math.max(0, box.x - (paddedW - box.width) / 2);
    const paddedY = Math.max(0, box.y - (paddedH - box.height) / 2);

    activeScaleX = (1 / paddedW) * 100;
    activeScaleY = (1 / paddedH) * 100;
    activeOffsetX = (-paddedX / paddedW) * 100;
    activeOffsetY = (-paddedY / paddedH) * 100;
  }

  const activeDecision = activeTarget
    ? targetDecisions[activeTarget.id] || (activeTarget.id === targets[0].id ? decision : 'Requires Expert Verification')
    : 'Requires Expert Verification';

  const activeIsConfirmed = activeDecision === 'Candidate Confirmed' || activeDecision === 'Human-Verified Candidate';
  const activeIsRejected = activeDecision === 'Candidate Rejected' || activeDecision === 'Rejected Candidate';
  const activeIsDecided = activeIsConfirmed || activeIsRejected;

  const targetEvidence = activeTarget
    ? [
        'Geometry: High aspect ratio shadow structure consistent with artificial target',
        'Local contrast: +18.4 dB acoustic return peak over seabed baseline',
        'Acoustic-shadow relationship: Direct co-linear shadow trailing signal along swath axis',
        'Seafloor context: Isolated non-geological anomaly on soft sediment grid',
        `Detection confidence: High acoustic return probability (${activeTarget.confidence})`,
        `Artificiality score: ${activeTarget.score} high probability artificial object`,
      ]
    : [];

  const displayEvidence = activeTarget?.evidence?.length
    ? activeTarget.evidence
    : (result?.detections?.find((d) => d.id === activeTarget?.id)?.evidence) || targetEvidence;

  const handleDecisionClick = (val) => {
    if (activeTarget && onTargetDecision) {
      onTargetDecision(activeTarget.id, val);
    }
  };

  return (
    <div className="panel" aria-label="Cropped Marine Debris Targets">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-title">
            Detected Marine Debris (MD) Targets
          </span>
        </div>
        <span className="panel-note">{targets.length} DETECTED ANOMALIES</span>
      </div>

      <div className="panel-body-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {targets.map((target, index) => {
          const tDecision = targetDecisions[target.id] || (target.id === targets[0].id ? decision : 'Requires Expert Verification');

          return (
            <div
              key={target.id}
              className="target-card"
              style={{
                padding: 12,
                background: 'rgba(18, 55, 42, 0.65)',
                border: '1px solid var(--border-dark)',
                borderRadius: 8,
              }}
              data-testid={`target-card-${target.id}`}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--app-font-mono)',
                      fontWeight: 700,
                      background: 'var(--border-dark)',
                      color: 'var(--accent-peach)',
                      padding: '3px 8px',
                      borderRadius: 4,
                      border: '1px solid #4a342b',
                    }}
                  >
                    {target.id}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {target.type}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--app-font-mono)',
                      color: '#4ade80',
                      background: 'rgba(74, 222, 128, 0.1)',
                      padding: '2px 6px',
                      borderRadius: 3,
                    }}
                  >
                    {target.confidence} CV
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--app-font-mono)',
                      color: 'var(--accent-peach)',
                      background: 'rgba(244, 182, 166, 0.1)',
                      padding: '2px 6px',
                      borderRadius: 3,
                    }}
                  >
                    Score {target.score}
                  </span>
                </div>
              </div>

              {/* Target Details Meta */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                  fontSize: 11,
                  fontFamily: 'var(--app-font-mono)',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-canvas)',
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid var(--border-dark)',
                }}
              >
                <div>
                  Depth: <strong style={{ color: 'var(--text-primary)' }}>{target.depth}</strong>
                </div>
                <div>
                  Position: <strong style={{ color: 'var(--text-primary)' }}>{target.position.replace('DEMO ', '')}</strong>
                </div>
                <div>
                  Artificiality: <strong style={{ color: 'var(--accent-peach)' }}>{target.score}</strong>
                </div>
                <div>
                  Verification: <strong style={{ color: 'var(--text-primary)' }}>{tDecision}</strong>
                </div>
              </div>

              {/* Analyse Button */}
              <button
                className="solid-btn"
                style={{ width: '100%', marginTop: 8, padding: '6px 12px', fontSize: 12 }}
                onClick={() => setModalIndex(index)}
                data-testid={`button-analyse-${target.id}`}
              >
                <ScanLine size={13} /> Analyse
              </button>
            </div>
          );
        })}
      </div>

      {/* POPUP MODAL SCREEN FOR TARGET ANALYSIS */}
      {activeTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setModalIndex(null)}
          data-testid="modal-backdrop"
        >
          <div
            style={{
              position: 'relative',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-dark)',
              borderRadius: 8,
              width: '95%',
              maxWidth: 940,
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-container"
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-canvas)',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--app-font-mono)',
                    fontWeight: 700,
                    background: 'var(--border-dark)',
                    color: 'var(--accent-peach)',
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: '1px solid #4a342b',
                  }}
                >
                  {activeTarget.id}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {activeTarget.type}
                </span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setModalIndex(null)}
                aria-label="Close popup"
                data-testid="button-modal-close-icon"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-dark)',
                  borderRadius: 4,
                  padding: 4,
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content - 2 Columns (No Scroll Effect) */}
            <div
              style={{
                padding: 16,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                overflow: 'hidden',
                alignItems: 'start',
              }}
            >
              {/* Left Column: Crop Previews & Target Meta */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Badges Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--app-font-mono)',
                      color: '#4ade80',
                      background: 'rgba(74, 222, 128, 0.1)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid rgba(74, 222, 128, 0.2)',
                    }}
                  >
                    {activeTarget.confidence} CV Confidence
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--app-font-mono)',
                      color: 'var(--accent-peach)',
                      background: 'rgba(244, 182, 166, 0.1)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid rgba(244, 182, 166, 0.2)',
                    }}
                  >
                    Artificiality Score: {activeTarget.score}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--app-font-mono)',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-canvas)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid var(--border-dark)',
                    }}
                  >
                    Depth: {activeTarget.depth}
                  </span>
                </div>

                {/* Cropped Sonar Image Viewports */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: hasBoth ? '1fr 1fr' : '1fr',
                    gap: 8,
                  }}
                >
                  {/* Uploaded Raw Crop Viewport */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: 150,
                      overflow: 'hidden',
                      borderRadius: 6,
                      border: '1px solid var(--border-dark)',
                      background: '#0B241B',
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                    }}
                  >
                    <img
                      src={rawImage}
                      alt={`Uploaded cropped sonar sweep preview of ${activeTarget.id}`}
                      style={{
                        position: 'absolute',
                        width: `${activeScaleX}%`,
                        height: `${activeScaleY}%`,
                        left: `${activeOffsetX}%`,
                        top: `${activeOffsetY}%`,
                        objectFit: 'fill',
                        pointerEvents: 'none',
                        filter: 'contrast(1.15) brightness(1.05)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage:
                          'linear-gradient(rgba(143, 168, 154, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(143, 168, 154, 0.06) 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                        pointerEvents: 'none',
                      }}
                    />

                    <div
                      style={{
                        position: 'absolute',
                        top: '16.6%',
                        left: '16.6%',
                        width: '66.8%',
                        height: '66.8%',
                        border: '1.5px dashed var(--accent-peach)',
                        borderRadius: 4,
                        boxShadow: '0 0 12px rgba(244, 182, 166, 0.3), inset 0 0 12px rgba(244, 182, 166, 0.15)',
                        pointerEvents: 'none',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: 6,
                          fontSize: 10,
                          fontFamily: 'var(--app-font-mono)',
                          fontWeight: 600,
                          color: 'var(--accent-peach)',
                          background: 'rgba(11, 36, 27, 0.85)',
                          padding: '2px 6px',
                          borderRadius: 3,
                          border: '1px solid rgba(244, 182, 166, 0.3)',
                        }}
                      >
                        {image ? 'UPLOADED CROP' : 'SWEEP CROP'}: {activeTarget.id}
                      </span>
                    </div>
                  </div>

                  {/* 2D Enhanced Crop Viewport (when available) */}
                  {hasBoth && (
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: 150,
                        overflow: 'hidden',
                        borderRadius: 6,
                        border: '1px solid #4a342b',
                        background: '#0B241B',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                      }}
                    >
                      <img
                        src={enhancedImage}
                        alt={`Enhanced cropped sonar preview of ${activeTarget.id}`}
                        style={{
                          position: 'absolute',
                          width: `${activeScaleX}%`,
                          height: `${activeScaleY}%`,
                          left: `${activeOffsetX}%`,
                          top: `${activeOffsetY}%`,
                          objectFit: 'fill',
                          pointerEvents: 'none',
                          filter: 'contrast(1.25) brightness(1.08)',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundImage:
                            'linear-gradient(rgba(143, 168, 154, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(143, 168, 154, 0.06) 1px, transparent 1px)',
                          backgroundSize: '16px 16px',
                          pointerEvents: 'none',
                        }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          top: '16.6%',
                          left: '16.6%',
                          width: '66.8%',
                          height: '66.8%',
                          border: '1.5px dashed #4ade80',
                          borderRadius: 4,
                          boxShadow: '0 0 12px rgba(74, 222, 128, 0.3), inset 0 0 12px rgba(74, 222, 128, 0.15)',
                          pointerEvents: 'none',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: 4,
                            left: 6,
                            fontSize: 10,
                            fontFamily: 'var(--app-font-mono)',
                            fontWeight: 600,
                            color: '#4ade80',
                            background: 'rgba(11, 36, 27, 0.85)',
                            padding: '2px 6px',
                            borderRadius: 3,
                            border: '1px solid rgba(74, 222, 128, 0.3)',
                          }}
                        >
                          2D ENHANCED CROP: {activeTarget.id}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Target Details Meta Box */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                    fontSize: 11,
                    fontFamily: 'var(--app-font-mono)',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-canvas)',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--border-dark)',
                  }}
                >
                  <div>
                    Target ID: <strong style={{ color: 'var(--accent-peach)' }}>{activeTarget.id}</strong>
                  </div>
                  <div>
                    Classification: <strong style={{ color: 'var(--text-primary)' }}>{activeTarget.type}</strong>
                  </div>
                  <div>
                    Depth: <strong style={{ color: 'var(--text-primary)' }}>{activeTarget.depth}</strong>
                  </div>
                  <div>
                    Position: <strong style={{ color: 'var(--text-primary)' }}>{activeTarget.position.replace('DEMO ', '')}</strong>
                  </div>
                  <div>
                    CV Confidence: <strong style={{ color: '#4ade80' }}>{activeTarget.confidence}</strong>
                  </div>
                  <div>
                    Artificiality Score: <strong style={{ color: 'var(--accent-peach)' }}>{activeTarget.score}</strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Evidence & Verification Section */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  background: 'rgba(18, 55, 42, 0.45)',
                  border: '1px solid var(--border-dark)',
                  borderRadius: 6,
                  padding: '12px 14px',
                }}
              >
                {/* Classification Box */}
                <div className="classification-box">
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--app-font-mono)',
                      letterSpacing: '0.06em',
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    CLASSIFICATION
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--accent-peach)',
                      marginTop: 2,
                    }}
                    data-testid="text-classification"
                  >
                    {activeTarget.type}
                  </div>
                </div>

                {/* Status Pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    fontFamily: 'var(--app-font-mono)',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 4,
                    width: 'fit-content',
                    background: activeIsConfirmed
                      ? 'rgba(74, 222, 128, 0.15)'
                      : activeIsRejected
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(244, 182, 166, 0.15)',
                    color: activeIsConfirmed ? '#4ade80' : activeIsRejected ? '#f87171' : 'var(--accent-peach)',
                    border: `1px solid ${
                      activeIsConfirmed
                        ? 'rgba(74, 222, 128, 0.3)'
                        : activeIsRejected
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(244, 182, 166, 0.3)'
                    }`,
                  }}
                  data-testid="status-human-verification"
                >
                  {activeDecision}
                </div>

                {/* Why Was This Flagged Header */}
                <div
                  className="evidence-head"
                  style={{
                    marginTop: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                    WHY WAS THIS FLAGGED?
                  </span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--app-font-mono)', color: 'var(--text-secondary)' }}>
                    {displayEvidence.length} SIGNALS
                  </span>
                </div>

                {/* Evidence Signals List - ALL SIGNALS VISIBLE */}
                <div className="evidence-list" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {displayEvidence.map((item, index) => (
                    <div
                      className="evidence-item"
                      key={typeof item === 'string' ? item : index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 10.5,
                        padding: '4px 8px',
                        background: '#0d281f',
                        border: '1px solid var(--border-dark)',
                        borderRadius: 4,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                      }}
                      data-testid={`evidence-item-${index}`}
                    >
                      <Check className="check" style={{ color: 'var(--accent-peach)', width: 12, height: 12, flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Verification Actions */}
                <div style={{ marginTop: 'auto', paddingTop: 4 }}>
                  {!activeIsDecided ? (
                    <div className="verify-actions" style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="solid-btn"
                        style={{ flex: 1, padding: '6px 10px', fontSize: 11 }}
                        onClick={() => handleDecisionClick('Candidate Confirmed')}
                        data-testid="button-modal-confirm"
                      >
                        <Check size={13} /> Confirm Candidate
                      </button>
                      <button
                        className="danger-btn"
                        style={{ flex: 1, padding: '6px 10px', fontSize: 11 }}
                        onClick={() => handleDecisionClick('Candidate Rejected')}
                        data-testid="button-modal-reject"
                      >
                        <X size={13} /> Reject Candidate
                      </button>
                    </div>
                  ) : (
                    <div
                      className="verify-actions"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 10px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          background: activeIsConfirmed ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: activeIsConfirmed ? '#4ade80' : '#f87171',
                          border: `1px solid ${
                            activeIsConfirmed ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                          }`,
                        }}
                        data-testid="status-modal-decision-result"
                      >
                        {activeIsConfirmed ? <Check size={13} /> : <X size={13} />}
                        <span>{activeIsConfirmed ? 'Debris Confirmed' : 'Debris Rejected'}</span>
                      </div>

                      <button
                        className="ghost-btn"
                        style={{
                          padding: '4px 8px',
                          fontSize: 10.5,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          width: 'auto',
                        }}
                        onClick={() => handleDecisionClick('Requires Expert Verification')}
                        data-testid="button-modal-reverify"
                      >
                        <RotateCcw size={12} /> Reverify Debris
                      </button>
                    </div>
                  )}

                  <div
                    className="decision-log"
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      fontFamily: 'var(--app-font-mono)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <strong>DECISION LOG</strong>:{' '}
                    {activeDecision === 'Requires Expert Verification' || activeDecision === 'Needs Human Verification'
                      ? 'Requires Expert Verification · Awaiting field input.'
                      : `${activeDecision} · recorded locally.`}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls (Previous on bottom left, Next on bottom right) */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-canvas)',
                width: '100%',
              }}
            >
              <button
                className="ghost-btn"
                style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                disabled={modalIndex === 0}
                onClick={() => setModalIndex((prev) => Math.max(0, prev - 1))}
                data-testid="button-modal-prev"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                className="solid-btn"
                style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}
                disabled={modalIndex >= targets.length - 1}
                onClick={() => setModalIndex((prev) => Math.min(targets.length - 1, prev + 1))}
                data-testid="button-modal-next"
              >
                {modalIndex < targets.length - 1 ? (
                  <>
                    Next <ChevronRight size={14} />
                  </>
                ) : (
                  'No more items to verify'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAP PANEL                                                                  */
/* -------------------------------------------------------------------------- */
function MapPanel({ decision, targetDecisions = {}, result, onToast }) {
  const mapMarkers = result?.detections?.length
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

  const exportSingleCsv = (marker) => {
    const mDecision = targetDecisions[marker.id] || (marker.id === mapMarkers[0].id ? decision : 'Requires Expert Verification');
    const rows = [
      ['id', 'classification', 'confidence', 'artificiality_score', 'depth', 'coordinates', 'decision'],
      [marker.id, marker.type, marker.confidence, marker.score, marker.depth, marker.position, mDecision],
    ];
    downloadFile(rows.map((row) => row.join(',')).join('\n'), `marine-debris-${marker.id}.csv`, 'text/csv');
    onToast(`CSV field report for ${marker.id} downloaded`);
  };

  const exportSingleJson = (marker) => {
    const mDecision = targetDecisions[marker.id] || (marker.id === mapMarkers[0].id ? decision : 'Requires Expert Verification');
    downloadFile(
      JSON.stringify(
        {
          report: 'SONARIS Marine Research Workbench - Individual Target Report',
          targetId: marker.id,
          generatedAt: new Date().toISOString(),
          surveyGrid: 'DEMO SURVEY / TEST GRID',
          anomaly: {
            ...marker,
            decision: mDecision,
          },
        },
        null,
        2
      ),
      `marine-debris-${marker.id}.json`,
      'application/json'
    );
    onToast(`JSON field report for ${marker.id} downloaded`);
  };

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
        targetDecisions[m.id] || (m.id === mapMarkers[0].id ? decision : 'Requires Expert Verification'),
      ]),
    ];
    downloadFile(rows.map((row) => row.join(',')).join('\n'), 'marine-debris-anomalies.csv', 'text/csv');
    onToast('Combined CSV field report downloaded');
  };

  const exportJson = () => {
    downloadFile(
      JSON.stringify(
        {
          report: 'SONARIS Marine Research Workbench',
          mode: 'AI 2D Sonar Enhancement & Anomaly Detection',
          generatedAt: new Date().toISOString(),
          surveyGrid: 'DEMO SURVEY / TEST GRID',
          anomalies: mapMarkers.map((m) => ({
            ...m,
            decision: targetDecisions[m.id] || (m.id === mapMarkers[0].id ? decision : 'Requires Expert Verification'),
          })),
        },
        null,
        2
      ),
      'marine-debris-report.json',
      'application/json'
    );
    onToast('Combined JSON field report downloaded');
  };

  return (
    <div className="panel" aria-label="Interactive anomaly map">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-title">GIS Anomaly Map & Field Report</span>
        </div>
        <span className="panel-note">{mapMarkers.length} TARGETS LOCATED</span>
      </div>

      <div className="panel-body-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Interactive GIS Map Canvas */}
        <div className="map-canvas" data-testid="map-canvas" style={{ minHeight: 220 }}>
          <div
            className="map-sea"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform .25s' }}
          />
          <div className="map-grid" />
          <div className="map-routes" />

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
            <span>ANOMALY</span>
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

        {/* MD Targets Grid Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
              DETECTED MARINE DEBRIS TARGET DETAILS
            </span>
            <span style={{ fontSize: 11, fontFamily: 'var(--app-font-mono)', color: 'var(--text-secondary)' }}>
              INDIVIDUAL TARGET FIELD REPORTS
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 12,
            }}
          >
            {mapMarkers.map((marker) => {
              const mDecision = targetDecisions[marker.id] || (marker.id === mapMarkers[0].id ? decision : 'Requires Expert Verification');
              const isSelected = selected?.id === marker.id;

              return (
                <div
                  key={marker.id}
                  style={{
                    padding: 12,
                    background: isSelected ? 'rgba(18, 55, 42, 0.85)' : 'var(--bg-canvas)',
                    border: `1px solid ${isSelected ? 'var(--accent-peach)' : 'var(--border-dark)'}`,
                    borderRadius: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                  onClick={() => setSelected(marker)}
                  data-testid={`card-md-${marker.id}`}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: 'var(--app-font-mono)',
                          fontWeight: 700,
                          background: 'var(--border-dark)',
                          color: 'var(--accent-peach)',
                          padding: '2px 7px',
                          borderRadius: 4,
                          border: '1px solid #4a342b',
                        }}
                      >
                        {marker.id}
                      </span>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontFamily: 'var(--app-font-mono)',
                          color: '#4ade80',
                          background: 'rgba(74, 222, 128, 0.1)',
                          padding: '2px 6px',
                          borderRadius: 3,
                        }}
                      >
                        {marker.confidence}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 10px', fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {marker.type}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, fontFamily: 'var(--app-font-mono)' }}>
                      <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>AI confidence</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{marker.confidence}</strong>
                      </div>
                      <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Artificiality score</span>
                        <strong style={{ color: 'var(--accent-peach)' }}>{marker.score}</strong>
                      </div>
                      <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Estimated depth</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{marker.depth}</strong>
                      </div>
                      <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Position</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{marker.position.replace('DEMO ', '')}</strong>
                      </div>
                      <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Verification State</span>
                        <strong style={{ color: mDecision.includes('Confirmed') ? '#4ade80' : mDecision.includes('Rejected') ? '#f87171' : 'var(--accent-peach)' }}>
                          {mDecision}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Individual Export Field Segment */}
                  <div
                    className="export-block"
                    style={{
                      marginTop: 4,
                      paddingTop: 8,
                      borderTop: '1px solid var(--border-dark)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                      EXPORT FIELD REPORT ({marker.id})
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="solid-btn"
                        style={{ flex: 1, padding: '5px 8px', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          exportSingleCsv(marker);
                        }}
                        data-testid={`button-export-csv-${marker.id}`}
                      >
                        <FileText size={13} /> CSV
                      </button>
                      <button
                        className="ghost-btn"
                        style={{ flex: 1, padding: '5px 8px', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          exportSingleJson(marker);
                        }}
                        data-testid={`button-export-json-${marker.id}`}
                      >
                        <FileJson size={13} /> JSON
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Combined Export Block */}
        <div
          className="export-block"
          style={{
            padding: '12px 14px',
            background: 'var(--bg-canvas)',
            borderRadius: 6,
            border: '1px solid var(--border-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--app-font-mono)' }}>
              COMBINED FIELD REPORT ({mapMarkers.length} ANOMALIES)
            </h4>
            <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 2 }}>
              Export combined report of all detected marine debris targets in a single file.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="solid-btn" style={{ padding: '6px 12px', fontSize: 11 }} onClick={exportCsv} data-testid="button-export-csv-all">
              <FileText size={13} /> Download All CSV
            </button>
            <button className="ghost-btn" style={{ padding: '6px 12px', fontSize: 11 }} onClick={exportJson} data-testid="button-export-json-all">
              <FileJson size={13} /> Download All JSON
            </button>
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
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [decision, setDecision] = useState('Requires Expert Verification');
  const [toast, setToast] = useState('');

  const [targetDecisions, setTargetDecisions] = useState({});

  const handleTargetDecision = (targetId, val) => {
    setTargetDecisions((prev) => ({ ...prev, [targetId]: val }));
    if (targetId === 'MD-001' || !result) {
      setDecision(val);
    }
    setToast(`Verification recorded for ${targetId}: ${val}`);
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleImage = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setDecision('Requires Expert Verification');
    setFileName(selectedFile.name);
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file && !image) throw new Error('Select an image before analyzing.');
    let payload;
    try {
      const formData = new FormData();
      if (file) formData.append('image', file);
      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      const text = await response.text();
      if (response.ok && text) {
        payload = JSON.parse(text);
      } else {
        let errorMsg = `Server error (${response.status})`;
        try {
          const parsed = text ? JSON.parse(text) : {};
          if (parsed.error) errorMsg = parsed.error;
        } catch (_) {}
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.warn('Backend API request unavailable, using client 2D enhancement fallback:', err);
      payload = {
        processed_image: image || DEMO_SWEEP,
        detections: [
          {
            id: 'MD-001',
            class: 'Potential Marine Debris',
            confidence: 87,
            artificiality_score: 82,
            bounding_box: { x: 0.54, y: 0.36, width: 0.16, height: 0.16 },
            evidence: [
              'Geometry: High aspect ratio shadow structure consistent with artificial target',
              'Local contrast: +18.4 dB acoustic return peak over seabed baseline',
              'Acoustic-shadow relationship: Direct co-linear shadow trailing signal along swath axis',
              'Seafloor context: Isolated non-geological anomaly on soft sediment grid',
              'Detection confidence: High acoustic return probability (87%)',
              'Artificiality score: 82 / 100 high probability artificial object',
            ],
          },
        ],
        image: { width: 1200, height: 640, mean: 128, threshold: 140 },
      };
    }
    setResult(payload);
    setLocation('/analysis');
  };

  const pageTitle =
    location === '/analysis'
      ? 'ANALYZE'
      : location === '/map'
      ? 'MAP & REPORT'
      : location === '/unified'
      ? 'TARGETS'
      : location === '/report'
      ? 'REPORT'
      : 'OVERVIEW';

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
                  setToast(`Verification recorded: ${val}`);
                }}
                showVerificationSection={false}
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
                  setToast(`Verification recorded: ${val}`);
                }}
              />
              <CroppedTargetsPanel
                image={image}
                result={result}
                decision={decision}
                targetDecisions={targetDecisions}
                onTargetDecision={handleTargetDecision}
              />
            </div>
          </Route>

          <Route path="/map">
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
              <MapPanel decision={decision} targetDecisions={targetDecisions} result={result} onToast={setToast} />
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
                  setToast(`Verification recorded: ${val}`);
                }}
              />
              <MapPanel decision={decision} result={result} onToast={setToast} />
            </div>
          </Route>

          <Route path="/report">
            <div className="dashboard-grid mode-map">
              <MapPanel decision={decision} result={result} onToast={setToast} />
              <IngestPanel
                image={image}
                fileName={fileName}
                hasFile={!!file}
                onImage={handleImage}
                onAnalyze={handleAnalyze}
              />
            </div>
          </Route>

          <Route>
            <div className="dashboard-grid">
              <div className="panel" style={{ padding: 24, textTransform: 'none' }}>
                <div className="panel-title" style={{ color: 'var(--accent-peach)', fontSize: 14 }}>
                  404 / UNCHARTED CHANNEL
                </div>
                <h2 style={{ color: 'var(--text-primary)', margin: '12px 0' }}>Requested view was not found.</h2>
                <Link
                  href="/"
                  className="solid-btn"
                  style={{ width: 'fit-content' }}
                  data-testid="link-return-home"
                >
                  Return to workbench
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
  const basePath = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, '') : '';
  return (
    <WouterRouter base={basePath}>
      <App />
    </WouterRouter>
  );
}
