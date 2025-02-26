import { useState } from "react";
import { Tabs } from "antd";
import Day from "./Day";
import Week from "./week";
import Season from "./season";
import Activation from "./Activation";
import DayConfiguration from "./DayConfiguration";
import WeekConfiguration from "./WeekConfiguration";
import SeasonConfiguration from "./SeasonConfiguration";
import ActivationConfiguration from "./ActivitationConfiguration.js";

function ConfigurationTabs({ showContent, CalendarName,jsonData,manufactureId, metertypeId  }) {
  const [activeKey, setActiveKey] = useState("day");
 
  const handleNewDayTab = () => {
    setTabs((prevTabs) => {
      const existingTab = prevTabs.find(tab => tab.key.startsWith("calendar-day"));
      if (existingTab) {
        setActiveKey(existingTab.key);
        return prevTabs;
      }
      const count = prevTabs.filter(tab => tab.key.startsWith("calendar-day")).length;
      const newKey = `calendar-day-${count + 1}`;
      return [
        ...prevTabs,
        {
          key: newKey,
          tab: `Day Configuration ${count + 1}`,
          component: <DayConfiguration CalendarName={CalendarName} onCancel={handleCloseTab} tabKey={newKey} manufactureId={manufactureId} metertypeId={metertypeId} parentTab="day" />,
          closable: true
        }
      ];
    });
    setActiveKey(`calendar-day-${tabs.length + 1}`);
  };
  
  
  const handleNewWeekTab = () => {
    setTabs((prevTabs) => {
      const existingTab = prevTabs.find(tab => tab.key.startsWith("calendar-week"));
      if (existingTab) {
        setActiveKey(existingTab.key);
        return prevTabs;
      }
      const newKey = `calendar-week`;
      return [
        ...prevTabs,
        {
          key: newKey,
          tab: `Week Configuration`,
          component: <WeekConfiguration CalendarName={CalendarName} onCancel={handleCloseTab} tabKey={newKey} parentTab="week" />,
          closable: true
        }
      ];
    });
  
    setActiveKey(`calendar-week`);
  };
  

  const handleNewSeasonTab = () => {
    setTabs((prevTabs) => {
      const existingTab = prevTabs.find(tab => tab.key.startsWith("calendar-season"));
      if (existingTab) {
        setActiveKey(existingTab.key); 
        return prevTabs; 
      }
      const newKey = `calendar-season`;
      return [
        ...prevTabs,
        {
          key: newKey,
          tab: `Season Configuration`,
          component: <SeasonConfiguration CalendarName={CalendarName} onCancel={handleCloseTab} tabKey={newKey} parentTab="season" />,
          closable: true
        }
      ];
    });
    setActiveKey(`calendar-season`);
  };
  
  const handleNewActivationTab = () => {
    setTabs((prevTabs) => {
      const existingTab = prevTabs.find(tab => tab.key.startsWith("calendar-activation"));
      if (existingTab) {
        setActiveKey(existingTab.key); 
        return prevTabs;
      }
      const newKey = `calendar-activation`;
      return [
        ...prevTabs,
        {
          key: newKey,
          tab: `Activation Configuration`,
          component: <ActivationConfiguration CalendarName={CalendarName} jsonData={jsonData} onCancel={handleCloseTab} tabKey={newKey} parentTab="activation" />,
          closable: true
        }
      ];
    });
    setActiveKey(`calendar-activation`);
  };
  
 
  const [tabs, setTabs] = useState([
 { key: "day", tab: "Day Configuration", closable: false, component: <Day active={activeKey === "day"} CalendarName={CalendarName} manufactureId={manufactureId} metertypeId={metertypeId} onAddUpdate={() => handleNewDayTab(metertypeId, manufactureId)} /> },
  { key: "week", tab: "Week Configuration", closable: false, component: <Week active={activeKey === "week"} CalendarName={CalendarName} onAddUpdate={handleNewWeekTab} /> },
  { key: "season", tab: "Season Configuration", closable: false, component: <Season active={activeKey === "season"} CalendarName={CalendarName} onAddUpdate={handleNewSeasonTab} /> },
  { key: "activationdate", tab: "Activation Date", closable: false, component: <Activation active={activeKey === "activationdate"} CalendarName={CalendarName} onAddUpdate={handleNewActivationTab} /> }
  ]);
  const [newTabCounter, setNewTabCounter] = useState(1);
  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const handleCloseTab = (targetKey, parentTab = null) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    const newTabs = tabs.filter((tab, i) => {
      if (tab.key === targetKey) {
        lastIndex = i - 1; 
      }
      return tab.key !== targetKey; 
    });
    if (newTabs.length > 0) {
      if (newActiveKey === targetKey) {
        if (parentTab && tabs.some(tab => tab.key === targetKey && tab.key.includes(parentTab))) {
          newActiveKey = parentTab;
        } else {
          newActiveKey = lastIndex >= 0 && lastIndex < newTabs.length ? newTabs[lastIndex].key : newTabs[0].key;
        }
      }
    } else {
      newActiveKey = "";
    }
  
    setTabs(newTabs);
    setActiveKey(newActiveKey);
  };
  
  
  return (
    <div>
      {showContent && (
        <div>
          <Tabs 
            type="editable-card"
            hideAdd
            activeKey={activeKey}
            onChange={handleTabChange}
            onEdit={(key, action) => action === "remove" && handleCloseTab(key)}
          >
            {tabs.map((tab) => (
              <Tabs.TabPane tab={tab.tab} key={tab.key} closable={tab.closable} />
            ))}
          </Tabs>
          <div>{tabs.find((tab) => tab.key === activeKey)?.component}</div>
        </div>
      )}
    </div>
  );
}

export default ConfigurationTabs;
