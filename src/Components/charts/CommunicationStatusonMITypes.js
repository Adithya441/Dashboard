import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Modal, Button } from 'react-bootstrap';
import GetCommunicationStatusonMITypes from './GetCommunicationStatusonMITypes';
import './CommunicationStatusonMITypes.css';

const CommunicationStatusonMITypes = ({ officeid }) => {
  const [chartData, setChartData] = useState(null);
  const [communicated, setCommunicated] = useState(0);
  const [notCommunicated, setNotCommunicated] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataavailable, setDataAvailable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedData, setSelectedData] = useState(null);
  const [categorys, setCategory] = useState(null);
  const [selectlabel, setSelectlabel] = useState(null);

  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const baseUrl = `/api/server3/UHES-0.0.1/WS/getmeterCommunicationStatusBasedOnMI?officeid=${officeid}`;

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
        setLoading(false);
        setDataAvailable("No Data Available");
        return;
      }
      const { access_token: accessToken } = await tokenResponse.json();

      const dataResponse = await fetch(baseUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!dataResponse.ok) {
        setLoading(false);
        setDataAvailable("No Data Available");
        return;
      }
      const responseData = await dataResponse.json();

      if (!responseData || !responseData.yData || !responseData.xData) {
        setLoading(false);
        setDataAvailable("No Data Available");
        return;
      }

      const labels = responseData.xData || [];
      const communicatedData = responseData.yData[0]?.data || [];
      const notCommunicatedData = responseData.yData[1]?.data || [];

      if (labels.length === 0 || communicatedData.length === 0 || notCommunicatedData.length === 0) {
        setLoading(false);
        setDataAvailable("No Data Available");
        return;
      }

      const percentageData = labels.map((_, index) => {
        const total = communicatedData[index] + notCommunicatedData[index];
        const commPercent = total ? ((communicatedData[index] / total) * 100).toFixed(2) : 0;
        const notCommPercent = total ? ((notCommunicatedData[index] / total) * 100).toFixed(2) : 0;
        return [communicatedData[index], notCommunicatedData[index], commPercent, notCommPercent];
      });

      const chartOptions = {
        title: {
          text: 'Meter Communication Status Based on MI Types',
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            // Get the index of the hovered item
            const index = params.dataIndex;
            // Get actual values from original data arrays
            const actualValue =
              params.seriesName === 'Meter Communicated'
                ? communicatedData[index]
                : notCommunicatedData[index];
      
            return `${params.name} <br /> ${params.seriesName}: ${actualValue}`;
          },
        },
        legend: {
          data: ['Meter Communicated', 'Meter Not Communicated'],
          top: '10%',
        },
        grid: {
          left: '0%',  // Increase left margin to avoid label truncation
          right: '5%',
          bottom: '0%',
          containLabel: true
        },
        yAxis: {
          type: 'category',
          data: labels,
        },
        xAxis: {
          type: 'value',
          max: 100,
        },
        series: [
          {
            name: 'Meter Communicated',
            type: 'bar',
            stack: 'total',
            data: percentageData.map((d) => d[2]),
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
            stack: 'total',
            data: percentageData.map((d) => d[3]),
            itemStyle: {
              color: 'rgb(28, 148, 142)',
            },
            label: {
              show: true,
              position: 'inside',
              formatter: '{c}', // Displays percentage on bars
              color: '#fff',
            },
          },
        ],
      };

      setChartData(chartOptions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
      setDataAvailable("No Data Available");
    }
  };
  const onChartClick = (params) => {
    console.log("Chart Click Params:", params); // Debugging log
  
    const selectedLabel = params.name; // Category name (e.g., MI Type)
    const selectedValue = params.value; // Selected bar value
    const selectedSeries = params.seriesName; // Series name ('Meter Communicated' or 'Meter Not Communicated')
  
    if (!chartData || !chartData.series) return;
  
    // Ensure the category is valid
    const index = chartData.yAxis.data.indexOf(selectedLabel);
    if (index === -1) return;
  
    const communicated = chartData.series[0].data[index];
    setCommunicated(communicated);
    const notCommunicated = chartData.series[1].data[index];
    setNotCommunicated(notCommunicated);
    const total = communicated + notCommunicated;
    const percentage = total ? ((selectedValue / total) * 100).toFixed(2) : 0;
  
    console.log("Selected Series:", selectedSeries); // Debugging log
    setSelectedData({ label: selectedLabel, value: selectedValue, percentage });
    setSelectlabel(selectedLabel);
    setCategory(selectedSeries); // Set category from `seriesName`
    setShowModal(true);
  };
  
  
  console.log(categorys)
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [officeid]);

  const handleClose = () => setShowModal(false);

  return (
    <div className="blck">
      {loading ? (
        <div>Loading...</div>
      ) : dataavailable ? (
        <div className="no-data-available">{dataavailable}</div>
      ) : chartData ? (
        <div className="charts">
          <ReactECharts
            option={chartData}
            onEvents={{ click: onChartClick }}
            style={{ width: '100%', height: '85%' }}
          />
        </div>
      ) : (
        <div className="no-data-available">No Data Available</div>
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
            <h5 id="contained-modal-title-vcenter">{selectlabel}</h5>
            <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
              &times;
            </button>
          </div>

          <div style={{ maxHeight: '70vh', width: '970px', overflowY: 'auto' }}>
            <GetCommunicationStatusonMITypes selectedLabel={selectlabel} selectedCategory={categorys} office={officeid} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1em' }}>
            <button onClick={handleClose} style={{ padding: '0.5em 1em', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationStatusonMITypes;
