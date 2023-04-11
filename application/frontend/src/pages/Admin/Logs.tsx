import { useState, useEffect } from "react";
import LogEntries, { LogEntry } from "../../components/Logs/LogEntries";
import { useCookies } from 'react-cookie';

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [cookies, setCookie, removeCookie] = useCookies();

  useEffect(() => {
    fetch("http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/admin/logs", {
      headers: {
        Authorization: `Bearer ${cookies.jwt}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <LogEntries entries={logs} />
    </div>
  );
};

export default LogsPage;
