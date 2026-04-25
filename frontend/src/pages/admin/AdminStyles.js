/* Shared admin table/page styles - light traditional theme */
export const ADMIN_BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');

  .adm-page { font-family: 'Source Sans 3', sans-serif; color: #1a1a18; animation: adm-fadein 0.3s ease; }
  @keyframes adm-fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  .adm-eyebrow { color: #c8a84b; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 0.35rem; }
  .adm-title { font-family: 'Libre Baskerville', serif; font-size: 1.65rem; font-weight: 700; color: #1a1a18; }
  .adm-sub { font-size: 0.84rem; color: #888078; margin-top: 0.3rem; }
  .adm-rule { border: none; border-top: 1px solid #ddd8cc; margin: 1.4rem 0; }

  .adm-toast { padding: 0.65rem 1rem; font-size: 0.82rem; font-weight: 600; margin-bottom: 1.1rem; border: 1px solid; border-left-width: 3px; display: flex; align-items: center; gap: 0.45rem; }
  .adm-toast-success { background: #f0fff4; border-color: #b8f0d0; border-left-color: #5a8a5a; color: #1b4a2a; }
  .adm-toast-error { background: #fff5f5; border-color: #f5c6c6; border-left-color: #c87070; color: #8b2020; }

  /* FILTER PILLS */
  .adm-filters { display: flex; gap: 0; flex-wrap: wrap; margin-bottom: 1.1rem; border: 1px solid #ddd8cc; width: fit-content; }
  .adm-filter-btn { padding: 0.38rem 0.95rem; border-right: 1px solid #ddd8cc; background: #fff; color: #7a7060; font-size: 0.75rem; font-weight: 700; cursor: pointer; font-family: 'Source Sans 3', sans-serif; letter-spacing: 0.04em; text-transform: uppercase; border-top: none; border-bottom: none; border-left: none; transition: all 0.15s; }
  .adm-filter-btn:last-child { border-right: none; }
  .adm-filter-btn.active { background: #1a1a18; color: #f5f0e8; }
  .adm-filter-btn:hover:not(.active) { background: #f0ece2; }

  /* SEARCH */
  .adm-search-wrap { position: relative; display: inline-block; }
  .adm-search-icon { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: #bbb4a8; font-size: 0.85rem; }
  .adm-search-input { padding: 0.55rem 0.9rem 0.55rem 2.2rem; border: 1px solid #ddd8cc; background: #fff; font-family: 'Source Sans 3', sans-serif; font-size: 0.85rem; color: #1a1a18; outline: none; transition: all 0.2s; min-width: 240px; }
  .adm-search-input:focus { border-color: #c8a84b; box-shadow: 0 0 0 3px rgba(200,168,75,0.1); }

  /* TABLE */
  .adm-table-wrap { background: #fff; border: 1px solid #ddd8cc; overflow: hidden; }
  .adm-table { width: 100%; border-collapse: collapse; }
  .adm-table th { padding: 0.65rem 1rem; text-align: left; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #7a7060; background: #f7f4ee; border-bottom: 1px solid #ddd8cc; white-space: nowrap; font-family: 'Source Sans 3', sans-serif; }
  .adm-table td { padding: 0.82rem 1rem; font-size: 0.855rem; border-bottom: 1px solid #f0ece8; vertical-align: middle; }
  .adm-table tr:last-child td { border-bottom: none; }
  .adm-table tr:hover td { background: #faf8f4; }
  .adm-table tr.row-deleted td { opacity: 0.5; }

  /* STATUS BADGES */
  .adm-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.65rem; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; border: 1px solid; }
  .adm-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .adm-badge-green { color: #2a6a2a; background: #f0fff4; border-color: #b8f0d0; }
  .adm-badge-red { color: #8b2020; background: #fff5f5; border-color: #f5c6c6; }
  .adm-badge-amber { color: #6a5020; background: #fffbf0; border-color: #f0e0a0; }
  .adm-badge-blue { color: #1b3d6b; background: #f0f6ff; border-color: #b8d4f5; }
  .adm-badge-gray { color: #5a5550; background: #f5f4f0; border-color: #ddd8cc; }

  /* BUTTONS */
  .adm-btn { padding: 0.28rem 0.65rem; font-size: 0.72rem; font-weight: 700; font-family: 'Source Sans 3', sans-serif; cursor: pointer; border: 1px solid; transition: all 0.15s; letter-spacing: 0.03em; text-transform: uppercase; white-space: nowrap; }
  .adm-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .adm-btn-amber { color: #6a5020; border-color: #c8a84b; background: #fffbf0; }
  .adm-btn-amber:hover:not(:disabled) { background: #c8a84b; color: #1a1a18; }
  .adm-btn-green { color: #2a6a2a; border-color: #5a8a5a; background: #f0fff4; }
  .adm-btn-green:hover:not(:disabled) { background: #5a8a5a; color: #fff; }
  .adm-btn-red { color: #8b2020; border-color: #c87070; background: #fff5f5; }
  .adm-btn-red:hover:not(:disabled) { background: #c87070; color: #fff; }
  .adm-btn-blue { color: #1b3d6b; border-color: #4a7ab5; background: #f0f6ff; }
  .adm-btn-blue:hover:not(:disabled) { background: #4a7ab5; color: #fff; }
  .adm-btn-divider { width: 1px; height: 18px; background: #ddd8cc; flex-shrink: 0; display: inline-block; margin: 0 0.15rem; vertical-align: middle; }

  /* FORM CARD */
  .adm-form-card { background: #fff; border: 1px solid #ddd8cc; border-top: 2px solid #c8a84b; padding: 1.4rem 1.5rem; margin-bottom: 1.25rem; }
  .adm-form-title { font-size: 0.72rem; font-weight: 700; color: #c8a84b; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1rem; }
  .adm-form-row { display: flex; gap: 0.875rem; flex-wrap: wrap; align-items: flex-end; }
  .adm-form-field { flex: 1 1 160px; display: flex; flex-direction: column; gap: 0.3rem; }
  .adm-form-label { font-size: 0.68rem; color: #7a7060; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
  .adm-form-input { padding: 0.55rem 0.8rem; border: 1px solid #ddd8cc; background: #faf8f4; font-family: 'Source Sans 3', sans-serif; font-size: 0.875rem; color: #1a1a18; outline: none; transition: all 0.2s; }
  .adm-form-input:focus { border-color: #c8a84b; background: #fff; }
  .adm-form-input::placeholder { color: #bbb4a8; }
  .adm-form-btn { padding: 0.58rem 1.5rem; background: #1a1a18; color: #f5f0e8; border: 1px solid #1a1a18; font-size: 0.8rem; font-weight: 700; font-family: 'Source Sans 3', sans-serif; cursor: pointer; letter-spacing: 0.06em; text-transform: uppercase; transition: all 0.2s; white-space: nowrap; align-self: flex-end; }
  .adm-form-btn:hover { background: #c8a84b; border-color: #c8a84b; color: #1a1a18; }

  /* PAGINATION */
  .adm-pagination { display: flex; justify-content: center; align-items: center; gap: 0; margin-top: 1.25rem; border: 1px solid #ddd8cc; width: fit-content; margin-inline: auto; }
  .adm-page-btn { padding: 0.45rem 0.85rem; border-right: 1px solid #ddd8cc; background: #fff; color: #4a4540; font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all 0.15s; border-top: none; border-bottom: none; border-left: none; min-width: 38px; text-align: center; }
  .adm-page-btn:last-child { border-right: none; }
  .adm-page-btn.active { background: #1a1a18; color: #f5f0e8; }
  .adm-page-btn:hover:not(.active):not(:disabled) { background: #f0ece2; }
  .adm-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* LOADING */
  .adm-loading { color: #888078; font-size: 0.88rem; padding: 3rem 0; text-align: center; }
  .adm-empty { color: #888078; font-size: 0.88rem; padding: 3rem 0; text-align: center; }

  /* TOOLBAR */
  .adm-toolbar { display: flex; gap: 0.75rem; margin-bottom: 1.1rem; align-items: center; flex-wrap: wrap; }

  /* STAT GRID */
  .adm-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
  .adm-stat-card { background: #fff; border: 1px solid #ddd8cc; border-top: 2px solid; padding: 1.1rem 1.25rem; }
  .adm-stat-label { font-size: 0.68rem; color: #888078; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.45rem; font-weight: 700; }
  .adm-stat-value { font-family: 'Libre Baskerville', serif; font-size: 1.65rem; font-weight: 700; line-height: 1; }

  /* CARD (refund) */
  .adm-card { background: #fff; border: 1px solid #ddd8cc; border-top: 2px solid #c8a84b; margin-bottom: 1rem; }
  .adm-card-head { background: #f7f4ee; border-bottom: 1px solid #ede9e0; padding: 0.9rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
  .adm-card-body { padding: 1.1rem 1.25rem; }

  .adm-id { font-family: 'Libre Baskerville', serif; font-weight: 700; color: #1a5a9a; }
  .adm-chip { font-size: 0.72rem; font-weight: 700; color: #7a7060; background: #f0ece8; border: 1px solid #ddd8cc; padding: 0.18rem 0.55rem; letter-spacing: 0.04em; }
  .adm-amount { font-family: 'Libre Baskerville', serif; font-size: 1.15rem; font-weight: 700; color: #1a1a18; }
  .adm-date { font-size: 0.76rem; color: #888078; }

  .adm-items-label { font-size: 0.68rem; font-weight: 700; color: #888078; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.6rem; }
  .adm-item-row { display: flex; align-items: center; gap: 1.5rem; padding: 0.5rem 0; border-bottom: 1px solid #f0ece8; font-size: 0.84rem; }
  .adm-item-row:last-child { border-bottom: none; }
  .adm-item-prod { color: #1a5a9a; font-weight: 600; }
  .adm-item-qty { color: #888078; }
  .adm-item-sub { margin-left: auto; font-weight: 700; color: #2a6a2a; font-family: 'Libre Baskerville', serif; }

  .adm-action-row { display: flex; gap: 0.6rem; margin-top: 1rem; }
  .adm-action-btn { flex: 1; padding: 0.6rem; font-size: 0.8rem; font-weight: 700; font-family: 'Source Sans 3', sans-serif; cursor: pointer; letter-spacing: 0.05em; text-transform: uppercase; transition: all 0.2s; border: 1px solid; }
  .adm-action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .adm-action-approve { color: #2a6a2a; border-color: #5a8a5a; background: #f0fff4; }
  .adm-action-approve:hover:not(:disabled) { background: #5a8a5a; color: #fff; }
  .adm-action-reject { color: #8b2020; border-color: #c87070; background: #fff5f5; }
  .adm-action-reject:hover:not(:disabled) { background: #c87070; color: #fff; }

  /* EXPAND ROW */
  .adm-expand-cell { padding: 0 1rem 1rem; background: #faf8f4; }
  .adm-expand-inner { border: 1px solid #ede9e0; background: #fff; padding: 0.875rem 1rem; }
  .adm-expand-label { font-size: 0.65rem; font-weight: 700; color: #888078; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.6rem; }

  /* LEGEND */
  .adm-legend { display: flex; gap: 1.25rem; margin-bottom: 0.85rem; flex-wrap: wrap; }
  .adm-legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; color: #888078; }
  .adm-legend-dot { width: 8px; height: 8px; flex-shrink: 0; }

  @media(max-width:700px) { .adm-filters { width: 100%; } .adm-filter-btn { flex: 1; text-align: center; } }
`;