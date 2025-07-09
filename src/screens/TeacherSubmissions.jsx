import React, { useState, useEffect } from "react";
import { Table, Input, Button, message, Typography, Space, Select } from "antd";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const { Title } = Typography;
const backendURL = process.env.REACT_APP_BACKEND_URL;
const { Option } = Select;

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

const TeacherSubmissions = ({ sessionIdOverride }) => {
  const [sessionId, setSessionId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");

  // ✅ Load from query param or sessionIdOverride
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionIdFromURL = params.get("sessionId");

    if (sessionIdOverride) {
      setSessionId(sessionIdOverride);
      fetchSubmissions(sessionIdOverride);
    } else if (sessionIdFromURL) {
      setSessionId(sessionIdFromURL);
      fetchSubmissions(sessionIdFromURL);
    }
  }, [location.search, sessionIdOverride]);

  useEffect(() => {
    console.log("Teacher ID from localStorage:", localStorage.getItem('teacherId'));
    axios.get(`${backendURL}/api/v1/assignments/teacher/list`, {
      params: { teacher_id: "586fb175-5e4a-4afa-a7bd-2bbe3cec18e6" }
    }).then(res => {
      console.log("Fetched assignments:", res.data); // ✅ Confirm this shows data
      setAssignments(res.data);
    }).catch(err => {
      console.error("Failed to fetch assignments", err);
    });
  }, []);

  const fetchSubmissions = async (overrideId) => {
    const idToUse = overrideId || sessionId;
  
    if (!idToUse) {
      message.warning("Please select an assignment");
      return;
    }
  
    setLoading(true);
    setSubmissions([]); // ✅ clear old data immediately
  
    try {
      const res = await axios.get(`${backendURL}/api/v1/assignments/teacher/allsubmissions/${idToUse}`);
      setSubmissions(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("No submissions found for this assignment."); // optional: use a readable error
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
          onClick={() =>
            navigate(`/teacher/submission/${record.submission_id}`, {
              state: {
                from: `/teachers`,
                activeTab: "submissions",
                sessionId,
              },
            })
          }
        >
          Review
        </Button>
      ),
    }
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={3}>Teacher Submissions Dashboard</Title>

      <Space style={{ marginBottom: 20 }} wrap>
      <Select
        style={{ width: 400 }}
        placeholder="Select Assignment by Title"
        value={sessionId || undefined}
        onChange={(value) => {
          setSessionId(value);
          fetchSubmissions(value);
        }}
      >
        {assignments.map((assignment) => (
          <Option key={assignment.id} value={assignment.id}>
            {assignment.title}
          </Option>
        ))}
      </Select>

        <Button type="primary" onClick={() => fetchSubmissions()} loading={loading}>
          Load Submissions
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={submissions}
        rowKey={(record) => record.submission_id}
        pagination={{ pageSize: 6 }}
      />
    </div>
  );
};

export default TeacherSubmissions;
