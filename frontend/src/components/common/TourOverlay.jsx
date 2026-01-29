import { TOUR_STEPS } from "../../constants.js";

export function TourOverlay({ tourOpen, tourStep, setTourOpen, setTourStep }) {
  if (!tourOpen) return null;
  const tour = TOUR_STEPS[tourStep] || TOUR_STEPS[0];

  return (
    <div className="tour-overlay">
      <div className="tour-card">
        <div className="tour-header">
          <div>
            <div className="tour-kicker">
              Step {tourStep + 1} of {TOUR_STEPS.length}
            </div>
            <div className="tour-title">{tour.title}</div>
          </div>
          <button
            className="tour-close"
            type="button"
            onClick={() => {
              setTourOpen(false);
              localStorage.setItem("oa_tour_dismissed", "1");
            }}
          >
            ×
          </button>
        </div>
        <div className="tour-body">{tour.body}</div>
        {tour.bullets && (
          <ul className="tour-list">
            {tour.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <div className="tour-actions">
          <button
            className="tour-btn"
            type="button"
            onClick={() => setTourStep((step) => Math.max(0, step - 1))}
            disabled={tourStep === 0}
          >
            Back
          </button>
          <div className="tour-dots">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`tour-dot ${idx === tourStep ? "active" : ""}`}
              />
            ))}
          </div>
          {tourStep < TOUR_STEPS.length - 1 ? (
            <button
              className="tour-btn primary"
              type="button"
              onClick={() =>
                setTourStep((step) => Math.min(TOUR_STEPS.length - 1, step + 1))
              }
            >
              Next
            </button>
          ) : (
            <button
              className="tour-btn primary"
              type="button"
              onClick={() => {
                setTourOpen(false);
                localStorage.setItem("oa_tour_dismissed", "1");
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
