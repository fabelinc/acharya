import React from 'react';
import { Typography, Button, Row, Col, Card, Space } from 'antd';
import { Link } from 'react-router-dom';
import './homescreen.css';

const { Title, Paragraph, Text } = Typography;

const features = [
  {
    title: 'Save Teaching Hours',
    description:
      'Generate assignments, quizzes, and chapter summaries in seconds. Spend more time teaching, less time preparing.',
  },
  {
    title: 'Socratic Student Guidance',
    description:
      'Instead of giving direct answers, our assistant asks probing questions — leading students to solve problems on their own.',
  },
  {
    title: 'Chapter Summaries for Revision',
    description:
      'Auto-generate crisp summaries of each chapter to help students revise more effectively before exams.',
  },
  {
    title: 'Real-Time Query Support',
    description:
      'Upload your notes and let AI handle routine student questions — 24/7 personalized support without the teacher burnout.',
  },
  {
    title: 'Human-in-the-Loop Oversight',
    description:
      'Teachers can review and refine AI-generated content — combining the efficiency of AI with the judgment of an educator.',
  },
  {
    title: 'Scalable Support for Every Learner',
    description:
      'Whether it’s one student or one hundred, Expl-AI-nly scales effortlessly to help each learner at their own pace.',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen py-12 bg-[var(--bg-light)]">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title className="edu-primary">Your AI-Powered Teaching Assistant</Title>
          <Paragraph className="text-lead max-w-2xl mx-auto">
            Aacharya empowers teachers and engages students — automating the busywork,
            guiding with smart questioning, and supporting revision with summaries.
          </Paragraph>
        </div>

        {/* Feature Grid */}
        <Row gutter={[24, 24]}>
          {features.map((feature, idx) => (
            <Col xs={24} sm={12} lg={8} key={idx}>
              <Card
                title={feature.title}
                bordered={false}
                className="hover:shadow-md edu-primary-border"
                style={{ minHeight: 220 }}
              >
                <Paragraph>{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Call to Action */}
        <div style={{ textAlign: 'center', marginTop: 64 }}>
          <Title level={2}>Try Aacharya Today</Title>
          <Paragraph className="text-lead mb-6">
            Experience the future of teaching — personalized, efficient, and teacher-friendly.
          </Paragraph>
          <Link to="/teacher/login">
            <Button
              type="primary"
              size="large"
              style={{ backgroundColor: 'var(--edu-primary)', borderColor: 'var(--edu-primary)' }}
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
