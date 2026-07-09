export default function StarRating({ rating, max = 5 }) {
  const full = Math.round(rating)
  return (
    <span className="stars">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < full ? 'star-filled' : 'star-empty'}>
          {i < full ? '★' : '☆'}
        </span>
      ))}
    </span>
  )
}
