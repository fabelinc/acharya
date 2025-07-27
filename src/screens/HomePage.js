import React from 'react';
import { Typography, Button, Carousel, Card } from 'antd';
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
    title: 'Assignment Generator',
    icon: '🗒️',
    description: `Say goodbye to hours spent crafting questions manually. With Aacharya's Assignment Generator, simply upload your class notes or select the grade and subject — and our AI creates a complete assignment for you.`,
    highlight: 'Generate practice sheets, homework, or in-class tests with just a few clicks.'
  },
  {
    title: 'Interactive Hints',
    icon: '🪄',
    description: `Students often need just a nudge to get to the right answer. Aacharya's unique Socratic Hint System gives them guiding prompts instead of final answers.`,
    highlight: 'Encourage critical thinking and deeper learning with context-aware probing questions.'
  },
  {
    title: 'Teacher Dashboard',
    icon: '📈',
    description: `Your time is valuable — and so is your insight. The Aacharya Teacher Dashboard consolidates all your student data in one place.`,
    highlight: 'View performance trends, track progress, and identify learning gaps quickly.'
  },
  {
    title: 'AI Grading',
    icon: '📋',
    description: `Let AI do the first round of grading — from multiple choice to written answers — and save yourself hours of checking.`,
    highlight: 'Review AI-graded responses and override scores with our intuitive interface.'
  },
  {
    title: 'Chapter Summarizer',
    icon: '📚',
    description: `No more rephrasing long texts for students. Just paste a textbook paragraph or your own notes, and Aacharya generates a concise, structured summary.`,
    highlight: 'Perfect for revision sessions, class handouts, or simplifying complex material.'
  },
  {
    title: 'AI Teaching Chatbot',
    icon: '🤖',
    description: `Imagine your students getting instant answers based on *your* teaching material — even when you're offline.`,
    highlight: 'The bot responds with accurate, relevant explanations rooted in your content.'
  },
];

const testimonials = [
  {
    quote: "Aacharya has cut my prep time in half while making my assignments more effective.",
    author: "Sarah K., High School Math Teacher"
  },
  {
    quote: "The hint system has transformed how my students approach problems - they're thinking more critically now.",
    author: "David P., Physics Tutor"
  },
  {
    quote: "Finally an AI tool that actually understands what teachers need in their workflow.",
    author: "Maria L., Elementary School Teacher"
  }
];

const LandingPage = () => {
  return (
    <div className="full-width center-content">
      {/* Hero Section */}
      <section className="full-width bg-gradient-to-br from-blue-50 to-indigo-50 section-spacing">
        <div className="max-w-content mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Title className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Your AI-Powered Teaching Assistant
            </Title>
            
            <Paragraph className="text-xl text-gray-600 mb-10">
              Save time, support every student, and scale your teaching — all with the power of AI.
            </Paragraph>

            <motion.div
              className="mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link to="/teacher/login">
                <Button
                  type="primary"
                  size="large"
                  className="h-12 px-8 text-lg font-medium bg-blue-600 hover:bg-blue-700 border-none shadow-lg"
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-16"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Carousel autoplay effect="fade" dots className="aacharya-carousel">
              {heroSlides.map((slide, index) => (
                <div key={index} className="carousel-slide-container">
                  <img
                    src={slide.image}
                    alt={slide.caption}
                    className="carousel-image"
                  />
                </div>
              ))}
            </Carousel>
          </motion.div>
        </div>
      </section>
      
      <div className="section-gap"></div>

     {/* Features Section */}
        <section className="full-width bg-gray-50 section-spacing">
          <div className="max-w-content mx-auto">
            <div className="text-center mb-16">
              
              <Title level={2} className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Teaching Is Hard — And How Aacharya Helps
              </Title>
              <Paragraph className="text-xl text-gray-600">
              Explore common educator pain points and how Aacharya transforms the experience.
              </Paragraph>
            </div>

            <div className="problem-solution-grid">
              {/* Problem 1 - Assignment Creation */}
              <div className="problem-card">
              <div className="problem-icon">⏳</div> {/* Hourglass icon */}
                <Title level={3} className="text-xl font-semibold mb-3 text-red-600">
                  Time-Consuming Assignment Creation
                </Title>
                <Paragraph className="text-gray-700">
                  Teachers spend hours creating assignments manually, often reusing old materials that may not match current needs.
                </Paragraph>
              </div>
              <div className="solution-card">
                <div className="feature-icon">⚡</div>
                <Title level={3} className="text-xl font-semibold mb-3 text-green-600">
                  AI-Powered Assignment Generator
                </Title>
                <Paragraph className="text-gray-700">
                  Generate fresh, tailored assignments in seconds by simply uploading your notes or selecting grade/subject.
                </Paragraph>
              </div>

              {/* Problem 2 - Student Guidance */}
              <div className="problem-card">
              <div className="problem-icon">❓</div> {/* Hourglass icon */}
                <Title level={3} className="text-xl font-semibold mb-3 text-red-600">
                  Students Stuck Without Guidance
                </Title>
                <Paragraph className="text-gray-700">
                  Students often get stuck on problems but don't get immediate help, leading to frustration and disengagement.
                </Paragraph>
              </div>
              <div className="solution-card">
                <div className="feature-icon">💡</div>
                <Title level={3} className="text-xl font-semibold mb-3 text-green-600">
                  Interactive Hint System
                </Title>
                <Paragraph className="text-gray-700">
                  Our Socratic hints guide students with probing questions instead of answers, promoting critical thinking.
                </Paragraph>
              </div>

              {/* Problem 3 - Grading */}
              <div className="problem-card">
              <div className="problem-icon">✍️</div> {/* Hourglass icon */}
                <Title level={3} className="text-xl font-semibold mb-3 text-red-600">
                  Grading Takes Hours
                </Title>
                <Paragraph className="text-gray-700">
                  Manual grading consumes valuable time that could be spent on lesson planning or student interaction.
                </Paragraph>
              </div>
              <div className="solution-card">
                <div className="feature-icon">✅</div>
                <Title level={3} className="text-xl font-semibold mb-3 text-green-600">
                  AI-Assisted Grading
                </Title>
                <Paragraph className="text-gray-700">
                  AI handles first-pass grading while you maintain final control, saving hours each week.
                </Paragraph>
              </div>

              {/* Problem 4 - Chapter Summarization */}
              <div className="problem-card">
              <div className="problem-icon">📖</div> {/* Hourglass icon */}
                <Title level={3} className="text-xl font-semibold mb-3 text-red-600">
                Last-Minute Chapter Revision Before Exams
                </Title>
                <Paragraph className="text-gray-700">
                Students struggle to review entire chapters before tests, often missing key concepts while cramming.
                </Paragraph>
              </div>
              <div className="solution-card">
              <div className="feature-icon">📝</div>
                <Title level={3} className="text-xl font-semibold mb-3 text-green-600">
                Exam-Focused Chapter Summaries
                </Title>
                <Paragraph className="text-gray-700">
                Instantly generates concise revision sheets highlighting must-know concepts, definitions, and diagrams from any chapter.
                </Paragraph>
              </div>

              {/* Problem 5 - Teaching Chatbot */}
              <div className="problem-card">
              <div className="problem-icon">🕒</div> {/* Hourglass icon */}
                <Title level={3} className="text-xl font-semibold mb-3 text-red-600">
                  Limited After-Hours Support
                </Title>
                <Paragraph className="text-gray-700">
                  Students need help outside class hours but teachers can't be available 24/7.
                </Paragraph>
              </div>
              <div className="solution-card">
                <div className="feature-icon">🤖</div>
                <Title level={3} className="text-xl font-semibold mb-3 text-green-600">
                  AI Teaching Assistant Chatbot
                </Title>
                <Paragraph className="text-gray-700">
                  Students get instant, accurate answers based on your teaching materials, even when you're offline.
                </Paragraph>
              </div>

              {/* Problem 6 - Performance Tracking */}
              <div className="problem-card">
              <div className="problem-icon">👥</div> {/* Hourglass icon */}
                <Title level={3} className="text-xl font-semibold mb-3 text-red-600">
                Limited Personalized Attention
                </Title>
                <Paragraph className="text-gray-700">
                Teachers struggle to identify individual student weaknesses and provide tailored support at scale.
                </Paragraph>
              </div>
              <div className="solution-card">
                <div className="feature-icon">📊</div>
                <Title level={3} className="text-xl font-semibold mb-3 text-green-600">
                Student Learning Insights
                </Title>
                <Paragraph className="text-gray-700">
                Tracks each student's attempts, hint usage, and patterns to highlight exactly where they need help - enabling targeted teaching.
                </Paragraph>
              </div>
            </div>
          </div>
        </section>
        <div className="section-gap"></div>

     {/* Testimonials Section */}
<section className="full-width bg-white section-spacing">
  <div className="max-w-content mx-auto">
    <div className="text-center mb-16">
      <Title level={2} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        What Educators Are Saying
      </Title>
      <Paragraph className="text-xl text-gray-600">
        Hear from teachers using Aacharya in their classrooms
      </Paragraph>
    </div>

    <div className="testimonial-grid">
      {/* Testimonial 1 */}
      <div className="testimonial-card">
        <div className="testimonial-quote">"</div>
        <p className="testimonial-content">
          Aacharya has cut my prep time in half while making my assignments more effective. The AI grading saves me 10+ hours weekly.
        </p>
        <p className="testimonial-author">High School Math Teacher</p>
      </div>

      {/* Testimonial 2 */}
      <div className="testimonial-card">
        <div className="testimonial-quote">"</div>
        <p className="testimonial-content">
          The hint system has transformed how my students approach problems - they're thinking more critically now instead of just asking for answers.
        </p>
        <p className="testimonial-author">Physics Tutor</p>
      </div>

      {/* Testimonial 3 */}
      <div className="testimonial-card">
        <div className="testimonial-quote">"</div>
        <p className="testimonial-content">
          My students love the chapter summaries for exam prep. The AI chatbot has also dramatically reduced 'when is this due?' questions.
        </p>
        <p className="testimonial-author">Elementary School Teacher</p>
      </div>
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="ctagrid full-width bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-content text-center">
          <Title level={2} className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to transform your teaching?
          </Title>
          <Paragraph className="text-xl text-blue-100 mb-10">
            Join thousands of educators using Aacharya to save time and enhance student learning.
          </Paragraph>
          <Link to="/teacher/login">
            <Button
              type="primary"
              size="large"
              className="h-12 px-8 text-lg font-medium bg-white text-blue-600 hover:bg-gray-100 border-none shadow-lg"
            >
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    
    </div>
  );
};

export default LandingPage;