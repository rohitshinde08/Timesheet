// frontend/src/components/ui/Badge.jsx
function Badge({ children, variant = "default" }) {
  const baseStyles = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "16px",
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  };

  const variants = {
    default: { background: "var(--color-bg)", color: "var(--color-text-muted)" },
    primary: { background: "var(--color-primary-light)", color: "var(--color-primary)" },
    success: { background: "var(--color-success-bg)", color: "var(--color-success)" },
    warning: { background: "var(--color-warning-bg)", color: "var(--color-warning)" },
    danger: { background: "var(--color-danger-bg)", color: "var(--color-danger)" },
  };

  // Map known statuses/roles dynamically
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

  const styles = { ...baseStyles, ...variants[mappedVariant] };

  return <span style={styles}>{children}</span>;
}

export default Badge;
