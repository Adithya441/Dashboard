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

const ReLoadDetailedSLAReport = () => {
  const [dateInput,setDateInput]=useState();
  const [loadingStatus, setLoadingStatus] = useState();
  const [gridData, setGridData] = useState();
  const [searchKey,setSearchKey]=useState();
  const [colDefs, setColDefs] = useState([
    { field: 'MAKE', headerName: 'Manufacture', filter: true,valueFormatter: (params) => (params.value === null ? "-" : params.value), },
    { field: 'TYPE', headerName: 'Type', filter: true,valueFormatter: (params) => (params.value === null ? "-" : params.value), },
    { field: 'METER_Number', headerName: 'Meter Number', filter: true,valueFormatter: (params) => (params.value === null ? "-" : params.value), },
    { field: 'BLP_METER_Time', headerName: 'BLP Meter Time', filter: true ,valueFormatter: (params) => (params.value === null ? "-" : params.value),},
    { field: 'BLP_DCU_Time', headerName: 'BLP HES Time', filter: true,valueFormatter: (params) => (params.value === null ? "-" : params.value), },
    { field: 'HRS8_Count', headerName:'8HRS Count', filter:true,valueFormatter: (params) => (params.value === null ? "-" : params.value),},
    { field: 'HRS12_Count', headerName:'12HRS Count', filter:true,valueFormatter: (params) => (params.value === null ? "-" : params.value),},
    { field: 'HRS24_Count', headerName:'24HRS Count', filter:true,valueFormatter: (params) => (params.value === null ? "-" : params.value),},
    { field: 'DLP_METER_Time', headerName:'DLP Meter Time', filter:true,valueFormatter: (params) => (params.value === null ? "-" : params.value),},
    { field: 'DLP_DCU_Time', headerName:'DLP DCU Time', filter:true,valueFormatter: (params) => (params.value === null ? "-" : params.value),},
    { field: 'DLP_24HRS_Count', headerName:'DLP 24HRS Count', filter:true,valueFormatter: (params) => (params.value === null ? "-" : params.value),}
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

        const dataResponse = await fetch(`/api/server3/UHES-0.0.1/WS/getDetailedSLAReport?Date=${dateInput}&officeid=${office}`, {
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
      MANUFACTURE: row.MAKE,
      TYPE: row.TYPE,
      METERNUMBER: row.METER_Number,
      BLPMETERTime: row.BLP_METER_Time,
      BLPHESTime: row.BLP_DCU_Time,
      COUNT_8HRS:row.HRS8_Count,
      COUNT_12HRS:row.HRS12_Count,
      COUNT_24HRS:row.HRS24_Count,
      DLPMETERTime:row.DLP_METER_Time,
      DLPDCUTime:row.DLP_DCU_Time,
      DLP24HRSCOUNT:row.DLP_24HRS_Count
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'DETAILEDSLAREPORT.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DETAILED SLA REPORT');
    const headers = Object.keys(gridData[0] || {});
    const title = worksheet.addRow([`DETAILED SLA REPORT`]);
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
    saveAs(blob, `DETAILEDSLAREPORT.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["MANUFACTURE","TYPE", "METERNUMBER", "BLPMETERTime", "BLPHESTime", "8HRSCount","HRS12Count","HRS24Count","DLPMETERTime","DLPDCUTime","DLP24HRSCount"];
    const tableRows = [];

    gridData.forEach(row => {
      tableRows.push([row.MAKE,row.TYPE, row.METER_Number, row.BLP_METER_Time, row.BLP_DCU_Time, row.HRS8_Count,row.HRS12_Count,row.HRS24_Count,row.DLP_METER_Time,row.DLP_DCU_Time,row.DLP_24HRS_Count]);
    });

    doc.autoTable(tableColumn, tableRows);
    doc.save('DETAILEDSLAREPORT.pdf');
  };

  const copyData =()=>{
    const textData = gridData.map(row =>
      `${row.MAKE}\t${row.TYPE}\t${row.METER_Number}\t${row.BLP_METER_Time}\t${row.BLP_DCU_Time}\t${row.HRS8_Count}\t${row.HRS12_Count}\t${row.HRS24_Count}\t${row.DLP_METER_Time}\t${row.DLP_DCU_Time}\t${row.DLP_24HRS_Count}`
    )
      .join("\n");
    navigator.clipboard.writeText(textData)
      .then(() => alert("Data copied to clipboard!"))
      .catch((error) => alert("Failed to copy data: " + error));
  }

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
      <Form className="m-1">
        <Row className='m-1'>
          <Col xs={10} lg={4}>
            <TreeSelectCmp onChangeOffice={onChangeOffice} officeId={office} />
          </Col>
          <Col xs={10} lg={4} >
            <Form.Group>
              <Form.Label><span className="text-danger">*</span>Date</Form.Label>
              <Form.Control type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
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
              }}
              style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}
              >Submit</Button>
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
                <Button variant="primary" size="md" onClick={copyData} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>
                  Copy
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

export default ReLoadDetailedSLAReport;