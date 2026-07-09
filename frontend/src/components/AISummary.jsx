import './AISummary.css'

export default function AISummary({ summary, issues = [] }) {
  return (
    <div className="ai-summary">
      <div className="ai-summary-header">
        <span className="ai-badge">✦ AI-GENERATED SUMMARY</span>
      </div>
      <p className="ai-summary-text">{summary}</p>
      {issues.length > 0 && (
        <div>
          <strong className="key-issues-label">Key Issues</strong>
          <div className="ai-issue-tags">
            {issues.map(issue => (
              <span key={issue} className="ai-issue-tag">{issue}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
