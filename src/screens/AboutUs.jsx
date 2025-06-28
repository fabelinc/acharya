// src/pages/AboutUs.jsx
import React from "react";
import { Typography, Row, Col, Card, Divider } from "antd";

const { Title, Paragraph, Text } = Typography;

const AboutUs = () => {
  return (
    <div style={{ padding: "3rem 1rem", maxWidth: 1000, margin: "0 auto" }}>
      <Typography>
        <Title level={2} style={{ color: "#1890ff" }}>
          About Us
        </Title>

        <Paragraph>
          We are on a mission to make high-quality education more efficient and accessible for teachers and students. Our platform provides an AI-powered <strong>Teaching Assistant</strong> that supports personalized learning, saves preparation time, and enhances classroom engagement.
        </Paragraph>

        <Paragraph>
          Designed with educators in mind, our tools help streamline repetitive tasks — from creating assignments to generating chapter summaries and guiding students step-by-step through problems using Socratic prompts.
        </Paragraph>

        <Divider />

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Card title="🧠 Smart Assistance" bordered={false}>
              <Text>
                AI answers student queries in real-time, guides them with hints, and promotes deeper understanding through thoughtful follow-ups.
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card title="⏳ Time-Saving Tools" bordered={false}>
              <Text>
                From assignment generation to grading and feedback, we help teachers focus on what matters most — teaching.
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card title="🎯 Personalized Learning" bordered={false}>
              <Text>
                Students learn at their pace, using probing questions and tailored hints, instead of being handed final answers immediately.
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card title="📚 Revision-Friendly" bordered={false}>
              <Text>
                Chapter summaries are auto-generated to support last-minute revision before exams, ensuring students stay confident and prepared.
              </Text>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Paragraph>
          Whether you're a middle school teacher or a coaching center instructor, our platform scales with your needs. We're just getting started, and we’re excited to build the future of education with you.
        </Paragraph>
        <Paragraph>
          <strong>Welcome to your new AI Teaching Assistant.</strong>
        </Paragraph>
      </Typography>
    </div>
  );
};

export default AboutUs;
