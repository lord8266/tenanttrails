import { useState } from 'react'
import { api, optimized } from '../api'
import './ReviewDialog.css'

export default function ReviewDialog({ onClose, onSubmit, initial, allowAttachments = true }) {
  const isEdit = Boolean(initial)
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [hovered, setHovered] = useState(0)
  const [body, setBody] = useState(initial?.body ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)

  async function handleFiles(ev) {
    const files = Array.from(ev.target.files)
    ev.target.value = '' // let the same file be re-picked later
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const uploaded = await Promise.all(files.map((f) => api.upload(f)))
      setAttachments((prev) => [...prev, ...uploaded])
    } catch (err) {
      setError(err.message || 'Could not upload file.')
    } finally {
      setUploading(false)
    }
  }

  function removeAttachment(idx) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    if (rating === 0 || !body.trim()) {
      setError('Please select a rating and write a review.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ rating, body, attachments })
      onClose()
    } catch (err) {
      setError(err.message || 'Could not submit your review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="review-dialog">
      <div className="dialog-header">
        <h2>{isEdit ? 'Edit Review' : 'Write a Review'}</h2>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>

      <div className="dialog-body">
        <label className="dialog-label">Your rating</label>
        <div className="star-input">
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              className="star-btn"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
            >
              {n <= (hovered || rating) ? '★' : '☆'}
            </span>
          ))}
        </div>
        {rating > 0 && <span className="rating-label">{rating} of 5</span>}

        <label className="dialog-label">Your review</label>
        <textarea
          className="review-textarea"
          placeholder="What was your experience living here? Cover maintenance, responsiveness, noise, pests, deposit handling, and anything future tenants should know."
          value={body}
          onChange={e => { setBody(e.target.value); setError('') }}
          rows={5}
        />

        {allowAttachments && (
        <>
        <label className="dialog-label">Photos &amp; documents</label>
        <div className="attach-row">
          <label className="attach-btn">
            {uploading ? 'Uploading…' : '+ Add files'}
            <input
              type="file"
              multiple
              hidden
              disabled={uploading}
              onChange={handleFiles}
            />
          </label>
        </div>
        {attachments.length > 0 && (
          <div className="attach-grid">
            {attachments.map((att, idx) => (
              <div key={att.url} className="attach-thumb">
                {att.type?.startsWith('image') ? (
                  <img src={optimized(att.url, 200)} alt="attachment" />
                ) : (
                  <a href={att.url} target="_blank" rel="noreferrer" className="attach-file">📄</a>
                )}
                <button
                  type="button"
                  className="attach-remove"
                  onClick={() => removeAttachment(idx)}
                  aria-label="Remove attachment"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        </>
        )}

        {error && <p className="dialog-error">{error}</p>}
      </div>

      <div className="dialog-footer">
        <button className="btn-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
        <button className="btn-submit" onClick={handleSubmit} disabled={submitting || uploading}>
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit Review'}
        </button>
      </div>
    </div>
  )
}
