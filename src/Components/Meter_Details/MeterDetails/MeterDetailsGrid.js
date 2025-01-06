import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import './MeterDetails.css';
import { TreeSelect, Spin } from 'antd';

const MeterDetailsGrid = ({ onMeterClick, officeidChange }) => {
  const [loading, setLoading] = useState(false);
  const [meterData, setMeterData] = useState(null);
  const [selectedValue, setSelectedValue] = useState('3459274e-f20f-4df8-a960-b10c5c228d3e');

  const columnDefs = useMemo(() => [
    { 
      headerName: "Meter No", 
      field: "meterno",
      onCellClicked: params => onMeterClick?.(params.data),
      cellClass: "blue-cell"
    },
    { headerName: "Meter Type", field: "metertype" },
    { headerName: "Meter Manufacture", field: "metermake" },
    { headerName: "Meter Interface", field: "meterInterface" },
    { headerName: "Payment Type", field: "paymenttype" },
    { headerName: "Relay Status", field: "relaystatus" }
  ], [onMeterClick]);

  const handleValueChange = useCallback((value) => {
    setSelectedValue(value);
    officeidChange?.(value);
  }, [officeidChange]);

  // Fetch meter data when selectedValue changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Add your data fetching logic here
        setMeterData([]); // Replace with actual data
      } catch (error) {
        console.error('Error fetching meter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedValue]);

  return (
    <div className="meter-details-container">
      <TreeSelect
        style={{ width: '100%' }}
        value={selectedValue}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        treeData={[]} // Add your tree data here
        placeholder="Please select office"
        treeDefaultExpandAll
        onChange={handleValueChange}
        className="custom-select"
      />
      <div className="ag-theme-quartz" style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
        {loading ? (
          <Spin size="large" />
        ) : (
          <AgGridReact
            columnDefs={columnDefs}
            rowData={meterData}
            pagination={true}
            paginationPageSize={10}
            domLayout='autoHeight'
          />
        )}
      </div>
    </div>
  );
};

export default MeterDetailsGrid;
