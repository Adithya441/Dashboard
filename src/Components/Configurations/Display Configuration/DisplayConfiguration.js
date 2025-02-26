"use client"

import { useState, useEffect, useCallback } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import "jspdf-autotable"
import ExcelJS from "exceljs"

function DisplayConfiguration({ onTabClick }) {
  const [loading, setLoading] = useState(false)
  const [meterData, setMeterData] = useState([])
  const [grid, setGrid] = useState(true)

  const handleClick = (rowData) => {
    if (onTabClick && typeof onTabClick === "function") {
      onTabClick(rowData, "DisplayparameterUpdate")
    } else {
      console.error("onTabClick is not a function")
    }
  }

  const columnDefs = [
    { headerName: "Meter Manufacture", field: "meterManufacture" },
    { headerName: "Meter Type", field: "meterType" },
    {
      headerName: "Display Config Name",
      field: "displayConfigName",
      onCellClicked: (params) => {
        console.log(params.data)
        handleClick(params.data)
      },
      cellClass: "blue-cell",
    },
  ]

  const baseUrl = `/api/server3/UHES-0.0.1/WS/getAllFepDisplayParametersConfigured`
  const tokenUrl = `/api/server3/UHES-0.0.1/oauth/token`

  const fetchAccessToken = useCallback(async () => {
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "password",
        username: "Admin",
        password: "Admin@123",
        client_id: "fooClientId",
        client_secret: "secret",
      }),
    })
    if (!tokenResponse.ok) throw new Error("Failed to authenticate")
    const tokenData = await tokenResponse.json()
    return tokenData.access_token
  }, [])

  const fetchMeterData = useCallback(async () => {
    try {
      setLoading(true)
      setGrid(false)
      const accessToken = await fetchAccessToken()
      const dataResponse = await fetch(baseUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!dataResponse.ok) throw new Error("Failed to fetch data")
      const responseData = await dataResponse.json()
      setMeterData(responseData.data || [])
      setGrid(true)
    } catch (err) {
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetchAccessToken])

  useEffect(() => {
    fetchMeterData()
  }, [fetchMeterData])

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  }

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Display Config")
    worksheet.addRow(["Display Config Details"])
    const headers = ["Meter Manufacture", "Meter Type", "Display Config Name"]
    const headerRow = worksheet.addRow(headers)
    headerRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF00" } }
    })
    meterData.forEach((data) => {
      worksheet.addRow([data.meterManufacture, data.meterType, data.displayConfigName])
    })
    worksheet.columns.forEach((column) => {
      let maxLength = 0
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10
        if (columnLength > maxLength) maxLength = columnLength
      })
      column.width = maxLength + 6
    })
    worksheet.autoFilter = { from: "A2", to: `${String.fromCharCode(64 + headers.length)}2` }
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    saveAs(blob, "Display Config.xlsx")
  }

  const exportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(meterData)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "Display Config.csv")
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text("Display Config Data", 20, 10)
    doc.autoTable({
      head: [["Meter Manufacture", "Meter Type", "Display Config Name"]],
      body: meterData.map((data) => [data.meterManufacture, data.meterType, data.displayConfigName]),
      startY: 20,
    })
    doc.save("Display Config.pdf")
  }

  const handleNewClick = () => {
    if (onTabClick && typeof onTabClick === "function") {
      onTabClick({}, "DisplayparameterConfiguration")
    } else {
      console.error("onTabClick is not a function")
    }
  }

  const buttonStyle = {
    margin: "5px",
    borderRadius: "5px",
    border: "1px solid #5cb0e7",
    backgroundColor: "#5cb0e7",
    color: "white",
  }

  return (
    <div>
      <button onClick={exportExcel} style={buttonStyle}>
        Excel
      </button>
      <button onClick={exportCSV} style={buttonStyle}>
        CSV
      </button>
      <button onClick={exportPDF} style={buttonStyle}>
        PDF
      </button>
      <div className="ag-theme-quartz" style={{ height: 300, width: "100%" }}>
        {grid && (
          <AgGridReact
            columnDefs={columnDefs}
            rowData={meterData}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
          />
        )}
      </div>
      <button onClick={handleNewClick} style={buttonStyle}>
        NEW
      </button>
    </div>
  )
}

export default DisplayConfiguration;

