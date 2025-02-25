import React from "react";
import "./DynamicTable.css"; // Import CSS for styling

function DynamicTable({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0 || data.every((item) => item === null)) {
    return <p className="no-data">No data available</p>;
  }

  // Find the first non-null object to extract headers
  const validData = data.find((item) => item && typeof item === "object");
  
  // If all entries are null, return no data
  if (!validData) {
    return <p className="no-data">No data available</p>;
  }

  const headers = Object.keys(validData);

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th style={{backgroundColor:'#5cb0e7', width:'40px'}} key={header}>{header.charAt(0).toUpperCase() + header.slice(1)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {headers.map((header) => {
                const value = item && typeof item === "object" ? item[header] : null;
                return (
                  <td key={`${index}-${header}`}>
                    {value === null || value === undefined || value === " " || value === "" || (typeof value === "object" && Object.keys(value).length === 0)
                      ? "-"
                      : typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DynamicTable;
