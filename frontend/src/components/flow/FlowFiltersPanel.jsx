import { FLOW_DIRECTIONS } from "../../constants.js";

export function FlowFiltersPanel({
  flowLevel,
  onFlowLevelChange,
  flowFilters,
  onFlowFiltersChange,
  flowOptions,
  isLoading
}) {
  return (
    <div className={`panel ${isLoading ? "panel-loading" : ""}`}>
      <div className="section">
        <div className="section-title">Flow Scope</div>
        <label className="control">
          <span>Level</span>
          <select className="select-input" value={flowLevel} onChange={onFlowLevelChange}>
            <option value="state">State</option>
            <option value="county">County</option>
            <option value="congress">Congressional District</option>
          </select>
        </label>
      </div>

      <div className="section">
        <div className="section-title">Agency</div>
        <label className="control">
          <span>Department</span>
          <select
            className="select-input"
            value={flowFilters.agency}
            onChange={(event) =>
              onFlowFiltersChange((prev) => ({ ...prev, agency: event.target.value }))
            }
          >
            <option value="All">All Agencies</option>
            {flowOptions.agencies.map((agency) => (
              <option key={agency} value={agency}>
                {agency}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="section">
        <div className="section-title">Location</div>
        <label className="control">
          <span>State</span>
          <select
            className="select-input"
            value={flowFilters.state}
            onChange={(event) =>
              onFlowFiltersChange((prev) => ({ ...prev, state: event.target.value }))
            }
          >
            <option value="All">All States</option>
            {flowOptions.states.map((stateOption) => (
              <option key={stateOption} value={stateOption}>
                {stateOption}
              </option>
            ))}
          </select>
        </label>
        <div className="control">
          <span>Direction</span>
          <div className="direction-toggle" role="group" aria-label="Flow direction">
            {FLOW_DIRECTIONS.map((direction) => (
              <button
                key={direction.value}
                type="button"
                className={`direction-btn ${direction.tone} ${
                  flowFilters.direction === direction.value ? "active" : ""
                }`}
                aria-pressed={flowFilters.direction === direction.value}
                disabled={flowFilters.state === "All"}
                onClick={() =>
                  onFlowFiltersChange((prev) => ({
                    ...prev,
                    direction: direction.value
                  }))
                }
              >
                {direction.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {flowLevel === "state" && flowOptions.industries.length > 0 && (
        <div className="section">
          <div className="section-title">Industry</div>
          <label className="control">
            <span>NAICS</span>
            <select
              className="select-input"
              value={flowFilters.naics}
              onChange={(event) =>
                onFlowFiltersChange((prev) => ({ ...prev, naics: event.target.value }))
              }
            >
              <option value="All">All Industries</option>
              {flowOptions.industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {flowLevel === "congress" && flowOptions.industries.length > 0 && (
        <div className="section">
          <div className="section-title">Industry</div>
          <label className="control">
            <span>Industry</span>
            <select
              className="select-input"
              value={flowFilters.naics}
              onChange={(event) =>
                onFlowFiltersChange((prev) => ({ ...prev, naics: event.target.value }))
              }
            >
              <option value="All">All Industries</option>
              {flowOptions.industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {(flowLevel === "county" || flowLevel === "congress") && (
        <div className="section">
          <div className="section-title">Year Range</div>
          <label className="control">
            <span>Year Start</span>
            <select
              className="select-input"
              value={flowFilters.yearStart || ""}
              disabled={!flowOptions.years.length}
              onChange={(event) => {
                const nextValue = event.target.value ? Number(event.target.value) : null;
                onFlowFiltersChange((prev) => ({
                  ...prev,
                  yearStart: nextValue,
                  yearEnd:
                    prev.yearEnd && nextValue && prev.yearEnd < nextValue
                      ? nextValue
                      : prev.yearEnd
                }));
              }}
            >
              {flowOptions.years.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </label>
          <label className="control">
            <span>Year End</span>
            <select
              className="select-input"
              value={flowFilters.yearEnd || ""}
              disabled={!flowOptions.years.length}
              onChange={(event) => {
                const nextValue = event.target.value ? Number(event.target.value) : null;
                onFlowFiltersChange((prev) => ({
                  ...prev,
                  yearEnd: nextValue,
                  yearStart:
                    prev.yearStart && nextValue && prev.yearStart > nextValue
                      ? nextValue
                      : prev.yearStart
                }));
              }}
            >
              {flowOptions.years.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="section">
        <div className="section-title">Flow Volume</div>
        <div className="control">
          <span>Flow Range</span>
          <div className="range-toggle" role="group" aria-label="Flow volume range">
            {[
              { value: "top10", label: "Top 10" },
              { value: "top50", label: "Top 50" },
              { value: "50-100", label: "50–100" },
              { value: "100-150", label: "100–150" },
              { value: "150+", label: "150+" }
            ].map((range) => (
              <button
                key={range.value}
                type="button"
                className={`direction-btn ${flowFilters.flowRange === range.value ? "active" : ""}`}
                aria-pressed={flowFilters.flowRange === range.value}
                onClick={() =>
                  onFlowFiltersChange((prev) => ({ ...prev, flowRange: range.value }))
                }
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Legend</div>
        <div className="flow-legend-compact">
          <div className="flow-thickness-compact">
            <span className="flow-thickness-label">Inflow (Blue)</span>
            <div className="flow-thickness-scale">
              <div className="flow-scale-line inflow q1" />
              <div className="flow-scale-line inflow q2" />
              <div className="flow-scale-line inflow q3" />
              <div className="flow-scale-line inflow q4" />
              <div className="flow-scale-line inflow q5" />
            </div>
            <div className="flow-scale-labels">
              <span>Q1</span>
              <span>Q5</span>
            </div>
          </div>
          <div className="flow-thickness-compact">
            <span className="flow-thickness-label">Outflow (Red)</span>
            <div className="flow-thickness-scale">
              <div className="flow-scale-line outflow q1" />
              <div className="flow-scale-line outflow q2" />
              <div className="flow-scale-line outflow q3" />
              <div className="flow-scale-line outflow q4" />
              <div className="flow-scale-line outflow q5" />
            </div>
            <div className="flow-scale-labels">
              <span>Q1</span>
              <span>Q5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
