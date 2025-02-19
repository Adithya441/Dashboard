import { useState, Fragment } from "react";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Form, Row, Col, Button, Container, InputGroup } from 'react-bootstrap';
import TreeSelectCmp from "../../TreeDropdown/TreeSelect";

const ReLoadAlarms = () => {
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [searchKey, setSearchKey] = useState();
  const [rowData, setRowData] = useState();
  const [loadingStatus, setLoadingStatus] = useState();
  const [colDefs] = useState([
    { field: "ALARAMNAME", filter: true, headerName: "Alarm Name" },
    { field: "METERNO", filter: true, headerName: "Meter Number" },
    { field: "ALARAMTIME", filter: true, headerName: "Alarm Time" },
    { field: "RESPONSETIME", filter: true, headerName: "Hes Time" }
  ]);

  const [office, setOffice] = useState("3459274e-f20f-4df8-a960-b10c5c228d3e");

  const onChangeOffice = (newValue) => {
    console.log('onChange ', newValue)
    setOffice(newValue);
  }
  //SERVICE URLS
  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const gridUrl = `/api/server3/UHES-0.0.1/WS/ServerpaginationForAlarmsReport?draw=2&fromdate=${fromDate}&length=10&office=${office}&start=0&todate=${toDate}`;

  //SERVICE CALLS
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

      const dataResponse = await fetch(gridUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      setRowData(responseData.data);
      setFromDate('');
      setToDate('');
    } catch (err) {
      console.error(err.message);
      setLoadingStatus('Data not found');
    }
  };

  const exportCSV = () => {
    const csvData = rowData.map(row => ({
      AlarmName: row.ALARAMNAME,
      MeterNumber: row.METERNO,
      AlarmTime: row.ALARAMTIME,
      HESTime: row.RESPONSETIME
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Alarms.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Alarms Data');
    const headers = Object.keys(rowData[0] || {});
    const title = worksheet.addRow([`Alarms`]);
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

    rowData.forEach(row => {
      worksheet.addRow(Object.values(row));
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
    saveAs(blob, `Alarms.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Alarm Name", "Meter Number", "Alarm Time", "HES Time"];
    const tableRows = [];

    rowData.forEach(row => {
      tableRows.push([row.ALARAMNAME, row.METERNO, row.ALARAMTIME, row.RESPONSETIME]);
    });

    doc.autoTable(tableColumn, tableRows);
    doc.save('Alarms.pdf');
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
  };
  return (
    <Fragment>
      <Container fluid>
        <Form>
          <Row className="m-1">
            <Col xs={10} md={4}>
              <TreeSelectCmp onChangeOffice={onChangeOffice} officeId={office} />
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control type='datetime-local' value={fromDate} onChange={(e) => setFromDate((e.target.value).replace('T', ' '))} />
              </Form.Group>
            </Col>
            <Col xs={12} md={4} >
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control type='datetime-local' value={toDate} onChange={(e) => setToDate((e.target.value).replace('T', ' '))} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="m-1">
            <Col xs={12} className="text-center">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setLoadingStatus('Loading Data');
                  fetchGridData();
                }} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>Submit</Button>
            </Col>
          </Row>
        </Form>
      </Container>
      {rowData ? (
        <Container fluid>
          <Row className="mt-2">
            <Col xs={12} md={6} className="d-flex flex-wrap mb-2">
              <Button variant="primary" size="md" className="m-1" onClick={exportExcel} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>
                Excel
              </Button>
              <Button variant="primary" size="md" className="m-1" onClick={exportPDF} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>
                PDF
              </Button>
              <Button variant="primary" size="md" className="m-1" onClick={exportCSV} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>
                CSV
              </Button>
            </Col>
            <Col xs={12} md={4} className="ms-auto">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search"
                  value={searchKey}
                  onChange={searchData}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} className="mx-auto">
              <div
                className="ag-theme-quartz"
                style={{ height: 350, width: "100%" }}
              >
                <AgGridReact
                  rowData={rowData}
                  columnDefs={colDefs}
                  pagination={true}
                  paginationPageSize={5}
                  paginationPageSizeSelector={[5, 10, 15, 20]}
                />
              </div>
            </Col>
          </Row>
        </Container>
      ) : (
        <Row>
          <Col md={10} className="text-center text-danger mx-auto">
            {loadingStatus}
          </Col>
        </Row>
      )}
    </Fragment>
  );
}

export default ReLoadAlarms;