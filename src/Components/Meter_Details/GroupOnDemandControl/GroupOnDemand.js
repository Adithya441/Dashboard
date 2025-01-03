import { Form, Row, Col, Button } from "react-bootstrap";
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useState, useEffect, useCallback, useRef } from 'react';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

function GroupOnDemandControl() {
  const [loading, setLoading] = useState(false);
  const [groupname, setGroupname] = useState([]);
  const [meterInterface, setMeterInterface] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [meterData, setMeterData] = useState([]);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [start, setStart] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayData, setDisplayData] = useState(null);
  const length = 10;

  // Selected data
  const [selectedGroupname, setSelectedGroupname] = useState("");
  const [selectedMeterInterface, setSelectedMeterInterface] = useState("");
  const [selectedTaskName, setSelectedTaskName] = useState("");
  const [grpnameOptions, setGrpnameOptions] = useState([]);
  const [MeterInterfaceValue,setMeterInterfaceValue] = useState("");
  // AG Grid column definitions
  const ColumnDefs = [
    { headerName: "Group Name", field: "groupName" },
    { headerName: "Transaction Id", field: "transactionId" },
    { headerName: "Data Type", field: "dataType" },
    { headerName: "Task Name", field: "taskName" },
    { headerName: "Request Time", field: "requestTime" },
    { headerName: "Success Count", field: "succesCnt" },
    { headerName: "Failure Count", field: "failureCnt" },
    { headerName: "Total Count", field: "totalCnt" },
    { headerName: "End Time", field: "endTime" },
    { headerName: "Meter Interface", field: "meterInterface" },
  ];

  // Fetch access token
  const tokenUrl = "/api/server3/UHES-0.0.1/oauth/token";
  const fetchAccessToken = useCallback(async () => {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "password",
        username: "Admin",
        password: "Admin@123",
        client_id: "fooClientId",
        client_secret: "secret",
      }),
    });
    if (!response.ok) throw new Error("Failed to authenticate");
    const data = await response.json();
    return data.access_token;
  }, []);

  // Fetch group names
  const fetchGroupname = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = await fetchAccessToken();
      const response = await fetch("/api/server3/UHES-0.0.1/WS/getmetergroupbygroupname", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch group names");
      const data = await response.json();
      setGroupname(data.data || []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchAccessToken]);

  useEffect(() => {
    fetchGroupname();
  }, [fetchGroupname]);

  // Fetch meter interface
  const fetchMeterInterface = useCallback(async () => {
    if (!selectedGroupname) return; // Prevent API call when no group is selected
    setLoading(true);
    try {
      const accessToken = await fetchAccessToken();
      const response = await fetch(
        `/api/server3/UHES-0.0.1/WS/getmeterinterface?groupName=${selectedGroupname}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch meter interfaces");
      const responseData = await response.json();
      setGrpnameOptions(responseData.data || []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchAccessToken, selectedGroupname]);

  useEffect(() => {
    fetchMeterInterface();
  }, [fetchMeterInterface, selectedGroupname]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const requestData = {
      groupname: selectedGroupname,
      meterInterface: selectedMeterInterface,
      taskName: selectedTaskName,
    };
  };

  //generate total data for the excel,csv and pdf
  const totalurl = '/api/server3/UHES-0.0.1/WS/SSPForConnDisconnTaskManagerTransactions?draw=2&length=17&start=0';
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await fetchAccessToken();
      const url = totalurl;
      const dataResponse = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      setMeterData(responseData.data || []);
      console.log(responseData.data)
      setRecordsTotal(responseData.recordsTotal || 0);
      console.log(responseData.recordsTotal)
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchAccessToken])

  useEffect(() => {
    fetchAllData();
  }, [])


  useEffect(() => {
    console.log(grpnameOptions)
    const MeterInterfaceValue = grpnameOptions.map((option) => Object.values(option));
    setMeterInterfaceValue(MeterInterfaceValue); 
    console.log(MeterInterfaceValue);
    const defaultInterface = grpnameOptions.find(
      (meter) => meter.GROUP_NAME === selectedGroupname
    );
    console.log(selectedGroupname); // Log the selectedGroupname value
    if (defaultInterface) {
      setSelectedMeterInterface(defaultInterface.METER_INTERFACE);
    } else {
      setSelectedMeterInterface(""); 
      console.log('No matching meter found, resetting METER_INTERFACE'); // Log when no matching meter is found
    }
}, [selectedGroupname, grpnameOptions]);

  

  //generate Excel,CSV and pdf
  const exportExcel = async () => {
    await fetchAllData();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('GroupOndemand');
    const title = "Conn Disconnect Manager";
    const selecteddropdown = `Group Name: ${selectedGroupname || 'N/A'}, Meter Interface: ${MeterInterfaceValue}, Task Name: ${selectedTaskName || 'N/A'}`;
    const headers = ['requestTime', 'groupName', 'totalCnt', 'meterInterface', 'failureCnt', 'datatype', 'taskName', 'id', 'endTime', 'succesCnt', 'transactionid'];
    const lastColumn = String.fromCharCode(64 + headers.length);
    console.log("Selected Groupname:", selectedGroupname);
    // Merge cells for selecteddropdown (left side)
    worksheet.mergeCells('A1:C1');
    const dropdownCell = worksheet.getCell('A1');
    dropdownCell.value = selecteddropdown;
    dropdownCell.font = { italic: true, color: { argb: 'FF0000FF' }, size: 12 }; // Blue italic text
    dropdownCell.alignment = { vertical: 'middle', horizontal: 'left' };
    // Merge cells for title (center-aligned)
    worksheet.mergeCells(`D1:${lastColumn}1`);
    const titleCell = worksheet.getCell('D1');
    titleCell.value = title;
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFF00' } }; // Bold yellow text
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    // Add headers
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADD8E6' } }; // Light blue background
    });
    // Add data rows
    meterData.forEach((data) => {
      worksheet.addRow([
        data.requestTime,
        data.groupName,
        data.totalCnt,
        data.meterInterface,
        data.failureCnt,
        data.dataType,
        data.taskName,
        data.id,
        data.endTime,
        data.succesCnt,
        data.transactionId,
      ]);
    });
    // Auto-size columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      column.width = maxLength + 6;
    });
    // Add auto-filter
    worksheet.autoFilter = { from: 'A2', to: `${lastColumn}2` };
    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'GroupOndemand.xlsx');
  };


  const exportCSV = async () => {
    await fetchAllData();
    const title = 'Conn Disconnect Manager';
    const worksheet = XLSX.utils.json_to_sheet(meterData);
    let csv = XLSX.utils.sheet_to_csv(worksheet);
    csv = `${title}\n\n${csv}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'GroupOndemand.csv');
  };


  const exportPDF = async () => {
    await fetchAllData();
    const doc = new jsPDF();
    doc.text("Meter Details Data", 20, 10);
    doc.autoTable({
      head: [['requestTime', 'groupName', 'totalCnt', 'meterInterface', 'failureCnt', 'datatype', 'taskName', 'id', 'endTime', 'succesCnt', 'transactionid']],
      body: meterData.map((data) => [
        data.requestTime,
        data.groupName,
        data.meteringmode,
        data.totalCnt,
        data.meterInterface,
        data.failureCnt,
        data.datatype,
        data.taskName,
        data.id,
        data.endTime,
        data.succesCnt,
        data.transactionid
      ]),
      startY: 20,
    });
    doc.save("GroupOndemand.pdf");
  };

  const handlePaginationChange = useCallback(() => {
    const gridApi = gridRef.current.api;
    const newStart = gridApi.paginationGetCurrentPage() * length;
    setStart(newStart);
    setCurrentPage(gridApi.paginationGetCurrentPage() + 1); // Update current page
  }, [length]);

  const gridRef = useRef(null);




  return (
    <div>
      <h1 className="form-title">Group On Demand Screen</h1>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group className={handleSubmit}>
              <Form.Label>Group Name</Form.Label>
              <Form.Select
                value={selectedGroupname}
                onChange={(e) => setSelectedGroupname(e.target.value)}
              >
                <option value="">--NA--</option>
                {groupname.map((grp, index) => (
                  <option key={index} value={grp.GROUP_NAME}>
                    {grp.GROUP_NAME}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Meter Interface</Form.Label>
              <Form.Select
                id="meterinterface"
                name="meterinterface"
                value={selectedMeterInterface}
                onChange={(e) => setSelectedMeterInterface(e.target.value)}
              >
                {grpnameOptions.map((meter, index) => (
                  <option key={index} value={meter.ID}>
                    {meter.METER_INTERFACE}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Task Name</Form.Label>
              <Form.Select
                value={selectedTaskName}
                onChange={(e) => setSelectedTaskName(e.target.value)}
              >
                <option value="">--NA--</option>
                <option value="Connection">Connection</option>
                <option value="DisConnection">DisConnection</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <div className="text-center mt-3">
          <Button
            type="submit"
            className="submitbutt"
            variant="primary"
          >
            Send Request
            </Button>
        </div>
      </Form>
      <Row className="mb-3 justify content-start">
        <Col xs="auto" className="px-1">
          <button onClick={exportExcel} className="export-button">Excel</button>
        </Col>
        <Col xs="auto" className="px-1">
          <button onClick={exportPDF} className="export-button">Pdf</button>
        </Col>
        <Col xs="auto" className="px-1">
          <button onClick={exportCSV} className="export-button">Csv</button>
        </Col>
      </Row>
      {meterData && (
        <div className="meter-data-table ag-theme-quartz" id="myGrid" style={{ height: '400px', width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            rowData={meterData}
            columnDefs={ColumnDefs}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 30, 40]}
          />
        </div>
      )}
    </div>
  );
}

export default GroupOnDemandControl;