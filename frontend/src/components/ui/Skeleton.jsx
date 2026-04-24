// frontend/src/components/ui/Skeleton.jsx
function Skeleton({ count = 1, height = "20px", className = "" }) {
  const styles = {
    backgroundColor: "var(--color-border)",
    height,
    width: "100%",
    borderRadius: "var(--radius)",
    marginBottom: "12px",
    animation: "pulse 1.5s infinite ease-in-out",
  };

  const css = `
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.3; }
      100% { opacity: 0.6; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={styles} className={className} />
      ))}
    </>
  );
}

export default Skeleton;
