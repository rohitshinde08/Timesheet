function Card({ title, subtitle, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-slate-50/50">
          {title && <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6 flex-1 bg-white/50">
        {children}
      </div>
    </div>
  );
}

export default Card;
