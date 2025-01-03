import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import loadingGif from '../../Assets/img2.gif';

const GetCommunicationStatusonMITypes = ({ selectedLabel, selectedCategory, office }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [start, setStart] = useState(0);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [exportFormat, setExportFormat] = useState('');
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const length = 10;

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
    if (!fromDate) return;

    setError(null);
    setLoading(true);
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

      let baseUrl;
      if (selectedLabel === 'Meter Communicated') {
        baseUrl = `/api/server3/UHES-0.0.1/WS/ServerpaginationForCommunicationQueryBasedOnMI?Flag=COMMUNICATED&draw=1&length=${length}&mtrInterface=${selectedCategory}&office=${office}&start=${start}`;
      } else if (selectedLabel === 'Meter Not Communicated') {
        baseUrl = `/api/server3/UHES-0.0.1/WS/ServerpaginationForNonCommunicationQueryBasedOnMI?Flag=NOTCOMMUNICATED&draw=1&length=${length}&mtrInterface=${selectedCategory}&office=${office}&start=${start}`;
      }

      const dataResponse = await fetch(baseUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();

      setRecordsTotal(responseData.recordsTotal || 0);
      setData(responseData.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fromDate, start, length, selectedLabel, selectedCategory, office]);

  useEffect(() => {
    if (fromDate) {
      fetchData();
    }
  }, [fetchData, fromDate]);

  const columnDefs = [
    { headerName: "METERNO", field: "METERNO", flex: 1, filter: true, sortable: true },
    { headerName: "MeterLastCommunicated", field: "MeterLastCommunicated", flex: 1, filter: true, sortable: true },
  ];

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const handleNextPage = () => setStart((prevStart) => prevStart + length);
  const handlePreviousPage = () => setStart((prevStart) => Math.max(prevStart - length, 0));

  const currentPage = Math.floor(start / length) + 1;
  const totalPages = Math.ceil(recordsTotal / length);

  const exportToCSV = () => {
    if (gridApi) {
      gridApi.exportDataAsCsv({ fileName: `${selectedLabel}.csv` });
    }
  };

  const exportToExcel = async () => {
    if (gridApi) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');

      const headerRow = worksheet.addRow([`${selectedLabel}`]);
      headerRow.font = { bold: true, size: 16 };
      worksheet.mergeCells(`A1:${String.fromCharCode(65 + columnDefs.length - 1)}1`);

      const columnHeaders = columnDefs.map(col => col.headerName);
      worksheet.addRow(columnHeaders);

      gridApi.forEachNodeAfterFilterAndSort((node) => {
        const rowData = columnDefs.map(col => node.data[col.field]);
        worksheet.addRow(rowData);
      });

      columnDefs.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = 15;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${selectedLabel}.xlsx`);
    }
  };

  const exportToPDF = () => {
    if (gridApi) {
      const doc = new jsPDF();
      const tableColumn = columnDefs.map(col => col.headerName);
      const tableRows = [];

      gridApi.forEachNodeAfterFilterAndSort((node) => {
        const rowData = columnDefs.map(col => node.data[col.field]);
        tableRows.push(rowData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
      });
      doc.save(`${selectedLabel}.pdf`);
    }
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
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <span>
          {start + 1} to {Math.min((currentPage * length), recordsTotal)} of {recordsTotal}
        </span>
        <button onClick={handlePreviousPage} disabled={start === 0} style={{ backgroundColor: 'black', color: 'white' }}>
          Previous
        </button>
        <button onClick={handleNextPage} disabled={start + length >= recordsTotal} style={{ backgroundColor: 'black', color: 'white' }}>
          Next
        </button>
      </div>
    </div>
  );
};

export default GetCommunicationStatusonMITypes;

