import { useState, useEffect, useCallback } from "react"
import ReactECharts from "echarts-for-react"
import Apicall from "./GetCommunication"
import "./CommunicationStatus.css"

export default function CommunicationStatus({ officeid }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedData, setSelectedData] = useState(null)
  const [selectlabel, setSelectLabel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dataavailable, setDataAvailable] = useState(null)
  const [chartData, setChartData] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      console.log("Fetching data for officeid:", officeid)
      const tokenUrl = "/api/server3/UHES-0.0.1/oauth/token"
      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "password",
          username: "Admin",
          password: "Admin@123",
          client_id: "fooClientId",
          client_secret: "secret",
        }),
      })

      if (!tokenResponse.ok) {
        setLoading(false)
        setDataAvailable("No Data Available")
        return
      }

      const tokenData = await tokenResponse.json()
      const accessToken = tokenData.access_token
      const dataUrl = `/api/server3/UHES-0.0.1/WS/getcommunicationstatus?officeid=${officeid}`

      const dataResponse = await fetch(dataUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!dataResponse.ok) {
        setLoading(false)
        setDataAvailable("No Data Available")
        return
      }

      const responseData = await dataResponse.json()
      if (!responseData || !responseData.ydata1 || !responseData.xData) {
        setLoading(false)
        setDataAvailable("No Data Available")
        return
      }

      const total = responseData.ydata1.slice(0, 3).reduce((acc, curr) => acc + curr, 0)
      const series = responseData.ydata1.slice(0, 3)
      const labels = responseData.xData.slice(0, 3)

      console.log("Fetched data:", responseData)
      setChartData({ total, series, labels })
      setLoading(false)
    } catch (err) {
      console.error("Error fetching data:", err.message)
      setLoading(false)
      setDataAvailable("No Data Available")
    }
  }, [officeid])

  useEffect(() => {
    if (officeid) {
      setLoading(true)
      fetchData()
    }
  }, [officeid, fetchData])

  if (loading) {
    return <p>Loading...</p>
  }

  if (dataavailable) {
    return <div className="no-data-available">{dataavailable}</div>
  }

  if (!chartData || !chartData.series || !chartData.labels) {
    return <div>No Data Available</div>
  }

  const { total, series, labels } = chartData

  const options = {
    title: {
      text: "Meter Communication Status",
      left: "10%",
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      textStyle: {
        color: "#fff",
      },
      padding: [8, 12],
      borderRadius: 5,
      position: function (point) {
        return [point[0], point[1] - 40]; // Tooltip above the item
      },
      formatter: (params) => {
        const percentage = ((params.value / total) * 100).toFixed(2);
        return `${params.name}: ${params.value} (${percentage}%)`;
      },
    },
    legend: {
      bottom: "-1%",
      textStyle: {
        color: "#000",
        fontSize: 10,
        fontWeight: "bold",
        fontFamily: "Arial",
      },
      itemWidth: 20,
      itemHeight: 10,
      icon: "rect",
    },
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: {
        text: `Total: ${total}`,
        textAlign: "center",
        fill: "#000",
        fontSize: 16,
        fontWeight: "bold",
      },
    },
    series: [
      {
        name: "Status",
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "inside",
          formatter: "{c}", // Show value inside each slice
          fontSize: 14,
          fontWeight: "bold",
        },
        emphasis: {
          label: {
            show: false,
            formatter: "{b}: {c} ({d}%)", // Show name, value, and percentage on hover
            fontSize: "12",
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false, // Hide label lines inside the chart
        },
        data: labels.map((label, index) => ({
          name: label,
          value: series[index],
        })),
        color: ["#68B984", "#DE6E56", "#619ED6"],
      },
    ],
  };
  
  

  const onChartClick = (params) => {
    if (params.seriesType !== "pie") {
      return; // Ignore clicks on anything other than pie chart segments
    }
  
    const selectedLabel = params.name;
    const selectedValue = params.value;
    const percentage = ((selectedValue / total) * 100).toFixed(2);
  
    setSelectedData({ label: selectedLabel, value: selectedValue, percentage });
    setSelectLabel(selectedLabel);
    setShowModal(true);
  };
  

  return (
    <div className="blck2">
      <div className="charts2">
        <ReactECharts option={options} style={{ width: "100%", height: "85%" }} onEvents={{ click: onChartClick }} />
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1050,
            backgroundColor: "#fff",
            width: "1000px",
            borderRadius: "5px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
            padding: "1em",
            marginLeft: "125px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h5 id="contained-modal-title-vcenter">{selectlabel}</h5>
            <button
              onClick={() => setShowModal(false)}
              style={{ background: "none", border: "none", fontSize: "1.5rem" }}
            >
              &times;
            </button>
          </div>
          <div style={{ maxHeight: "70vh", width: "970px", overflowY: "auto" }}>
            <Apicall selectedLabel={selectlabel} office={officeid} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1em" }}>
            <button onClick={() => setShowModal(false)} style={{ padding: "0.5em 1em", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

