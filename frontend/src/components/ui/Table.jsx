// frontend/src/components/ui/Table.jsx
import "./Table.css";

function Table({ headers, children, emptyMessage = "No data available." }) {
  return (
    <div className="ui-table-container">
      <table className="ui-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* If no children (empty array), show empty state */}
          {(!children || (Array.isArray(children) && children.length === 0)) ? (
            <tr>
              <td colSpan={headers.length} className="ui-table-empty">
                <div className="empty-state">
                  <span className="empty-icon">📂</span>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
