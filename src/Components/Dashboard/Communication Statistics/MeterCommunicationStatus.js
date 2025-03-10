import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import './CommunicationStatistics.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import loadingGif from '../../../Assets/img2.gif';
import './CommunicationStatistics.css'
import { Row, Col } from 'react-bootstrap';

const MeterCommunicationStatus = ({ officeid }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [categorys, setCategory] = useState(null);
  const [selectlabel, setSelectlabel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dataavailable, setDataAvailable] = useState(null); // Data availability state
  

  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const baseUrl = `/api/server3/UHES-0.0.1/WS/getmeterCommunicationStatusForWeek?officeid=${officeid}`;

  const fetchData = async () => {
    try {
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

      if (!tokenResponse.ok) throw new Error('Failed to authenticate');
      const { access_token: accessToken } = await tokenResponse.json();

      const dataResponse = await fetch(baseUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();

      if (!responseData.yData) {
        setLoading(false);
        setDataAvailable('No Data Available');
        return;
      } 
        const labels = responseData.xData || [];
        const communicatedData = responseData.yData[0]?.data || [];
        const notCommunicatedData = responseData.yData[1]?.data || [];

        const percentageData = labels.map((_, index) => {
          const total = communicatedData[index] + notCommunicatedData[index];
          const commPercent = total ? ((communicatedData[index] / total) * 100).toFixed(2) : 0;
          const notCommPercent = total ? ((notCommunicatedData[index] / total) * 100).toFixed(2) : 0;
          return [parseFloat(commPercent), parseFloat(notCommPercent)];
        });
        setChartData({
          xAxisData: labels,
          communicatedData: percentageData.map((d) => d[0]),
          notCommunicatedData: percentageData.map((d) => d[1]),
        });

        setLoading(false);
    } catch (err) {
      console.error(err.message);
      setLoading(false);
      setChartData(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [officeid]);

  if (loading) return <p>Loading...</p>;
  if (!chartData) return <h5 style={{ marginTop: '160px', marginLeft: '100px' }}>No data available.</h5>;

  const getOption = () => ({
    title: {
      text: 'Meter Communication Status',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['Meter Communicated', 'Meter Not Communicated'],
      top: '10%',
      left: 'center',
    },
    grid: {
      left: '3%',  // Increase left margin to avoid label truncation
      right: '5%',
      bottom: '0%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
    },
    yAxis: {
      type: 'category',
      data: chartData.xAxisData, // Here we set the categories as y-axis labels
    },
    series: [
      {
        name: 'Meter Communicated',
        type: 'bar',
        stack: 'stack1',
        data: chartData.communicatedData,
        itemStyle: {
          color: 'rgb(35, 240, 12)',
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}', // Displays percentage on bars
          color: '#fff', // Makes text visible inside bars
        },
      },
      {
        name: 'Meter Not Communicated',
        type: 'bar',
        stack: 'stack1',
        data: chartData.notCommunicatedData,
        itemStyle: {
          color: 'rgb(28, 148, 142)',
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}', // Displays percentage on bars
          color: '#fff', // Makes text visible inside bars
        },
      },
    ],
  });
  const handleBarClick = (params) => {
    const sName=params.seriesName;
    const cName=params.name;
    setSelectlabel(sName);  // Set selected label (Meter Communicated or Meter Not Communicated)
    setSelectedCategory(cName);  // Set the selected category (the label on the x-axis)
    setShowModal(true);  // Open the modal
  };

  const handleClose = () => setShowModal(false);
  const GetMeterCommunicatedData = ({ selectedLabel, selectedCategory, office }) => {
    const [data, setData] = useState([]);
    const [mdtloading, setMDTLoading] = useState(true);
    const [error, setError] = useState(null);
    const [start, setStart] = useState(0);
    const [recordsTotal, setRecordsTotal] = useState(0);
    const length = 10;
    const [exportFormat, setExportFormat] = useState('');
    const [fromDate,setFromDate]=useState();
    useEffect(() => {
      if (selectedCategory) {
        const date = new Date(selectedCategory);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        setFromDate(year + month + day); // Set fromDate only when selectedCategory is available
      }
    }, [selectedCategory]);
    
    const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';

    const fetchModalData = async () => {
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
        
        if (selectedLabel === 'Meter Communicated') {
          console.log(`from date payload: ${fromDate}`);
          const baseUrl = `/api/server3/UHES-0.0.1/WS/ServerpaginationForCommunicationReport?draw=2&fromdate=${fromDate}&length=10&office=${office}&start=0`;
          const dataResponse = await fetch(baseUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          const responseData = await dataResponse.json();          
          setRecordsTotal((responseData.data).length || 0);
          setData(responseData.data || []);

        }
        else if (selectedLabel === 'Meter Not Communicated') {
          const baseUrl = `/api/server3/UHES-0.0.1/WS/ServerpaginationForNonCommunicationReportInReports?applyMaskingFlag=N&draw=2&length=10&nonCommunicationDate=${fromDate}&officeId=${office}&start=0`;
          const dataResponse = await fetch(baseUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          const responseData = await dataResponse.json();
          setRecordsTotal((responseData.data).length || 0);
          console.log('modal data got:',responseData.data);
          setData(responseData.data || []);
          // if((responseData.data).length==0){
          //   setMDTLoading('Data Not Found');
          // }
        }
      } catch (err) {
        setError(err.message);
      }
      finally {
        setMDTLoading(false);
      }
    };

    useEffect(() => {
      if (fromDate) {
        fetchModalData();
      }
    }, [selectedCategory,selectedLabel,fromDate]); 
    const columnDefs = [
      { headerName: "METERNO", field: "Meter Number", flex: 1, filter: true, sortable: true, valueFormatter: (params) => params.value ? params.value : "N/A" },
      { headerName: "MeterLastCommunicated", field: "MeterLastCommunicated", flex: 1, filter: true, sortable: true, valueFormatter: (params) => params.value ? params.value : "N/A" },
    ];

    const handleNextPage = () => setStart((prevStart) => prevStart + length);
    const handlePreviousPage = () => setStart((prevStart) => Math.max(prevStart - length, 0));

    const currentPage = Math.floor(start / length) + 1;
    const totalPages = Math.ceil(recordsTotal / length);

    // Export function for CSV
    const exportToCSV = () => {
      const csvData = data.map(row => ({
        METERNUMBER: row["Meter Number"],
        MeterLastCommunicated: `"${new Date(row.MeterLastCommunicated).toISOString().split('T')[0]}"` // Wrap date in quotes
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `MeterCommStatus(${selectedCategory}).csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };


    // Export function for Excel
    const exportToExcel = async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');
    
      const headers = ["Meter Number", "MeterLastCommunicated"];
      
      const title = worksheet.addRow([`Meter Communication Status on ${selectedCategory}`]);
      title.font = { bold: true, size: 16, color: { argb: 'FFFF00' } };
      title.alignment = { horizontal: 'center' };
      worksheet.mergeCells('A1:B1'); 
    
      const headerRow = worksheet.addRow(headers);
    
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFADD8E6' },
        };
      });
    
      data.forEach(row => {
        worksheet.addRow([
          row["Meter Number"],  
          row.MeterLastCommunicated
        ]);
      });
    
      worksheet.autoFilter = {
        from: 'A2',
        to: 'B2'
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
      saveAs(blob, `MeterCommStatus(${selectedCategory}).xlsx`);
    };
    

    // Export function for PDF
    const exportToPDF = () => {
      const doc = new jsPDF();
      const tableColumn = ["METERNUMBER", "MeterLastCommunicated"];
      const tableRows = [];

      data.forEach(row => {
        tableRows.push([row["Meter Number"], row.MeterLastCommunicated]);
      });

      doc.autoTable(tableColumn, tableRows);
      doc.save(`MeterCommStatus(${selectedCategory}).pdf`);
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
          <h5 id="contained-modal-title-vcenter">{selectedLabel} data on {selectedCategory}</h5>
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
           {(mdtloading) ? (
            <img src={loadingGif} alt="Loading..." style={{ width: '150px', height: '150px', margin: '50px 350px' }} />
           ) : (
            <div className="ag-theme-alpine" style={{ height: 400, width: '100%', marginTop: '20px' }}>
                  <AgGridReact rowData={data} columnDefs={columnDefs} />
                </div>
           )}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ marginLeft: '10px' }}>
                Page {currentPage} of {totalPages}
              </span>
              <span style={{ marginLeft: '10px' }}>
                {start + 1} to {(currentPage * length > recordsTotal) ? recordsTotal : (currentPage * length)} of {recordsTotal}
              </span>
              <button onClick={handlePreviousPage} disabled={start === 0} style={{ backgroundColor: 'black', color: 'white' }}>Previous</button>
              <button onClick={handleNextPage} disabled={currentPage === totalPages} style={{ backgroundColor: 'black', color: 'white' }}>Next</button>

            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1em' }}>
          <button onClick={handleClose} style={{ padding: '0.5em 1em', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>

    );
  }


  return (
    <div className='blck19'>
      <ReactECharts option={getOption()}
        style={{ width: '100%', height: 'calc(100% - 40px)' }}
        onEvents={{
          'click': handleBarClick,  // Trigger handleBarClick when bar is clicked
        }}
      />

      {showModal && (
        <GetMeterCommunicatedData selectedLabel={selectlabel} selectedCategory={selectedCategory} office={officeid} />
      )}
    </div>
  );
};

export default MeterCommunicationStatus;
