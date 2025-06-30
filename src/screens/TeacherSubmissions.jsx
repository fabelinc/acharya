// TeacherSubmissions.jsx
import React, { useState, useEffect } from "react";
import { Table, Input, Button, message, Typography, Space, Collapse } from "antd";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const { Title } = Typography;
const { Panel } = Collapse;
const backendURL = process.env.REACT_APP_BACKEND_URL;

const formatDate = (dateString) => {
  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

const TeacherSubmissions = () => {
  const [sessionId, setSessionId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionIdFromURL = params.get("sessionId");
  
    if (sessionIdFromURL) {
      setSessionId(sessionIdFromURL);
      fetchSubmissions(sessionIdFromURL);
    }
  }, [location.search]);

  const fetchSubmissions = async (overrideSessionId) => {
    const idToUse = overrideSessionId || sessionId;
  
    if (!idToUse) {
      message.warning("Please enter a session ID");
      return;
    }
  
    setLoading(true);
    try {
      const res = await axios.get(`${backendURL}/api/v1/assignments/teacher/allsubmissions/${idToUse}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Student ID",
      dataIndex: "student_id",
      key: "student_id",
    },
    {
      title: "Score",
      key: "score",
      render: (_, record) => `${record.score} / ${record.total_questions}`,
    },
    {
      title: "Submitted At",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: formatDate,
    },
   
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/teacher/submission/${record.submission_id}`, {
            state: { from: `/teacher/submissions?sessionId=${sessionId}` }
          })}
        >
          Review
        </Button>
      ),
    }
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={3}>Teacher Submissions Dashboard</Title>

      <Space style={{ marginBottom: 20 }}>
        <Input
          placeholder="Enter Session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          style={{ width: 300 }}
        />
       <Button type="primary" onClick={() => fetchSubmissions()} loading={loading}>
          Load Submissions
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={submissions}
        rowKey={(record) => record.submission_id}
        
      />
    </div>
  );
};

export default TeacherSubmissions;
