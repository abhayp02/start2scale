export default function StatusBadge({ status }) {
  const c =
    {
      active: "success",
      completed: "success",
      verified: "success",
      eligible: "success",
      published: "blue",
      shortlisted: "blue",
      submitted: "warning",
      pending: "warning",
      rejected: "danger",
      closed: "danger",
    }[status] || "";
  return (
    <span className={`badge ${c}`}>
      ● {String(status).replaceAll("-", " ")}
    </span>
  );
}
