import { Fragment, useState } from "react";
import TreeSelectCmp from "../../TreeDropdown/TreeSelect";
import {Row,Container,Col,Form,Button,InputGroup} from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { saveAs } from 'file-saver';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';

const ReLoadAutoMappedMetersReport = () => {
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [loadingStatus, setLoadingStatus] = useState();
  const [gridData, setGridData] = useState();
  const [searchKey,setSearchKey]=useState();
  const [colDefs, setColDefs] = useState([
    { field: 'METER_NUMBER', headerName: 'Meter Number', filter: true },
    { field: 'DATA_RECEIVED_DATE', headerName: 'Data Received Date', filter: true },
    { field: 'GATEWAY_ID', headerName: 'Gateway Id', filter: true },
    { field: 'NODE_ID', headerName: 'Node Id', filter: true },
    { field: 'SINK_IDENTIFIER', headerName: 'Sink Identifier', filter: true }
  ])
  //TREESELECT COMPONENT DATA
  const [office, setOffice] = useState("3459274e-f20f-4df8-a960-b10c5c228d3e");

  const onChangeOffice = (newValue) => {
    console.log('onChange ', newValue)
    setOffice(newValue);
  }
  //SERVICE CALL
  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
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

        const dataResponse = await fetch(`/api/server3/UHES-0.0.1/WS/ServerpaginationForAutoMappedMetersReport?office=${office}&fromDate=${fromDate}&toDate=${toDate}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!dataResponse.ok) throw new Error('Failed to fetch data');
        const responseData = await dataResponse.json();
        setGridData(responseData.data);
        if((responseData.data).length==0){
          setLoadingStatus('Data Not Found');
        }
        console.log('fetched service data:', (responseData.data));

      } catch (err) {
        console.error(err.message);
      }
    };
  //EXPORTS
  const exportCSV = () => {
    const csvData = gridData.map(row => ({
      METERNUMBER: row.METER_NUMBER,
      DATARECEIVED_DATE: row.DATA_RECEIVED_DATE,
      GATEWAYID: row.GATEWAY_ID,
      NODEID: row.NODE_ID,
      SINKIDENTIFIER: row.SINK_IDENTIFIER
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'AUTOMAPPEDMETERSREPORT.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('AUTO MAPPED METERS REPORT');
    const headers = Object.keys(gridData[0] || {});
    const title = worksheet.addRow([`AUTO MAPPED METERS REPORT`]);
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

    gridData.forEach(row => {
      worksheet.addRow(Object.values(row));
    });

    worksheet.autoFilter = {
      from: 'A2',
      to: `${String.fromCharCode(64 + headers.length)}2`
    };

    headers.forEach((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...gridData.map(row => row[header] ? row[header].toString().length : 0)
      );
      worksheet.getColumn(index + 1).width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `AUTOMAPPEDMETERSREPORT.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["METERNUMBER", "DATARECEIVEDDATE", "GATEWAYID", "NODEID", "SINKIDENTIFIER"];
    const tableRows = [];

    gridData.forEach(row => {
      tableRows.push([row.METER_NUMBER, row.DATA_RECEIVED_DATE, row.GATEWAY_ID, row.NODE_ID, row.SINK_IDENTIFIER]);
    });

    doc.autoTable(tableColumn, tableRows);
    doc.save('AUTOMAPPEDMETERSREPORT.pdf');
  };

  const searchData = (e) => {
    const searchValue = e.target.value;
    setSearchKey(searchValue);
    if (searchValue === "") {
      setGridData(gridData);
    } else {
      const filteredData = gridData.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
      setGridData(filteredData);
    }
  };
  return (
    <Fragment>
      <Container fluid>
      <Form>
        <Row className='m-1'>
          <Col xs={10} lg={4}>
            <TreeSelectCmp onChangeOffice={onChangeOffice} officeId={office} />
          </Col>
          <Col xs={10} lg={4} >
            <Form.Group>
              <Form.Label><span className="text-danger">*</span>From Date</Form.Label>
              <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </Form.Group>
          </Col>
          <Col xs={10} lg={4} >
            <Form.Group>
              <Form.Label><span className="text-danger">*</span>To Date</Form.Label>
              <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </Form.Group>
          </Col>
        </Row>
        <Row className="m-1">
          <Col xs={12} className="text-center mx-auto">
            <Button onClick={
              (e) => {
                e.preventDefault();
                setLoadingStatus('Loading Data');
                fetchGridData();
              }
            } style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>Submit</Button>
          </Col>
        </Row>
      </Form>
      {
        gridData ? (
          <Container fluid>
            <Row className="mt-4">
              <Col xs={12} md={6} className="d-flex flex-wrap gap-1 mb-3">
                <Button variant="primary" size="md" onClick={exportExcel} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>
                  Excel
                </Button>
                <Button variant="primary" size="md" onClick={exportPDF} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>
                  PDF
                </Button>
                <Button variant="primary" size="md" onClick={exportCSV} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>
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
                    rowData={gridData}
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
        )
      }
      </Container>
    </Fragment>
  );
}

export default ReLoadAutoMappedMetersReport;