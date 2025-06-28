import { Card, Progress, Typography, Space, Tag, List } from 'antd';
import { useLocation, useParams } from 'react-router-dom';

const { Text } = Typography;

export default function AssignmentResults() {
  const { sessionId } = useParams();
  const location = useLocation();
  const feedback = location.state?.gradedResult;

  if (!sessionId) return <div>Error: No session ID provided</div>;
  if (!feedback) return <div>No graded result found. Please re-submit the assignment.</div>;

  const scorePercentage = feedback.total_questions > 0
    ? Math.round((feedback.score / feedback.total_questions) * 100)
    : 0;

  return (
    <Card title="Your Results" style={{ margin: 16 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Text>Score: {feedback.score} / {feedback.total_questions}</Text>
        <Progress
          percent={scorePercentage}
          status="active"
          strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
        />

    <List
      itemLayout="vertical"
      size="large"
      dataSource={Object.entries(feedback.feedback)}
      renderItem={([qId, qFeedback]) => {
        const analysis = qFeedback.interaction_analysis || {};

        return (
          <List.Item key={qId}>
            <Card size="small">
              <Space direction="vertical">
                <Text strong>
                  Q: {qFeedback.question_text || qId}
                  {' '}
                  {qFeedback.correct ? (
                    <Tag color="green">Correct</Tag>
                  ) : (
                    <Tag color="red">Incorrect</Tag>
                  )}
                </Text>
                <Text>Your answer: {qFeedback.student_answer || 'Not answered'}</Text>
                {/* Removed time spent */}
                <Text>Hints used: {analysis.hints_used || 0}</Text>
              </Space>
            </Card>
          </List.Item>
        );
      }}
    />
      </Space>
    </Card>
  );
}
