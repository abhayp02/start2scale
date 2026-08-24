export default function Card({ title, children, className = "", eyebrow }) {
  return (
    <section className={`card ${className}`}>
      {eyebrow && <p className="card-eyebrow">{eyebrow}</p>}
      <h2 className="card-title mb-4">{title}</h2>
      {children}
    </section>
  );
}
