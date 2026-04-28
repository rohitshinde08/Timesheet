function Button({ children, variant = "primary", size = "md", style, type = "button", onClick, disabled, className="" }) {
  const baseClass = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      type={type}
      style={style}
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
