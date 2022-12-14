import React, { useState, useEffect, useRef } from "react";
import RecordButton from "../../UI/RecordButton/RecordButton";
import TextField from "@mui/material/TextField";
import styles from "./LiveChartComponent.module.css";
import LiveChart from "./LiveChart";
import { v4 as uuidv4 } from "uuid";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

const serverBaseURL = "http://10.0.0.128/gap/nodes?event=1&filter_mac=50:31*";
// const serverBaseURL = "http://10.0.0.96/gap/nodes?event=1&filter_mac=50:31*";
// const serverBaseURL = "http://10";

const LiveChartComponent = (props) => {
  const toggleRef = useRef(false);
  const inputRef = useRef(0);
  const macAddressRef = useRef(0);
  const tagRef = useRef(1);
  const series = useRef([{ data: [], key: uuidv4() }]);
  const [graphPoints, updateGraphPoints] = useState([]);

  const clickToggleHandler = (shouldRecord) => {
    toggleRef.current = shouldRecord;
    if (!shouldRecord) {
      // This part sends the most current data to Preview Component.
      // If the length is more than zero then send to Preview
      const latestData = series.current[series.current.length - 1];
      if (latestData.data.length > 0) {
        props.displayThisInstance(latestData.data);
      }

      props.onReceiveData(latestData);

      // const tempdata = {
      //   key: key,
      //   data: [
      //     {
      //       x: new Date("2016-01-01T00:00:01.000Z").getTime(),
      //       y: -2,
      //       distance: inputRef.current.value,
      //       devicemac: 3,
      //       tag: tagRef.current.value,
      //     },
      //     {
      //       x: new Date("2016-01-01T00:00:02.000Z").getTime(),
      //       y: -24,
      //       distance: inputRef.current.value,
      //       devicemac: 3,
      //       tag: tagRef.current.value,
      //     },
      //     {
      //       x: new Date("2016-01-01T00:00:03.000Z").getTime(),
      //       y: -20,
      //       distance: inputRef.current.value,
      //       devicemac: 3,
      //       tag: tagRef.current.value,
      //     },
      //     {
      //       x: new Date("2016-01-01T00:00:04.000Z").getTime(),
      //       y: -2,
      //       distance: inputRef.current.value,
      //       devicemac: 3,
      //       tag: tagRef.current.value,
      //     },
      //     {
      //       x: new Date("2016-01-01T00:00:05.000Z").getTime(),
      //       y: -24,
      //       distance: inputRef.current.value,
      //       devicemac: 3,
      //       tag: tagRef.current.value,
      //     },
      //     {
      //       x: new Date("2016-01-01T00:00:06.000Z").getTime(),
      //       y: -20,
      //       distance: inputRef.current.value,
      //       devicemac: 3,
      //       tag: tagRef.current.value,
      //     },
      //   ],
      // };
      // props.onReceiveData(tempdata);
      // props.displayThisInstance(tempdata.data);

      // let body = [];
      // for (let data of tempdata.data) {
      //   body.push({
      //     key: key,
      //     timestamp_unix: data.x,
      //     rssi: data.y,
      //     distance: data.distance,
      //     devicemac: data.devicemac,
      //     tag: data.tag,
      //   });
      // }
      // (async () => {
      //   const response = await fetch("http://localhost:8080/data/", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json; charset=utf-8",
      //     },
      //     body: JSON.stringify(body),
      //   });
      //   const data = await response.json();
      //   console.log(data, "THIS IS THE DATA");
      // })();

      let body = [];
      for (let data of latestData.data) {
        body.push({
          key: latestData.key,
          timestamp_unix: new Date(data.x).getTime(),
          rssi: data.y,
          distance: data.distance,
          devicemac: data.devicemac,
          tag: data.tag,
        });
      }
      (async () => {
        const response = await fetch("http://localhost:8080/data/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        console.log(data, "THIS IS THE DATA");
      })();

      const key = uuidv4();
      series.current = [...series.current, { data: [], key: key }];
    }
    props.onTimerRefresh(toggleRef.current);
  };

  useEffect(() => {
    const eventSource = new EventSource(serverBaseURL);
    eventSource.addEventListener("error", (e) => {
      eventSource.close();
      console.log("error occurred");
    });
    eventSource.addEventListener("open", () => {
      console.log("SSE opened!");
    });
    eventSource.addEventListener("close", () => eventSource.close());
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);

      //update line chart
      updateGraphPoints((prev) => {
        let newChartPoints = prev ? [...prev] : [];

        const x = new Date();
        const y = data.rssi;

        if (toggleRef.current) {
          newChartPoints.push({ date: x, recordedRssi: y });
        } else {
          newChartPoints.push({ date: x, rssi: y });
        }
        if (newChartPoints.length > 10) newChartPoints.shift();
        return newChartPoints;
      });
      if (toggleRef.current) {
        let newSeries = [...series.current];
        newSeries[newSeries.length - 1].data.push({
          x: new Date(),
          y: data.rssi,
          distance: inputRef.current.value,
          // macaddress: macAddressRef.current.value,
          devicemac: data.bdaddrs[0]["bdaddr"],
          tag: tagRef.current.value,
        });
        macAddressRef.current = data.bdaddrs[0]["bdaddr"];
        series.current = newSeries;
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <div className={styles["chart-container"]}>
        <LiveChart graphPoints={graphPoints} />
      </div>

      <RecordButton onClick={clickToggleHandler} disable={props.shouldStop} />

      <div className={styles.actions}>
        <Box sx={{ minWidth: 50 }}>
          <FormControl
            fullWidth
            disabled={props.shouldStop || toggleRef.current}
          >
            <TextField
              // id="inputDistance"
              label="Distance"
              variant="outlined"
              type="number"
              inputRef={inputRef}
              disabled={props.shouldStop || toggleRef.current}
            />
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 50 }}>
          <FormControl
            fullWidth
            disabled={props.shouldStop || toggleRef.current}
          >
            {/* <InputLabel id="demo-simple-select-label">Test Tag</InputLabel> */}
            <TextField
              id="demo-simple-select"
              label="Test Tag"
              variant="outlined"
              inputRef={tagRef}
            />
          </FormControl>
        </Box>
      </div>
    </div>
  );
};

// export default React.memo(LineChartComponent);

export default LiveChartComponent;
