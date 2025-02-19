import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import GetOlderonMITypes from './GetOlderonMITypes';
import './MITypes.css';

const OlderonMITypes = ({ officeid }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataAvailable, setDataAvailable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [category, setCategory] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);

  const colorPalette = [
    '#3498db', 
    '#e67e22', 
    '#2ecc71', 
    '#f1c40f', 
    '#9b59b6',  
  ];

  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const baseUrl = `/api/server3/UHES-0.0.1/WS/gettingOlderBasedOnMI?applyMaskingFlag=N&officeid=${officeid}`;

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

      if (!tokenResponse.ok) {
        setDataAvailable("No Data Available");
        setLoading(false);
        return;
      }
      
      const { access_token: accessToken } = await tokenResponse.json();

      const dataResponse = await fetch(baseUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!dataResponse.ok) {
        setDataAvailable("No Data Available");
        setLoading(false);
        return;
      }

      const responseData = await dataResponse.json();

      if (!responseData.yData) {
        setDataAvailable("No Data Available");
        setLoading(false);
        return;
      }

      const labels = responseData.xData; // Communication types like BCITSRF, GPRS, etc.
      const ranges = responseData.yData.map(item => item.name); // Ranges like "1D-3D", "3D-1W", etc.
      const rangeData = responseData.yData.map(item => item.data);

      const percentageData = labels.map((_, index) => {
        const total = rangeData.reduce((acc, range) => acc + range[index], 0);
        return rangeData.map(range => (total ? ((range[index] / total) * 100).toFixed(1) : 0));
      });

      const series = ranges.map((rangeName, i) => ({
        name: rangeName,
        type: 'bar',
        stack: 'total',
        data: percentageData.map(data => parseFloat(data[i])),
        label: {
          show: true,
          position: 'inside',  // Position the label inside the bar
          formatter: (params) => {
            const index = params.dataIndex;
            const percentage = percentageData[index][i];  // Getting the percentage for this index
            return `${percentage}`;  // Display the percentage
          },
        },
      }));
      

      setChartData({
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            // Get the index of the hovered item
            const index = params.dataIndex;
            // Get actual values from original data arrays
            const actualValue = rangeData[params.seriesIndex][params.dataIndex];
      
            return `${params.name} <br /> ${params.seriesName}: ${actualValue}`;
          },
        },
        legend: {
          top: '15%',
          left: 'center'
        },
        title: {
          text: 'Older Based on MI Types',
        },
        grid: {
          top: '25%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          max: 100
        },
        yAxis: {
          type: 'category',
          data: labels
        },
        series: series,
        color: colorPalette,
      });

      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setChartData(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [officeid]);

  const onChartClick = (params) => {
    setCategory(params.name);
    setSelectedLabel(params.seriesName);
    setSelectedData({
      category: params.name,
      value: params.value,
      label: params.seriesName
    });
    setShowModal(true);
  };

  return (
    <div className="blck1">
      {loading ? (
        <div>Loading...</div>
      ) : dataAvailable ? (
        <div className="no-data-available">{dataAvailable}</div>
      ) : chartData ? (
        <div className="charts1">
          <ReactECharts
            option={chartData}
            style={{ height: '100%', width: '100%',marginTop: '25px' }}
            onEvents={{
              click: onChartClick
            }}
          />
        </div>
      ) : (
        <div>No Data Available</div>
      )}

      {showModal && (
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
            <h5 id="contained-modal-title-vcenter">{selectedLabel}</h5>
            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
              &times;
            </button>
          </div>

          <div style={{ maxHeight: '70vh', width: '970px', overflowY: 'auto' }}>
            <GetOlderonMITypes selectedLabel={selectedLabel} selectedCategory={category} office={officeid} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1em' }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '0.5em 1em', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OlderonMITypes;