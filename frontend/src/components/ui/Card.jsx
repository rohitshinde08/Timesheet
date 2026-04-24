// frontend/src/components/ui/Card.jsx
import "./Card.css";

function Card({ children, title, subtitle, className = "" }) {
  return (
    <div className={`ui-card ${className}`}>
      {(title || subtitle) && (
        <div className="ui-card-header">
          {title && <h3 className="ui-card-title">{title}</h3>}
          {subtitle && <p className="ui-card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="ui-card-body">{children}</div>
    </div>
  );
}

export default Card;
