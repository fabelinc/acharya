// pages/Teacher/ReviewSubmission.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Typography,
  Space,
  Button,
  Input,
  message,
  Divider,
  Tag,
} from "antd";
import axios from "axios";

const { Title, Text } = Typography;
const backendURL = process.env.REACT_APP_BACKEND_URL;

export default function ReviewSubmission() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [overrideScore, setOverrideScore] = useState(null);
  const location = useLocation();

  useEffect(() => {
    console.log("Location state:", location.state);
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/v1/assignments/teacher/submission-detail/${submissionId}`);
        setSubmission(res.data);
      } catch (err) {
        message.error("Failed to load submission");
      }
    };
    fetchData();
  }, [location.state , submissionId]);

  const handleOverrideSubmit = async () => {
    message.success("Score override saved and student notified! (stub)");
    navigate("/teacher/submissions");
  };

  if (!submission) return <div>Loading...</div>;

  return (
    <Card style={{ maxWidth: 900, margin: "auto", marginTop: 24 }}>
      <Title level={3}>Review Submission</Title>
      <Text strong>Student ID:</Text> {submission.student_id} <br />
      <Text strong>Assignment:</Text> {submission.assignment_title} <br />
      <Text strong>Submitted At:</Text> {new Date(submission.submitted_at).toLocaleString()} <br />
      <Divider />

      {submission.questions.map((q) => {
        const answer = submission.answers[q.id] || "Not answered";
        const interaction = submission.interactions[q.id] || {};
        return (
          <Card key={q.id} style={{ marginBottom: 16 }} size="small">
            <Space direction="vertical">
              <Text strong>Q:</Text> <Text>{q.text}</Text>
              <Text strong>Expected:</Text> <Text>{q.answer}</Text>
              <Text strong>Student Answer:</Text>{" "}
              <Text type={answer === q.answer ? "success" : "danger"}>{answer}</Text>
              <Text>Hints Used: {interaction.hints_used ?? 0}</Text>
              {/* <Text>Time Spent: {submission.time_spent[q.id] ?? 0} sec</Text> */}
            </Space>
          </Card>
        );
      })}

      <Divider />

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Text strong>AI Score:</Text> <Tag color="blue">{submission.ai_score}</Tag>
        <Text strong>Override Score (optional):</Text>
        <Input
          style={{ width: 120 }}
          placeholder="e.g. 3"
          type="number"
          value={overrideScore}
          onChange={(e) => setOverrideScore(e.target.value)}
        />
        {/* <Button type="primary" onClick={handleOverrideSubmit}>
          Confirm & Notify Student
        </Button> */}
        <Button
          onClick={() =>
            navigate(location.state?.from || "/teachers", {
              state: {
                activeTab: location.state?.activeTab || "dashboard",
                sessionId: location.state?.sessionId || ""
              }
            })
          }
          type="default"
        >
          Go Back
        </Button>
      </Space>
    </Card>
  );
}
