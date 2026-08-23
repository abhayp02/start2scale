export default function Card({ title, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      <h2 className="card-title mb-4">{title}</h2>
      {children}
    </section>
  );
}
