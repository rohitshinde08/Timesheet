function Table({ headers, children, emptyMessage = "No data available." }) {
  const hasData = Array.isArray(children) ? children.length > 0 : !!children;

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className="bg-slate-50/50 backdrop-blur-sm">
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 first:rounded-tl-xl last:rounded-tr-xl"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {hasData ? (
            children
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-sm text-slate-400 font-medium">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  {emptyMessage}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
