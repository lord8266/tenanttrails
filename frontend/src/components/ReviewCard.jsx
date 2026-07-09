import { useState } from 'react'
import StarRating from './StarRating'
import { optimized } from '../api'
import './ReviewCard.css'

export default function ReviewCard({
  rating,
  body,
  date,
  author = 'Anonymous',
  attachments = [],
  onEdit,
  onDelete,
  onAddFiles,
  onDeleteAttachment,
}) {
  const [busy, setBusy] = useState(false)
  const canManageAttachments = Boolean(onAddFiles || onDeleteAttachment)

  async function handleFiles(ev) {
    const files = Array.from(ev.target.files)
    ev.target.value = ''
    if (!files.length || !onAddFiles) return
    setBusy(true)
    try {
      await onAddFiles(files)
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(att) {
    if (!onDeleteAttachment) return
    setBusy(true)
    try {
      await onDeleteAttachment(att)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">{author.slice(0, 2).toUpperCase()}</div>
          <div className="reviewer-meta">
            <span className="review-author">{author}</span>
            <span className="review-date">{date}</span>
          </div>
        </div>
        <div className="review-right">
          <StarRating rating={rating} />
          {onEdit && (
            <button className="btn-edit" onClick={onEdit}>Edit</button>
          )}
          {onDelete && (
            <button className="btn-delete" onClick={onDelete}>Delete</button>
          )}
        </div>
      </div>
      <p className="review-body">{body}</p>

      {(attachments.length > 0 || canManageAttachments) && (
        <div className="review-attachments">
          {attachments.map(att => (
            <div key={att.id ?? att.url} className="attach-thumb">
              {att.type?.startsWith('image') ? (
                <a href={att.url} target="_blank" rel="noreferrer">
                  <img src={optimized(att.url, 200)} alt="attachment" loading="lazy" />
                </a>
              ) : (
                <a href={att.url} target="_blank" rel="noreferrer" className="attach-file">📄</a>
              )}
              {onDeleteAttachment && (
                <button
                  type="button"
                  className="attach-remove"
                  onClick={() => handleRemove(att)}
                  disabled={busy}
                  aria-label="Remove attachment"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {onAddFiles && (
            <label className="attach-add">
              {busy ? '…' : '+'}
              <input type="file" multiple hidden disabled={busy} onChange={handleFiles} />
            </label>
          )}
        </div>
      )}
    </div>
  )
}
