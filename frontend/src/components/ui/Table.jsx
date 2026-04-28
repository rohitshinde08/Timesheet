function Table({ headers, children, emptyMessage = "No data available." }) {
  const hasData = Array.isArray(children) ? children.length > 0 : !!children;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-y border-slate-100">
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {hasData ? (
            children
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
