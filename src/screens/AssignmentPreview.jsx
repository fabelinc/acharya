import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Typography, 
  message, 
  Space, 
  List 
} from 'antd';
import { CopyOutlined, LinkOutlined } from '@ant-design/icons';

const { Text, Title, Link } = Typography;
const backendURL = process.env.REACT_APP_BACKEND_URL;

export default function AssignmentPreview() {
  const { assignmentId } = useParams();
  const location = useLocation();
  const { title, subject, questions } = location.state || {};

  const [sessionId, setSessionId] = useState('');
  const [shareableLink, setShareableLink] = useState('');

  if (!assignmentId) {
    return <Text type="danger">Error: No assignment ID provided</Text>;
  }

  const handlePublish = async () => {
    try {
      const res = await fetch(`${backendURL}/api/v1/assignments/publish/${assignmentId}`, {
        method: 'POST',
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setShareableLink(`${window.location.origin}/student/assignment/${data.session_id}`);
      message.success('Assignment published!');
    } catch (error) {
      message.error('Publishing failed');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    message.success('Link copied!');
  };

  return (
    <Card title="Assignment Ready!" style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
      {title && questions && (
        <>
          <Title level={4}>{title}</Title>
          <Text strong>Subject: </Text> {subject} <br /><br />
          <Text strong>Questions:</Text>
          <List
            bordered
            dataSource={questions}
            renderItem={(q, idx) => (
              <List.Item>
                <strong>Q{idx + 1}:</strong> {q.text}
              </List.Item>
            )}
            style={{ marginTop: 16 }}
          />
        </>
      )}

      <div style={{ marginTop: 32 }}>
        {!sessionId ? (
          <Button 
            type="primary" 
            onClick={handlePublish}
            style={{ backgroundColor: '#52c41a' }}
          >
            Publish Assignment
          </Button>
        ) : (
          <Space direction="vertical" style={{ marginTop: 16 }}>
            <Text>Share this link with students:</Text>
            <Space>
              <Link 
                href={shareableLink} 
                target="_blank"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <LinkOutlined style={{ marginRight: 4 }} />
                {shareableLink}
              </Link>
              <Button 
                icon={<CopyOutlined />} 
                size="small" 
                onClick={copyToClipboard}
              />
            </Space>
          </Space>
        )}
      </div>
    </Card>
  );
}
