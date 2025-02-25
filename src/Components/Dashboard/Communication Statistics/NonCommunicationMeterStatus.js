import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react'; // ECharts for React integration
import './CommunicationStatistics.css'; // Assuming custom styles for your component
import loadingGif from '../../../Assets/img2.gif'; // Optional: loading gif for your UI
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Your main functional component
const NonCommunicationMeterStatus = ({ officeid }) => {
  // States for handling data and UI status
  const [chartData, setChartData] = useState(null); // Holds chart data
  const [loading, setLoading] = useState(true); // Loading state
  const [dataavailable, setDataAvailable] = useState(null); // Data availability state
  const [selectedData, setSelectedData] = useState(null); // For selected data point
  const [categorys, setCategory] = useState(null); // Category selection
  const [selectlabel, setSelectlabel] = useState(null); // Label selection
  const [showModal, setShowModal] = useState(false); // For modal visibility (if needed)

  // Define color palette for the bars in the chart
  const colorPalette = [
    'rgb(119, 178, 247)',
    'rgb(48, 71, 88)',
    'rgb(91, 112, 130)',
    'rgb(57, 125, 200)',
    'rgb(45, 133, 234)',
  ];

  // API URLs for token generation and fetching data
  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const baseUrl = `/api/server3/UHES-0.0.1/WS/gettingOlderForSevenDays?officeid=${officeid}`;

  // Fetch data function
  const fetchData = async () => {
    try {
      // Fetch authentication token
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: 'Admin',
          password: 'Admin@123',
          client_id: 'fooClientId',
          client_secret: 'secret',
        }),
      });

      // Check if token response is okay
      if (!tokenResponse.ok) throw new Error('Failed to authenticate');
      const { access_token: accessToken } = await tokenResponse.json();

      // Fetch the actual data
      const dataResponse = await fetch(baseUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Check if data response is okay
      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();

      // If there's no data, show an appropriate message
      if (!responseData.yData) {
        setLoading(false);
        setDataAvailable('No Data Available');
        return;
      }

      const labels = responseData.xData;
      const ranges = responseData.yData.map((item) => item.name);
      const rangeData = responseData.yData.map((item) => item.data);

      // Calculate percentages
      const percentageData = labels.map((_, index) => {
        const total = rangeData.reduce((acc, range) => acc + range[index], 0);
        return rangeData.map((range) => (total ? ((range[index] / total) * 100).toFixed(1) : 0));
      });

      // Map ranges into series
      const series = ranges.map((rangeName, i) => ({
        name: rangeName,
        data: percentageData.map((data) => parseFloat(data[i])),
      }));

      // Set chart data options
      setChartData({
        title: {
          text: 'Non Communication Meter Status',
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            let tooltipText = `${params[0].name}<br/>`; // Category Label
            params.forEach((param) => {
              tooltipText += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
            });
            return tooltipText;
          },
        },
        legend: {
          orient: 'horizontal',
          top: 'bottom', // Position legend
        },
        grid: {
          left: '3%',  // Increase left margin to avoid label truncation
          right: '5%',
          bottom: '0%',
          top: '20%',
          containLabel: true
        },
        yAxis: {
          type: 'category',
          data: labels, // X-axis categories (labels)
        },
        xAxis: {
          type: 'value',
          max: 100, // Y-axis max value as percentage
        },
        series: series.map((range) => ({
          name: range.name,
          type: 'bar',
          stack: 'total', // Stacked bars
          data: range.data,
          itemStyle: {
            color: colorPalette[series.indexOf(range)], // Color based on range
          },
          label: {
            show: true,
            position: 'inside',
            formatter: '{c}', // Displays percentage on bars
            color: '#fff', // Makes text visible inside bars
          },
        })),
      });

      // Set loading state to false when data is ready
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setLoading(false);
      setChartData(null); // In case of error, clear chart data
    }
  };

  // UseEffect to call fetchData on component mount and officeid change
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [officeid]);

  // Handle chart click events
  const handleChartClick = (params) => {
    const { name: category, value } = params.data;
    const label = params.seriesName;
    setCategory(category);
    setSelectlabel(label);
    setSelectedData({ category, value, label });
    setShowModal(true); // Show modal with selected data
  };
  
  if (loading) return <p>Loading...</p>;
  const handleClose = () => setShowModal(false);
  const GetNonCommunicationMeterData = ({ selectedLabel, selectedCategory, office }) => {
    const [data, setData] = useState([]);
    const [mdtloading, setMDTLoading] = useState(true);
    const [error, setError] = useState(null);
    const [start, setStart] = useState(0); 
    const [fromDate, setFromDate] = useState(null);
    const [recordsTotal, setRecordsTotal] = useState(0); 
    const length = 10; 
    const [exportFormat, setExportFormat] = useState('');
    useEffect(() => {
          const date = new Date(selectedCategory);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
    
          const todaydate = year + month + day;
          setFromDate(todaydate);
        })

    const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';

    const fetchData = async () => {
      setError(null);
      console.log(selectedLabel);
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
        const baseUrl = `/api/server3/UHES-0.0.1/WS/ServerpaginationForNonCommMeterStatus?Date=${fromDate}&Flag=${selectedLabel}&OfficeId=${office}&draw=2&length=${length}&start=${start}`;
        const dataResponse = await fetch(baseUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const responseData = await dataResponse.json();
        setRecordsTotal((responseData.data).length || 0);
        setData(responseData.data || []);
        console.log('onclick service data:',responseData.data);

      } catch (err) {
        setError(err.message);
      } finally {
        setMDTLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, [selectedLabel, selectedCategory]);

    const columnDefs = [
      { headerName: "Meter Number", field: "METER_NUMBER", flex: 1, filter: true, sortable: true, valueFormatter: (params) => params.value ? params.value : "N/A" },
      { headerName: "Meter Last Communicated", field: "LAST_COMM", flex: 1, filter: true, sortable: true, valueFormatter: (params) => params.value ? params.value : "N/A" },
    ];

    const handleNextPage = () => setStart((prevStart) => prevStart + length);
    const handlePreviousPage = () => setStart((prevStart) => Math.max(prevStart - length, 0));

    const currentPage = Math.floor(start / length) + 1;
    const totalPages = Math.ceil(recordsTotal / length);

    // Export function for CSV
    const exportToCSV = () => {
      const csvData = data.map(row => ({
        MeterNumber: row.METER_NUMBER,
        MeterLastCommunicated: row.LAST_COMM,
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','), // Header
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `NonCommMeterStatus(${selectedCategory}).csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Export function for Excel
    const exportToExcel = async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('NonCommunicationMeterData');
      const headers = Object.keys(data[0] || {});
      const title = worksheet.addRow([`Non Communication Meter Status on ${selectedCategory}`]); 
      title.font = { bold: true, size: 16, color: { argb: 'FFFF00' } };
      title.alignment = { horizontal: 'center' };
      worksheet.mergeCells('A1', `${String.fromCharCode(64 + headers.length)}1`);

      const headerRow = worksheet.addRow(headers);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } }; 
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFADD8E6' }, 
        };
      });

      // Add data rows
      data.forEach(row => {
        worksheet.addRow(Object.values(row));
      });

      worksheet.autoFilter = {
        from: 'A2', 
        to: `${String.fromCharCode(64 + headers.length)}2` 
      };

      headers.forEach((header, index) => {
        const maxLength = Math.max(
          header.length, 
          ...data.map(row => row[header] ? row[header].toString().length : 0) 
        );
        worksheet.getColumn(index + 1).width = maxLength + 2; 
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      worksheet.getRow(1).width=40;
      saveAs(blob, `NonCommMeterStatus(${selectedCategory}).xlsx`);
    };

    // Export function for PDF
    const exportToPDF = () => {
      const doc = new jsPDF();
      const tableColumn = ["MeterNumber", "MeterLastCommunicated"];
      const tableRows = [];

      data.forEach(row => {
        tableRows.push([row.METER_NUMBER, row.LAST_COMM]);
      });

      doc.autoTable(tableColumn, tableRows);
      doc.save('NonCommMeterStatus(${selectedCategory}).pdf');
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
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1050,
          backgroundColor: '#fff',
          width: '1000px',
          borderRadius: '5px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
          padding: '1em',
          marginLeft: '125px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 id="contained-modal-title-vcenter">Non Communication Meter Status on {selectedCategory}</h5>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
            &times;
          </button>
        </div>

        <div style={{ maxHeight: '70vh', width: '970px', overflowY: 'auto' }}>
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

            {mdtloading ? (
              <img src={loadingGif} alt="Loading..." style={{ width: '150px', height: '150px', margin: '50px 350px' }} />
            ) : (
              <div className="ag-theme-alpine" style={{ height: 400, width: '100%', marginTop: '20px' }}>
                <AgGridReact rowData={data} columnDefs={columnDefs} onGridReady={fetchData} />
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ marginLeft: '10px' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={handlePreviousPage} disabled={start === 0} style={{ backgroundColor: 'black', color: 'white' }}>Previous</button>
              <button onClick={handleNextPage} disabled={start + length >= recordsTotal} style={{ backgroundColor: 'black', color: 'white' }}>Next</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1em' }}>
          <button onClick={handleClose} style={{ padding: '0.5em 1em', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Display no data available message if necessary */}
      {dataavailable && <p>{dataavailable}</p>}

      {/* Render the chart using ECharts for React */}
      <div className="blck19">
      {chartData && (
        <ReactECharts
          option={chartData} // Pass chart data options
          style={{ height: 'calc(100% - 40px)', width: '100%' }} // Set chart style
          onEvents={{
            click: handleChartClick, // Handle click event on chart
          }}
        />
      )}
      </div>
      {showModal && (
        <GetNonCommunicationMeterData selectedLabel={selectlabel} selectedCategory={categorys} office={officeid} />
      )}

    </div>
  );
};

// Export the component for use in other parts of the app
export default NonCommunicationMeterStatus;
