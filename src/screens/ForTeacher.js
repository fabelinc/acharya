import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Menu, Layout, Row, Col, Card, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import TeacherSubmissions from './TeacherSubmissions';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const teacherName = localStorage.getItem('teacherName');

  const logout = useCallback(() => {
    localStorage.removeItem('teacherToken');
    navigate('/teacher/login');
  }, [navigate]);

  const actionCards = [
    {
      title: 'Create Assignments',
      description: 'Create AI-based assignments in seconds',
      link: '/assignments/generate',
    },
    {
      title: 'Summarizer',
      description: 'Summarize long notes to help with revisions',
      link: '/summarize',
    },
    {
      title: 'Generate Quiz',
      description: 'Generate automated quizzes from your notes or topic',
      link: '/quiz',
    },
    {
      title: 'Create Chatbot',
      description: 'Upload notes and let AI answer student questions in real time.',
      link: '/assistant',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
          Welcome, {teacherName ? teacherName : 'Teacher'}!
          </Title>
          <Button type="primary" icon={<LogoutOutlined />} danger onClick={logout}>
            Logout
          </Button>
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Paragraph>Your AI-powered teaching assistant to help you teach smarter, not harder.</Paragraph>

        <Menu
          mode="horizontal"
          selectedKeys={[String(activeTab)]}
          onClick={(e) => setActiveTab(Number(e.key))}
          style={{ marginBottom: 24 }}
        >
          <Menu.Item key="0">Dashboard</Menu.Item>
          <Menu.Item key="1">Submissions</Menu.Item>
          <Menu.Item key="2">Analytics</Menu.Item>
        </Menu>

        {activeTab === 0 && (
          <div>
            <Title level={4}>Quick Actions</Title>
            <Row gutter={[16, 16]}>
              {actionCards.map((card, idx) => (
                <Col xs={24} sm={12} key={idx}>
                  <Link to={card.link}>
                    <Card title={card.title} hoverable>
                      {card.description}
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {activeTab === 1 && (
          <div>
            <TeacherSubmissions />
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <Title level={4}>Analytics (Coming Soon)</Title>
          </div>
        )}
      </Content>
    </Layout>
  );
}
