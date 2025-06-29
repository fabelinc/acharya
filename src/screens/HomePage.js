import React from 'react';
import { Typography, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import './homescreen.css';
import genAssignmentImg from '../Images/generate_assignment.png';
import hintsImg from '../Images/Hints2.png';
import dashboardImg from '../Images/Teacher dashboard.png';
import gradingImg from '../Images/Teacher Review.png';
import summarizerImg from '../Images/summarizer.png';
import chatbotImg from '../Images/chatbot.png';

const { Title, Paragraph } = Typography;

const features = [
  {
    title: '📝 Assignment Generator',
    description: `Say goodbye to hours spent crafting questions manually. With Aacharya’s Assignment Generator, simply upload your class notes or select the grade and subject — and our AI creates a complete assignment for you. Each question is tailored to the topic and difficulty you choose, making it easy to generate practice sheets, homework, or in-class tests with just a few clicks.`,
  },
  {
    title: '🧩 Interactive Hints',
    description: `Students often need just a nudge to get to the right answer. Aacharya’s unique Socratic Hint System gives them guiding prompts instead of final answers. When a student clicks “Show Hint,” they receive context-aware probing questions that encourage critical thinking and deeper learning — helping them become more independent problem-solvers.`,
  },
  {
    title: '📊 Teacher Dashboard',
    description: `Your time is valuable — and so is your insight. The Aacharya Teacher Dashboard consolidates all your student data in one place. View performance trends across assignments, track individual student progress, and identify where learners are struggling. Visualizations like bar charts, tables, and progress summaries make it easy to stay informed and take action.`,
  },
  {
    title: '✅ AI Grading + Manual Override',
    description: `Let AI do the first round of grading — from multiple choice to written answers — and save yourself hours of checking. You always stay in control: review AI-graded responses and override scores wherever needed. The interface is simple and intuitive, enabling a seamless blend of automation and educator oversight.`,
  },
  {
    title: '📚 Chapter Summarizer',
    description: `No more rephrasing long texts for students. Just paste a textbook paragraph or your own notes, and Aacharya generates a concise, structured summary. Perfect for revision sessions, class handouts, or even just simplifying complex material for easier understanding. It’s like having an academic editor built into your workflow.`,
  },
  {
    title: '🤖 AI Teaching Chatbot',
    description: `Imagine your students getting instant answers based on *your* teaching material — even when you’re offline. With the AI Teaching Chatbot, you can upload class notes, and students can ask questions directly through a conversational interface. The bot responds with relevant, accurate explanations rooted in your content — extending your support without adding to your workload.`,
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-light)] text-gray-800">
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

        {/* Feature Narratives (Long Scroll Format) */}
        <div className="space-y-24">
          {features.map((feature, idx) => (
            <Row key={idx} justify="center" className="px-4 md:px-12">
              <Col xs={24} md={18}>
                <Title level={3} className="edu-primary mb-3">{feature.title}</Title>
                <Paragraph className="text-lg">{feature.description}</Paragraph>
              </Col>
            </Row>
          ))}
        </div>

        {/* About Section */}
        <div id="about" className="mt-40 border-t pt-20 text-center">
          <Title level={2} className="edu-primary mb-6">About Aacharya</Title>
          <Paragraph className="text-lg max-w-3xl mx-auto mb-12">
            Aacharya is built for modern educators who want to combine the wisdom of traditional teaching with the efficiency of AI. Whether you manage a classroom or a coaching center, Aacharya adapts to your style and scales with your needs.
          </Paragraph>
          <Paragraph className="text-sm text-gray-500">
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