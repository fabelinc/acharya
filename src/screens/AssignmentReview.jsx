import { useEffect } from 'react';
import { Card, Button, Typography, List, Space, Tag, message, Avatar, Divider } from 'antd';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

export default function AssignmentReview() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.gradedResult;
  const backendURL = process.env.REACT_APP_BACKEND_URL;
  
  const teacherName = localStorage.getItem('teacherName') || 'your teacher';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!result) return <div>No result data found.</div>;

  const handleFinalSubmit = async () => {
    try {
      // Stub: send "notify teacher" request
      await fetch(`${backendURL}/api/v1/assignments/notify-teacher/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 'student123',
          summary: {
            score: result.score,
            total: result.total_questions
          }
        })
      });

      message.success("Shared with your teacher!");
      navigate(`/`);
    } catch (err) {
      message.error("Failed to notify teacher.");
    }
  };

  const handleBackToEdit = () => {
    navigate(`/student/assignment/${sessionId}`, {
      state: { restoreAnswers: true }  // Optional: handle this in AssignmentView
    });
  };

  return (
    <Card style={{ margin: 16 }}>
      <Title level={3}>Review Your Assignment</Title>

      {/* Teacher Section */}
      <Space align="center" style={{ marginBottom: 24 }}>
        <Avatar size="large" src={teacherName}>
          {teacherName[0]}
        </Avatar>
        <Text>Will be shared with <strong>Teacher {teacherName}</strong></Text>
      </Space>

      <Divider />

      {/* Feedback List */}
      <List
        itemLayout="vertical"
        dataSource={Object.entries(result.feedback)}
        renderItem={([qId, qFeedback]) => (
          <List.Item key={qId}>
            <Card size="small">
              <Space direction="vertical">
                <Text strong>Q: {qFeedback.question_text || qId}</Text>
                <Text>Your Answer: {qFeedback.student_answer || 'Not answered'}</Text>
              </Space>
            </Card>
          </List.Item>
        )}
      />

      {/* Buttons */}
      <Space direction="vertical" style={{ width: '100%', marginTop: 24 }}>
        <Button onClick={handleBackToEdit}>Go back and edit</Button>
        <Button type="primary" block onClick={handleFinalSubmit}>
          Share with Teacher
        </Button>
      </Space>
    </Card>
  );
}
