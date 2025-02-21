import { AgGridReact } from 'ag-grid-react';
import * as ExcelJS from "exceljs";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import "jspdf-autotable";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from 'ag-grid-community';
import loadingGif from '../../../Assets/img2.gif';

import { useState, useEffect } from 'react';
import './styles.css';

const DynamicOnDemand = ({ meternum, meterty, meterman }) => {
  const [searchKey, setSearchKey] = useState();
  const [profileOptions, setProfileOptions] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [dataStatus, setDataStatus] = useState();
  const [profileName, setProfileName] = useState();
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [loading,setLoading]=useState();
  const [colDefs, setColDefs] = useState([
    { field: "transactionId", filter: true, flex: 2, headerName: "Transaction Id" },
    { field: "requestType", filter: true, flex: 2, headerName: "Request Type" },
    { field: "requestFrom", filter: true, flex: 2, headerName: "Request From" },
    { field: "requestTime", filter: true, flex: 2, headerName: "Request Time", valueFormatter: (params) =>{return  formatDateTime(params.value)||"-" } },
    { field: "responseTime", filter: true, flex: 2, headerName: "Response Time", valueFormatter: (params) =>{return  formatDateTime(params.value)||"-" } },
    { field: "responseCode", filter: true, flex: 2, headerName: "Response" ,cellRenderer: (params) => {
      if (!params.value) return "--"; 
      const div = document.createElement("div");
      div.innerHTML = params.value;
      const text = div.textContent || div.innerText; 
      const boldTag = div.querySelector("b"); 
      const color = boldTag?.style.color || "black"; 
      return <span style={{ color, fontWeight: "bold" }}>{text}</span>;
    }} 
  ]);
  //SERVICE URLS
  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const profileUrl = `/api/server3/UHES-0.0.1/WS/getProfileNamesWithClassId?ClassId=7&Class_type=Reading&MeterMake=${meterman}&MeterType=${meterty}`;

  const buildGridUrl = () => {
    const params = new URLSearchParams({
      meterNumber: meternum,
    });
    if (profileName) params.append("requestType", profileName);
    if (fromDate) params.append("createDateStart", fromDate);
    if (toDate) params.append("createDateEnd", toDate);

    return `/api/server3/UHES-0.0.1/WS/getdataByMeterNumberAndRequestType?${params.toString()}`;
  };

  //SERVICE CALLS
  const fetchProfileOptions = async () => {
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

      const dataResponse = await fetch(profileUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      setProfileOptions((responseData.data));
      console.log((responseData.data));

    } catch (err) {
      console.error(err.message);
    }
  };
  const fetchGridData = async () => {
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

      const dataResponse = await fetch(buildGridUrl(), {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      setRowData(responseData.data);
      if((responseData.data).length==0){
        setLoading('Data not found');
      }
      setFromDate('');
      setToDate('');
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchProfileOptions();
    fetchGridData();
  }, []);

  const exportCSV = () => {
    const csvData = rowData.map(row => ({
      TransactionId: row.transactionId,
      RequestType: row.requestType,
      RequestFrom: row.requestFrom,
      RequestTime: row.requestTime,
      ResponseTime: row.responseTime,
      Response: stripHtml(row.responseCode)
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'DynamicOnDemand.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return ''; // Handle null or undefined values
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const stripHtml = (html) => {
  if (!html) return ""; 
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dynamic OnDemand');
    const headers = Object.keys(rowData[0] || {});
    const title = worksheet.addRow([`Dynamic OnDemand`]);
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
    rowData.forEach((row) => {
      worksheet.addRow(
        headers.map((header) =>
          header === "responseCode" ? stripHtml(row[header]) : row[header]
        )
      );
    });

    worksheet.autoFilter = {
      from: 'A2',
      to: `${String.fromCharCode(64 + headers.length)}2`
    };

    headers.forEach((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...rowData.map(row => row[header] ? row[header].toString().length : 0)
      );
      worksheet.getColumn(index + 1).width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `DynamicOnDemand.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Transaction Id", "Request Type", "Request From", "Request Time", "Response Time", "Response"];
    const tableRows = [];

    rowData.forEach(row => {
      tableRows.push([row.transactionId, row.requestType, row.requestFrom, row.requestTime, row.responseTime, stripHtml(row.responseCode)]);
    });

    doc.autoTable(tableColumn, tableRows);
    doc.save('DynamicOnDemand.pdf');
  };

  const searchData = (e) => {
    const searchValue = e.target.value;
    setSearchKey(searchValue);
    if (searchValue === "") {
      setRowData(rowData);
    } else {
      const filteredData = rowData.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
      setRowData(filteredData);
    }
  }
  return (
    <div className="container-fluid col-xs-12 p-1">
      <form className='form mt-4 mx-auto'>
        <div className="col-xs-10 col-md-4">
          <label htmlFor="profileName">
            Profile Name <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <div className="border border-left border-left-danger border-left-5" ></div>
            <select className="form-control mr-sm-2 border border-left-danger border-2" id="inlineFormCustomSelect" value={profileName} onChange={(e) => setProfileName(e.target.value)}>
              <option value="">-NA-</option>
              {profileOptions.map((profOption, index) => (
                <option key={index} value={profOption.SHORT_CODE}>
                  {profOption.OBIS_NAME}
                </option>
              ))}
            </select>
          </div>
        </div><br />
        {(profileName === "EOB" || profileName === "LP" || profileName === "ED")
          && (
            <div className='d-flex flex-row justify-content-between col-xs-10 align-left'>
              <div className='col-xs-10 col-md-4'>
                <label htmlFor='fromDate'>
                  From Date
                </label>
                <div className='input-group'>
                  <div className="border border-left border-left-5 border-left-danger" ></div>
                  <input
                    type="month"
                    id="fromDate"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className='form-control'
                    placeholder='January,2024'
                  />
                </div>
              </div>
              <div className='col-xs-10 col-md-4'>
                <label htmlFor='toDate'>
                  To Date
                </label>
                <div className='input-group'>
                  <div className="border border-left border-left-5 border-left-danger" ></div>
                  <input
                    type="month"
                    id="toDate"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className='form-control'
                    placeholder='December,2024'
                  />
                </div>
              </div>
            </div>
          )} <br />
        <div className='text-center'>
          <button className='btn btn-primary'
            style={{backgroundColor:'#5cb0e7'}}
            onClick={(e) => {
              e.preventDefault();
              fetchGridData();
            }}>Send Request</button>
        </div>
      </form>
      {(rowData) ? (
        <div className='container-fluid col-12'>
          <div className="d-flex flex-wrap mt-4">
            <div className="d-flex flex-wrap" style={{ marginLeft: '1vw', gap: '1vw' }}>
              <button className="btn btn-primary btn-md mr-1" onClick={exportExcel} style={{backgroundColor:'#5cb0e7'}}>Excel</button>
              <button className='btn btn-primary btn-md mr-1' onClick={exportPDF} style={{backgroundColor:'#5cb0e7'}}>PDF</button>
              <button className='btn btn-primary btn-md mr-1' onClick={exportCSV} style={{backgroundColor:'#5cb0e7'}}>CSV</button>
            </div>
            <div className="align-right" style={{ marginLeft: '2vw' }}>
              <input type="text" className="form-control" placeholder="search" value={searchKey} onChange={searchData} />
            </div>
          </div>
          <div className="container-fluid ag-theme-quartz mt-3 mx-auto" style={{ height: 350, width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={colDefs}
              pagination={true}
              paginationPageSize={5}
              paginationPageSizeSelector={[5, 10, 15, 20]}
              modules={[ClientSideRowModelModule]}
              overlayLoadingTemplate={`<div style="display: flex; justify-content: center; align-items: center; height: 100%; background-color: rgba(255, 255, 255, 0.8);">
            <img src="${loadingGif}" alt="Loading..." style="width: 50px; height: 50px;" /></div>`} overlayNoRowsTemplate={'<span class="ag-overlay-no-rows-center">No rows to display</span>'}
            onGridReady={(params) => { if (loading) {params.api.showLoadingOverlay();} else {params.api.hideOverlay();}}}
           
            />
          </div>
        </div>
      ):(
        <div className='text-danger mx-auto text-center'>
          {loading}
        </div>
      )
      }
    </div>
  );
}

export default DynamicOnDemand;
