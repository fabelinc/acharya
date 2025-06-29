import React from 'react';
import { Typography, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import './homescreen.css';
import genAssignmentImg from '..generate_assignment.png';
import hintsImg from '..Hints2.png';
import dashboardImg from '..Teacher dashboard.png';
import reviewImg from '..Teacher Review.png';
import summaryImg from '..summarizer.png';
import chatbotImg from '..chatbot.png';

const { Title, Paragraph } = Typography;

const features = [
  {
    id: 'assignment-generator',
    title: '📝 Assignment Generator',
    description:
      'Upload your material or select grade and topic — instantly get a ready-to-use assignment with AI-generated questions.',
    image: genAssignmentImg,
  },
  {
    id: 'interactive-hints',
    title: '🧩 Interactive Hints',
    description:
      'Students receive probing questions instead of answers. Clicking “Show Hint” guides them step-by-step.',
    image: hintsImg,
  },
  {
    id: 'teacher-dashboard',
    title: '📊 Teacher Dashboard',
    description:
      'Track performance metrics, grading status, and student progress with visual dashboards and summaries.',
    image: dashboardImg,
  },
  {
    id: 'grading-override',
    title: '✅ Grading + Override',
    description:
      'AI evaluates student submissions. Teachers can review and override scores with a single click.',
    image: reviewImg,
  },
  {
    id: 'chapter-summarizer',
    title: '📚 Chapter Summarizer',
    description:
      'Turn long paragraphs into concise summaries — perfect for quick student revision or topic introductions.',
    image: summaryImg,
  },
  {
    id: 'ai-chatbot',
    title: '🤖 AI Teaching Chatbot',
    description:
      'Students can ask questions based on teacher-uploaded notes. The chatbot provides relevant, contextual answers.',
    image: chatbotImg,
  },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-light)] text-gray-800 relative">
      <div className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <Title className="edu-primary mb-4">Aacharya: Your AI-Powered Teaching Assistant</Title>
          <Paragraph className="text-lead max-w-2xl mx-auto">
            Save time, support every student, and scale your teaching — all with the power of AI.
          </Paragraph>
          <div className="mt-8">
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

        {/* Feature Sections */}
        {features.map((feature, idx) => (
          <Row
            id={feature.id}
            gutter={[32, 64]}
            align="middle"
            key={idx}
            className="feature-section py-24"
            style={{
              flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
            }}
          >
            <Col xs={24} md={12}>
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full rounded-lg shadow-md"
                style={{ maxHeight: 400, objectFit: 'contain' }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Title level={3} className="edu-primary mb-3">{feature.title}</Title>
              <Paragraph className="text-lg">{feature.description}</Paragraph>
            </Col>
          </Row>
        ))}

        {/* About Aacharya */}
        <div id="about" className="mt-32 border-t pt-20">
          <Title level={2} className="text-center edu-primary mb-6">About Aacharya</Title>
          <Paragraph className="text-center text-lg max-w-3xl mx-auto mb-12">
            Aacharya is built for modern educators who want to combine the wisdom of traditional teaching
            with the power of artificial intelligence. Whether you run a classroom or a coaching center,
            Aacharya scales with your vision and adapts to your style.
          </Paragraph>
          <Paragraph className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Aacharya EdTech. All rights reserved.
          </Paragraph>
        </div>
        {/* About Us Section */}
        <div id="about-us" className="mt-32 pt-20 border-t">
          <Title level={2} className="text-center edu-primary mb-6">About Us</Title>
          <Paragraph className="text-center text-lg max-w-3xl mx-auto mb-8">
            We’re a passionate team of educators, developers, and AI researchers building the future of teaching.
            Our mission is to empower teachers with tools that save time, deepen engagement, and scale their impact.
          </Paragraph>
          <Paragraph className="text-center text-sm text-gray-500">
            Based in India and the U.S., we work closely with coaching centers and schools to co-create smarter classrooms.
          </Paragraph>
        </div>
      </div>
    </div>
  );
};
export default LandingPage;