import React from 'react';
import { Typography, Button, Row, Col, Carousel } from 'antd';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './homescreen.css';

const { Title, Text, Paragraph } = Typography;

const heroSlides = [
  {
    image: require('../Images/Assignment.png'),
    caption: 'Generate Assignments in Seconds',
  },
  {
    image: require('../Images/Hints.jpg'),
    caption: 'Guide Students with Hints, Not Answers',
  },
  {
    image: require('../Images/AI Grading.jpg'),
    caption: 'Review submissions and AI generated grades',
  },
  {
    image: require('../Images/summary.png'),
    caption: 'Summarize chapters for students revision',
  },
];

const features = [
  {
    title: '📝 Assignment Generator',
    description: `Say goodbye to hours spent crafting questions manually. With Aacharya's Assignment Generator, simply upload your class notes or select the grade and subject — and our AI creates a complete assignment for you. Each question is tailored to the topic and difficulty you choose, making it easy to generate practice sheets, homework, or in-class tests with just a few clicks.`,
  },
  {
    title: '🧩 Interactive Hints',
    description: `Students often need just a nudge to get to the right answer. Aacharya's unique Socratic Hint System gives them guiding prompts instead of final answers. When a student clicks "Show Hint," they receive context-aware probing questions that encourage critical thinking and deeper learning — helping them become more independent problem-solvers.`,
  },
  {
    title: '📊 Teacher Dashboard',
    description: `Your time is valuable — and so is your insight. The Aacharya Teacher Dashboard consolidates all your student data in one place. View performance trends across assignments, track individual student progress, and identify where learners are struggling. Visualizations like bar charts, tables, and progress summaries make it easy to stay informed and take action.The Aacharya Teacher Dashboard consolidates all your student data in one place. View trends, track progress, and identify learning gaps quickly.`,
  },
  {
    title: '✅ AI Grading + Manual Override',
    description: `Let AI do the first round of grading — from multiple choice to written answers — and save yourself hours of checking. You always stay in control: review AI-graded responses and override scores wherever needed. The interface is simple and intuitive, enabling a seamless blend of automation and educator oversight.et AI do the first round of grading and save yourself hours of checking. Override scores wherever needed — blending automation and educator oversight.`,
  },
  {
    title: '📚 Chapter Summarizer',
    description: `PastNo more rephrasing long texts for students. Just paste a textbook paragraph or your own notes, and Aacharya generates a concise, structured summary. Perfect for revision sessions, class handouts, or even just simplifying complex material for easier understanding. It's like having an academic editor built into your workflow.e a textbook paragraph or your own notes, and Aacharya generates a concise, structured summary for revision or handouts.`,
  },
  {
    title: '🤖 AI Teaching Chatbot',
    description: `StudentImagine your students getting instant answers based on *your* teaching material — even when you're offline. With the AI Teaching Chatbot, you can upload class notes, and students can ask questions directly through a conversational interface. The bot responds with relevant, accurate explanations rooted in your content — extending your support without adding to your workload.s get instant answers based on your teaching material. The bot responds with accurate, relevant explanations rooted in your content.`,
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <div className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title className="text-5xl font-bold text-edu-primary mb-4 leading-tight">
            Aacharya: Your AI-Powered Teaching Assistant
          </Title>
          <Paragraph className="text-xl text-gray-600 max-w-2xl mx-auto mt-4">
            Save time, support every student, and scale your teaching — all with the power of AI.
          </Paragraph>
          <motion.div
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link to="/teacher/login">
              <Button
                type="primary"
                size="large"
                className="bg-edu-primary border-none text-white hover:bg-edu-primary-dark shadow-lg px-8 py-3 rounded-2xl transition-all duration-300"
              >
                Get Started
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Carousel Section */}
        <motion.div
          className="rounded-2xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Carousel autoplay effect="fade" dots>
            {heroSlides.map((slide, index) => (
              <div key={index} className="relative bg-black w-full">
                <div className="w-full h-[220px] sm:h-[320px] md:h-[450px] lg:h-[500px] flex items-center justify-center">
                  <img
                    src={slide.image}
                    alt={slide.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full px-4 max-w-md text-center">
                  <div className="bg-black bg-opacity-60 px-4 py-2 rounded-md shadow-md">
                    <Title
                      level={4}
                      className="text-white text-sm sm:text-base md:text-lg font-medium m-0"
                    >
                      {slide.caption}
                    </Title>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </motion.div>


        {/* Features */}
        <div className="mt-24 space-y-32">
          {features.map((feature, idx) => (
            <Row key={idx} justify="center" className="px-4 md:px-12">
              <Col xs={24} md={18} className="text-center md:text-left animate-fade-in">
                <Title level={3} className="text-3xl text-edu-primary font-semibold mb-3">{feature.title}</Title>
                <Paragraph className="text-lg text-gray-700 leading-relaxed">{feature.description}</Paragraph>
              </Col>
            </Row>
          ))}
        </div>

       
        {/* About */}
        <section className="mt-32 pt-20 border-t animate-fade-in">
          <Title level={2} className="text-center text-edu-primary mb-6">About Aacharya</Title>
          <Paragraph className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-6">
            Aacharya combines the wisdom of traditional teaching with the efficiency of AI. Whether you manage a classroom or a coaching center, it adapts to your style and scales with your needs.
          </Paragraph>
          <Paragraph className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Aacharya EdTech. All rights reserved.
          </Paragraph>
        </section>

        <section className="mt-24 pt-20 border-t animate-fade-in">
          <Title level={2} className="text-center text-edu-primary mb-6">About Us</Title>
          <Paragraph className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-6">
          We are on a mission to make high-quality education more efficient and accessible for teachers and students. Our platform provides an AI-powered <strong>Teaching Assistant</strong> that supports personalized learning, saves preparation time, and enhances classroom engagement.
          </Paragraph>
          <Paragraph className="text-center text-sm text-gray-500">
          Whether you're a middle school teacher or a coaching center instructor, our platform scales with your needs. We're just getting started, and we’re excited to build the future of education with you.
        </Paragraph>
        <Paragraph className="text-center text-sm text-gray-500">
            Based in India and the U.S., we co-create smarter classrooms with educators across the globe.
          </Paragraph>

        </section>
      </div>
    </div>
  );
};

export default LandingPage;
