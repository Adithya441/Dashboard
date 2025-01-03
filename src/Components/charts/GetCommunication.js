import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as XLSX from 'xlsx'; // Import for Excel
import jsPDF from 'jspdf'; // Import for PDF
import 'jspdf-autotable'; // Import for using autotable with jsPDF
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import loadingGif from '../../Assets/img2.gif';
import { ClientSideRowModelModule } from 'ag-grid-community';

const Apicall = ({ selectedLabel, office }) => {
  const [data, setData] = useState([]); // Ensure data is an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [start, setStart] = useState(0); // Start index for pagination
  const [recordsTotal, setRecordsTotal] = useState(0); // Total records count
  const length = 10; // Number of records per page
  const [exportFormat, setExportFormat] = useState(''); // Selected export format
  const [gridApi, setGridApi] = useState(null); // AG Grid API reference
  const [gridColumnApi, setGridColumnApi] = useState(null); // AG Grid Column API reference

  const [fromDate, setFromDate] = useState('');
  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const todaydate = `${year}${month}${day}`;
    setFromDate(todaydate);
  }, []);

  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          username: 'Admin',
          password: 'Admin@123',
          client_id: 'fooClientId',
          client_secret: 'secret',
        }),
      });

      if (!tokenResponse.ok) throw new Error('Failed to authenticate');
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      const baseUrl = `/api/server3/UHES-0.0.1/WS/ServerpaginationForCommunicationReport?office=${office}&fromdate=${fromDate}&TOTAL_COUNT=&draw=2&start=${start}&length=${length}`;
      const baseUrl1 = `/api/server3/UHES-0.0.1/WS/ServerpaginationForNonCommunicationReport?office=${office}&fromdate=${fromDate}&TOTAL_COUNT=&draw=2&start=${start}&length=${length}`;
      const baseUrl2 = `/api/server3/UHES-0.0.1/WS/ServerpaginationForNeverCommunicatedMetersReport?Date=${fromDate}&OfficeId=${office}&draw=1&length=${length}&start=${start}`;

      let dataResponse;
      if (selectedLabel === 'COMMUNICATED') {
        dataResponse = await fetch(baseUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } else if (selectedLabel === 'NOT COMMUNICATED') {
        dataResponse = await fetch(baseUrl1, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } else if (selectedLabel === 'NEVER COMMUNICATED') {
        dataResponse = await fetch(baseUrl2, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      console.log(responseData);

      setRecordsTotal(responseData.recordsTotal || 0);
      setData(responseData.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fromDate, start, length, selectedLabel, office]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // AG Grid column definitions
  const columnDefs = [
    {
      headerName: 'METERNO',
      field: 'METERNO',
      flex: 1,
      filter: true,
      sortable: true,
      valueFormatter: (params) => (params.value ? params.value : 'N/A'),
    },
    {
      headerName: 'MeterLastCommunicated',
      field: 'MeterLastCommunicated',
      flex: 1,
      filter: true,
      sortable: true,
      valueFormatter: (params) => (params.value ? params.value : 'N/A'),
    },
  ];

  // Pagination handlers
  const handleNextPage = () => setStart((prevStart) => prevStart + length);
  const handlePreviousPage = () => setStart((prevStart) => Math.max(prevStart - length, 0));

  // Calculate the current page number
  const currentPage = Math.floor(start / length) + 1;
  const totalPages = Math.ceil(recordsTotal / length);

  // AG Grid Event Handlers for API references
  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (gridApi) {
      gridApi.exportDataAsCsv();
    }
  };

  // Export to Excel using ExcelJS
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    const headers = Object.keys(data[0] || {});
    const title = worksheet.addRow([`${selectedLabel}`]); // Title row
    title.font = { bold: true, size: 16 };
    worksheet.mergeCells('A1', `${String.fromCharCode(64 + headers.length)}1`);

    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };

    data.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    worksheet.columns.forEach((column) => {
      const maxLength = column.values.reduce((prev, curr) => Math.max(prev, curr?.toString().length || 0), 10);
      column.width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${selectedLabel}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['METERNO', 'MeterLastCommunicated']],
      body: data.map((row) => [row.METERNO, row.MeterLastCommunicated]),
    });
    doc.save(`${selectedLabel}.pdf`);
  };

  const handleExport = (value) => {
    switch (value) {
      case 'csv':
        exportToCSV();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div>
        <select
          id="export-format"
          value={exportFormat}
          onChange={(e) => handleExport(e.target.value)}
          style={{ height: '30px' }}
        >
          <option value="">Export</option>
          <option value="csv">CSV</option>
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      {loading ? (
        <img src={loadingGif} alt="Loading..." style={{ width: '150px', height: '150px', margin: '50px 350px' }} />
      ) : (
        <div className="ag-theme-alpine" style={{ height: 400, width: '100%', marginTop: '20px' }}>
          <AgGridReact
            rowData={data}
            columnDefs={columnDefs}
            onGridReady={onGridReady}
            pagination={true}
            paginationPageSize={length}
            modules={[ClientSideRowModelModule]}
          />
        </div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={handlePreviousPage} disabled={start === 0}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={start + length >= recordsTotal}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Apicall;

