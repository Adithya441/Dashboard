import { useState, Fragment } from "react";
import { Form, Row, Col, Button, Container,InputGroup } from "react-bootstrap";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
// import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import TreeSelectCmp from "../../TreeDropdown/TreeSelect";

const ReLoadTransactionLog = () => {
  const [transactionlogType, setTransactionLogType] = useState();
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [requestType, setRequestType] = useState();
  const [meterNumber, setMeterNumber] = useState();
  const [status, setStatus] = useState();
  const [searchKey, setSearchKey] = useState();
  const [rowData, setRowData] = useState();
  const [loadingStatus, setLoadingStatus] = useState('');

  const [colDefs, setColDefs] = useState([
    {
      field: "TRANSACTIONID",
      filter: true,
      headerName: "Transaction Id",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "DEVICEID",
      filter: true,
      headerName: "Device Id",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "METERID",
      filter: true,
      headerName: "Meter Id",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "COMMANDNAME",
      filter: true,
      headerName: "Command Name",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "DEFAULTCOMMUNICATIONTYPE",
      filter: true,
      headerName: "Default Communication Type",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "TRANS_START_TIME",
      filter: true,
      headerName: "Request Time",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "RESPONSETIME",
      filter: true,
      headerName: "Response Time",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "REQUESTTIME",
      filter: true,
      headerName: "Meter Time",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "REQUESTTYPE",
      filter: true,
      headerName: "Request Type",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "RESONSEDATASIZE",
      filter: true,
      headerName: "Request Data Size",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "RESONSEDATASIZE",
      filter: true,
      headerName: "Response Data Size",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "NOOFATTEMPTS",
      filter: true,
      headerName: "No Of Attempts",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "RESPONSESTATUS",
      filter: true,
      headerName: "Response Status",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "MOBILENO",
      filter: true,
      headerName: "Mobile No",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "IPADDRESS",
      filter: true,
      headerName: "Ip Address",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "DIALING",
      filter: true,
      headerName: "Dialing",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
    {
      field: "MESSAGE",
      filter: true,
      headerName: "Message",
      valueFormatter: (params) => (params.value === null ? "-" : params.value),
    },
  ]);
  //TREECOMPONENT DATA
  const [office, setOffice] = useState("3459274e-f20f-4df8-a960-b10c5c228d3e");

  const onChangeOffice = (newValue) => {
    console.log('onChange ', newValue)
    setOffice(newValue);

    //SERVICE URLS
    const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
    const transactionLogUrl = `json/plugin/com.flg.jcu.plugin.GetEnumPlugin/service`;

    const buildGridUrl = () => {
      const params = new URLSearchParams({
        draw: "2",
        length: "10",
        meterNumber: meterNumber,
        office: office,
        start: 0
      });
      if (status) params.append("Status", status);
      if (toDate) params.append("Todate", toDate);
      if (transactionlogType) params.append("command", transactionlogType);
      if (requestType) params.append("requesttype", requestType);
      if (fromDate) params.append("fromdate", fromDate);
      return `/api/server3/UHES-0.0.1/WS/callForServerpaginationForTransactionLog?${params.toString()}`;
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
        console.log('fetched service data:', (responseData.data));

      } catch (err) {
        setLoadingStatus('Data not found');
        console.error(err.message);
      }
    };
    const exportCSV = () => {
      const csvData = rowData.map(row => ({
        TransactionId: row.TRANSACTIONID,
        DeviceId: row.DEVICEID,
        MeterId: row.METERID,
        CommandName: row.COMMANDNAME,
        DefaultCommunicationType: row.DEFAULTCOMMUNICATIONTYPE,
        RequestTime: row.TRANS_START_TIME,
        ResponseTime: row.RESPONSETIME,
        MeterTime: row.REQUESTTIME,
        RequestType: row.REQUESTTYPE,
        RequestDataSize: row.RESONSEDATASIZE,
        ResponseDataSize: row.RESONSEDATASIZE,
        NoOfAttempts: row.NOOFATTEMPTS,
        ResponseStatus: row.RESPONSESTATUS,
        MobileNo: row.MOBILENO,
        IpAddress: row.IPADDRESS,
        Dailing: row.DIALING,
        Message: row.MESSAGE
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'TransactionLog.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const exportExcel = async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Transaction Log');
      const headers = Object.keys(rowData[0] || {});
      const title = worksheet.addRow([`Transaction Log`]);
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
      saveAs(blob, `TransactionLog.xlsx`);
    };

    const exportPDF = () => {
      const doc = new jsPDF();
      const tableColumn = ["Transaction Id", "Device Id", "Meter Id", "Command Name", "Default Communication Type", "Request Time", "Response Time", "Meter Time", "Request Type", "Request Data Size", "Response Data Size", "No Of Attempts", "Response Status", "Mobile No", "Ip Address", "Dailing", "Message"];
      const tableRows = [];

      rowData.forEach(row => {
        tableRows.push([row.TRANSACTIONID, row.DEVICEID, row.METERID, row.COMMANDNAME, row.DEFAULTCOMMUNICATIONTYPE, row.TRANS_START_TIME, row.RESPONSETIME, row.REQUESTTIME, row.REQUESTTYPE, row.RESONSEDATASIZE, row.RESONSEDATASIZE, row.NOOFATTEMPTS, row.RESPONSESTATUS, row.MOBILENO, row.IPADDRESS, row.DIALING, row.MESSAGE]);
      });

      doc.autoTable(tableColumn, tableRows);
      doc.save('TransactionLog.pdf');
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
              <Col xs={12} md={4}>
              <TreeSelectCmp onChangeOffice={onChangeOffice} officeId={office} />
              </Col>
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label><span className="text-danger">*</span>Transaction Log</Form.Label>
                  <Form.Control as="select" value={transactionlogType} onChange={(e) => setTransactionLogType(e.target.value)} required>
                    <option value="" selected>-NA-</option>
                    <option value="fep.FEP_CSV_CONTROL_EVENTS">Control Events</option>
                    <option value="fep.FEP_CSV_CURRENT_EVENTS">Current Events</option>
                    <option value="fep.FEP_csv_ED">Daily Load Profile</option>
                    <option value="fep.FEP_csv_EOB_ed">Monthly Billing</option>
                    <option value="FEP.FEP_CSV_FOTA">FOTA</option>
                    <option value="fep.FEP_csv_instant">Instant Log</option>
                    <option value="FEP.FEP_CSV_JSONCONFIG">Configurations</option>
                    <option value="fep.fep_csv_lp">Block Load Profile</option>
                    <option value="FEP.FEP_CSV_METER_PING">PING</option>
                    <option value="FEP.FEP_CSV_MRO">Mode Relay Operation</option>
                    <option value="fep.FEP_CSV_NAMEPLATE">Name Plate</option>
                    <option value="fep.FEP_CSV_NONROLLOVER_EVENTS">Non Rollover Events</option>
                    <option value="fep.FEP_CSV_OTHER_EVENTS">Other Events</option>
                    <option value="fep.FEP_CSV_POWERFAILURE_EVENTS">Power Failure Events</option>
                    <option value="fep.FEP_CSV_TRANSACTIONAL_EVENTS">Transactional Events</option>
                    <option value="FEP.FEP_CSV_TRE">Temperature Events</option>
                    <option value="fep.FEP_CSV_VOLTAGE_EVENTS">Voltage Events</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label><span className="text-danger">*</span>From Date</Form.Label>
                  <Form.Control type="datetime-local" value={fromDate} onChange={(e) => setFromDate((e.target.value).replace('T', ' '))} required />
                </Form.Group>
              </Col>
            </Row>
            <Row className="m-1">
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label><span className="text-danger">*</span>To Date</Form.Label>
                  <Form.Control type="datetime-local" value={toDate} onChange={(e) => setToDate((e.target.value).replace('T', ' '))} required />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Label><span className="text-danger">*</span>Request Type</Form.Label>
                <Form.Control as="select" value={requestType} onChange={(e) => setRequestType(e.target.value)} required>
                  <option>-NA-</option>
                  <option value="ALL">All</option>
                  <option value="O">OnDemand</option>
                  <option value="S">Scheduler</option>
                  <option value="SP">Scheduler Push</option>
                </Form.Control>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label>Meter Number</Form.Label>
                  <Form.Control type="string" value={meterNumber} onChange={(e) => setMeterNumber(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
            <Row className="m-1">
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Control as="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option>-NA-</option>
                    <option value="Success">Success</option>
                    <option value="Failure">Failure</option>
                  </Form.Control>
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
                  }} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}
                >Submit</Button>
              </Col>
            </Row>
          </Form>
        </Container>
        {rowData ? (
          <Container fluid>
            <Row className="mt-4">
              <Col xs={12} md={6} className="d-flex flex-wrap mb-3">
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
            <Col md={10} className="text-center text-danger mx-auto m-2">
              {loadingStatus}
            </Col>
          </Row>
        )}
      </Fragment>
    );
  }
}

export default ReLoadTransactionLog;