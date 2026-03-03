import { Link } from "react-router-dom";

export function DashboardHelpPanel({ guide, isOpen, onToggle }) {
  if (!guide) return null;

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="dash-help-tab"
          onClick={onToggle}
          aria-label="Open help"
        >
          Help
        </button>
      )}

      <aside className={`dash-help-panel ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <div className="dash-help-header">
          <div className="dash-help-eyebrow">Dashboard Help</div>
          <div className="dash-help-title">{guide.title}</div>
          <div className="dash-help-actions">
            <Link to="/dashboard-reports" className="dash-help-link">
              Full documentation
            </Link>
            <button
              type="button"
              className="dash-help-close"
              onClick={onToggle}
              aria-label="Minimize help"
            >
              −
            </button>
          </div>
        </div>

        <div className="dash-help-body">
          <section className="dash-help-section">
            <h3 className="dash-help-section-title">What this dashboard does</h3>
            <p className="dash-help-text">{guide.summary}</p>
          </section>

          <section className="dash-help-section">
            <h3 className="dash-help-section-title">Quick use</h3>
            <ul className="dash-help-list">
              {guide.howToUse.map((item) => (
                <li key={`${guide.id}-how-${item}`}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="dash-help-section">
            <h3 className="dash-help-section-title">Dropdown reference</h3>
            <div className="dash-help-dropdowns">
              {guide.dropdowns.map((dropdown) => (
                <article key={`${guide.id}-dd-${dropdown.control}`} className="dash-help-dropdown">
                  <h4>{dropdown.control}</h4>
                  <p>
                    <strong>Control:</strong> {dropdown.controlType}
                  </p>
                  <p>
                    <strong>Options:</strong> {dropdown.options}
                  </p>
                  <p>
                    <strong>Effect:</strong> {dropdown.impact}
                  </p>
                  {dropdown.notes && (
                    <p>
                      <strong>Note:</strong> {dropdown.notes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
