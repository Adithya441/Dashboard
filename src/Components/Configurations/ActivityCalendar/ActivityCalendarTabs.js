import { useState, useCallback, useRef, useEffect } from "react";
import { Tabs } from "antd";
import ActivityCalendar from "./ActivityCalendar.js";
import CalendarName from './CalendarName.js';
import NewActivityCalendar from './NewActivityCalendar.js';

function ActivityCalendarTabs({ data }) {
  const [activeKey, setActiveKey] = useState("1");
  const tabHistory = useRef(["1"]);
  const [tabs, setTabs] = useState([
    {
      key: "1",
      label: "Activity Calendar Config",
      closable: false,
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTabCounter, setNewTabCounter] = useState(1);

  // Update activeKey when tabs change
  useEffect(() => {
    if (tabs.length > 0) {
      setActiveKey(tabs[tabs.length - 1].key);
    }
  }, [tabs]);

  const handleTabChange = (key) => {
    tabHistory.current.push(key); // Add current tab to history
    setActiveKey(key);
  };

  const handleCalendarNameClick = useCallback((rowData) => {
    console.log("rowData:", rowData);
    console.log("CALENDAR NAME:", rowData?.CALENDERNAME);

    const calendarName = rowData?.CALENDERNAME?.trim() || "Untitled"; 
    const newKey = `calendar-${calendarName}-${newTabCounter}`;

    setTabs((prevTabs) => {
      const existingTab = prevTabs.find((tab) => tab.key === newKey);
      if (!existingTab) {
        if (prevTabs.length < 7) {
          setNewTabCounter((prevCounter) => prevCounter + 1);
          return [
            ...prevTabs,
            {
              key: newKey,
              label: calendarName,
              closable: true,
              data: rowData,
            },
          ];
        } else {
          setIsDialogOpen(true);
        }
      }
      return prevTabs;
    });

  }, [newTabCounter]);

  const handleCancel = () => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.key !== activeKey));
    tabHistory.current = tabHistory.current.filter((key) => key !== activeKey);
    setActiveKey(tabHistory.current.length ? tabHistory.current[tabHistory.current.length - 1] : "1");
  };

  const onEdit = (targetKey, action) => {
    if (action === "remove") {
      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((tab) => tab.key !== targetKey);
        return newTabs;
      });

      tabHistory.current = tabHistory.current.filter((key) => key !== targetKey);

      if (targetKey === activeKey) {
        const previousKey = tabHistory.current.length ? tabHistory.current[tabHistory.current.length - 1] : "1";
        setActiveKey(previousKey);
      }
    }
  };

  const handleNewTab = () => {
    const newKey = `calendar-new-${newTabCounter}`;

    if (tabs.length < 7) {
      setTabs((prevTabs) => [
        ...prevTabs,
        {
          key: newKey,
          label: "Activity Calendar Form",
          closable: true,
          data: {},
        },
      ]);
      setNewTabCounter((prevCounter) => prevCounter + 1);
      handleTabChange(newKey);
    }
  };

  return (
    <div>
      <Tabs
        type="editable-card"
        hideAdd
        activeKey={activeKey}
        onChange={handleTabChange}
        onEdit={onEdit}
        items={tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          children: tab.key === "1" ? (
            <ActivityCalendar onCalendarName={handleCalendarNameClick} onNewTab={handleNewTab} />
          ) : tab.key.startsWith("calendar-new") ? (
            <NewActivityCalendar onCancel={handleCancel} />
          ) : (
            <CalendarName data={tab.data} onCancel={handleCancel} />
          ),
          closable: tab.closable,
        }))}
      />
    </div>
  );
}

export default ActivityCalendarTabs;
