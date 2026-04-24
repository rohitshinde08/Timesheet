// frontend/src/components/ui/Button.jsx
import "./Button.css";

function Button({ children, variant = "primary", size = "normal", className = "", ...props }) {
  const classes = ["ui-button", `ui-button-${variant}`, `ui-button-${size}`, className].filter(Boolean).join(" ");
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
