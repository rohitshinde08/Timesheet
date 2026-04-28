function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-slate-100 text-slate-600",
    primary: "bg-indigo-100 text-indigo-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  };

  let mappedVariant = variant;
  switch (variant?.toLowerCase()) {
    case "admin":
    case "rejected":
      mappedVariant = "danger";
      break;
    case "manager":
    case "active":
    case "approved":
    case "done":
      mappedVariant = "success";
      break;
    case "hr":
    case "in-progress":
    case "pending":
      mappedVariant = "warning";
      break;
    case "employee":
    case "completed":
      mappedVariant = "primary";
      break;
    default:
      if (!variants[mappedVariant]) mappedVariant = "default";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${variants[mappedVariant]}`}>
      {children}
    </span>
  );
}

export default Badge;
