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
    description: `No more rephrasing long texts for students. Just paste a textbook paragraph or your own notes, and Aacharya generates a concise, structured summary. Perfect for revision sessions, class handouts, or even just simplifying complex material for easier understanding. It's like having an academic editor built into your workflow.e a textbook paragraph or your own notes, and Aacharya generates a concise, structured summary for revision or handouts.`,
  },
  {
    title: '🤖 AI Teaching Chatbot',
    description: `Imagine your students getting instant answers based on *your* teaching material — even when you're offline. With the AI Teaching Chatbot, you can upload class notes, and students can ask questions directly through a conversational interface. The bot responds with relevant, accurate explanations rooted in your content — extending your support without adding to your workload.s get instant answers based on your teaching material. The bot responds with accurate, relevant explanations rooted in your content.`,
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-20">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title className="text-3xl sm:text-5xl font-semibold text-edu-primary dark:text-edu-primary mb-6 leading-tight tracking-tight">
            Aacharya: Your AI-Powered Teaching Assistant
          </Title>

          <Paragraph className="text-base sm:text-xl text-gray-600 dark:text-gray-300 font-light leading-relaxed tracking-wide max-w-2xl mx-auto mt-4">
            Save time, support every student, and scale your teaching — all with the power of AI.
          </Paragraph>

          <Paragraph className="text-sm sm:text-lg text-gray-700 dark:text-gray-400 font-light leading-relaxed tracking-wide max-w-3xl mx-auto mt-6">
          Aacharya helps modern educators generate assignments, deliver guided hints, grade responses, and track student performance — all from one streamlined interface.
          Whether you're in a classroom, tutoring center, or online program, Aacharya adapts to your style and scales with your needs.
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
                className="bg-edu-primary border-none text-white hover:bg-edu-primary-dark shadow-lg px-8 py-3 rounded-xl text-base font-medium tracking-wide"
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
                <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
                  <img src={slide.image} alt={slide.caption} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full px-4 max-w-xs sm:max-w-md text-center">
                  <div className="bg-black bg-opacity-60 px-4 py-2 rounded-md shadow-md">
                    <Title level={4} className="text-white text-sm sm:text-base md:text-lg font-medium m-0">
                      {slide.caption}
                    </Title>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </motion.div>

        {/* Features */}
        <div className="mt-24 space-y-20 sm:space-y-24">
          {features.map((feature, idx) => (
            <Row key={idx} justify="center" className="px-4 md:px-12">
              <Col xs={24} md={20} lg={18} className="text-center md:text-left animate-fade-in">
                <Title
                  level={3}
                  className="text-xl sm:text-2xl lg:text-3xl font-medium text-edu-primary dark:text-edu-primary tracking-tight mb-3"
                >
                  {feature.title}
                </Title>
                <Paragraph className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-light leading-relaxed tracking-wide">
                  {feature.description}
                </Paragraph>
              </Col>
            </Row>
          ))}
        </div>

        {/* About Section */}
        <section className="mt-32 pt-20 border-t dark:border-gray-700 animate-fade-in">
          <Title level={2} className="text-center text-edu-primary dark:text-edu-primary font-semibold mb-6">
            About Us
          </Title>

          <Paragraph className="text-base text-gray-700 dark:text-gray-300 font-light leading-relaxed text-center max-w-3xl mx-auto mb-6">
            We’re building smarter classrooms for every educator. Aacharya saves prep time, supports students, and boosts engagement — all with AI-powered tools.
          </Paragraph>

          <Paragraph className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Whether you're in school or at a coaching center, Aacharya scales with you. We're excited to help shape the future of learning.
          </Paragraph>

          <Paragraph className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Based in India and the U.S., we collaborate globally with passionate teachers.
          </Paragraph>

          <Paragraph className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
            © {new Date().getFullYear()} Aacharya EdTech. All rights reserved.
          </Paragraph>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;