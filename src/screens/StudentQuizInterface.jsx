import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Radio,
  Space,
  Alert,
  Typography,
  Divider,
  Progress,
  Spin,
  Input,
  Tag,
  Row,
  Col,
  Statistic,
  List,
  Collapse,
  Modal
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const backendURL = process.env.REACT_APP_BACKEND_URL;

const StudentQuizInterface = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timestamps, setTimestamps] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeStarted, setTimeStarted] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Load quiz and initialize
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizRes = await axios.get(`${backendURL}/api/v1/quiz-grading/session/${sessionId}`);
        
        setQuiz(quizRes.data);
        setTimeRemaining(quizRes.data.time_limit || 1800);
        initializeTimestamps(quizRes.data.questions);
        setTimeStarted(new Date());
        
        const savedProgress = localStorage.getItem(`quiz_progress_${sessionId}`);
        if (savedProgress) {
          const { answers: savedAnswers, timestamps: savedTimestamps, 
                  timeRemaining: savedTime, currentIndex, skipped } = JSON.parse(savedProgress);
          setAnswers(savedAnswers);
          setTimestamps(savedTimestamps);
          setTimeRemaining(savedTime);
          setCurrentQuestionIndex(currentIndex);
          setSkippedQuestions(new Set(skipped));
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load quiz');
        console.error('Error loading quiz:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [sessionId]);

  // Timer system
  useEffect(() => {
    if (!timeStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          autoSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeStarted, isSubmitted]);

  // Auto-save progress
  useEffect(() => {
    if (!quiz || isSubmitted) return;

    const saveInterval = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [quiz, answers, isSubmitted]);

  const initializeTimestamps = (questions) => {
    const initialTimestamps = {};
    questions.forEach((q, index) => {
      const qId = q.id || String(index);
      initialTimestamps[qId] = new Date();
    });
    setTimestamps(initialTimestamps);
  };

  const saveProgress = () => {
    const progress = {
      answers,
      timestamps,
      timeRemaining,
      currentIndex: currentQuestionIndex,
      skipped: Array.from(skippedQuestions)
    };
    localStorage.setItem(`quiz_progress_${sessionId}`, JSON.stringify(progress));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: String(answer)
    }));
    setTimestamps(prev => ({
      ...prev,
      [questionId]: new Date()
    }));
  };

  const skipQuestion = () => {
    setSkippedQuestions(prev => {
      const newSet = new Set(prev);
      newSet.add(quiz.questions[currentQuestionIndex].id);
      return newSet;
    });
    goToNextQuestion();
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex(prev => 
      Math.min(prev + 1, quiz.questions.length - 1)
    );
  };

  const goToPrevQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const submitQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backendURL}/api/v1/quiz-grading/submit/${sessionId}`,
        {
          student_id: "anonymous",
          answers,
          timestamp: timeStarted,
          timestamps: Object.fromEntries(
            Object.entries(timestamps).map(([qId, time]) => [qId, time.toISOString()])
          )
        }
      );
      setResults(response.data);
      setIsSubmitted(true);
      localStorage.removeItem(`quiz_progress_${sessionId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed');
      console.error('Submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSubmitQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backendURL}/api/v1/quiz/submit/${sessionId}`,
        {
          student_id: "auto-submit",
          answers,
          timestamp: timeStarted,
          timestamps: Object.fromEntries(
            Object.entries(timestamps).map(([qId, time]) => [qId, time.toISOString()])
          )
        }
      );
      setResults(response.data);
      setIsSubmitted(true);
      localStorage.removeItem(`quiz_progress_${sessionId}`);
    } catch (err) {
      setError('Auto-submission failed: ' + (err.response?.data?.detail || ''));
      console.error('Auto-submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showSubmitConfirm = () => {
    const unansweredCount = quiz.questions.filter(q => !answers[q.id] && !skippedQuestions.has(q.id)).length;
    
    Modal.confirm({
      title: 'Submit Quiz?',
      content: (
        <div>
          {unansweredCount > 0 && (
            <Alert
              message={`You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <p>Are you sure you want to submit your quiz?</p>
        </div>
      ),
      okText: 'Submit',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk() {
        submitQuiz();
      }
    });
  };

  if (isLoading && !quiz) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '24px auto' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          action={
            <Button type="primary" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          }
        />
      </div>
    );
  }

  if (isSubmitted && results) {
    const scorePercentage = Math.round((results.score / results.total_questions) * 100);
    
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={3}>Quiz Results</Title>
            <Progress
              type="circle"
              percent={scorePercentage}
              format={percent => (
                <div>
                  <Title level={4} style={{ marginBottom: 0 }}>
                    {results.score}/{results.total_questions}
                  </Title>
                  <Text type="secondary">{percent}%</Text>
                </div>
              )}
              width={120}
              strokeColor={scorePercentage > 70 ? '#52c41a' : scorePercentage > 40 ? '#faad14' : '#f5222d'}
            />
          </div>

          <List
            itemLayout="vertical"
            dataSource={quiz.questions}
            renderItem={(question, index) => {
              const isCorrect = results.feedback[question.id]?.correct === 'true';
              const timeSpent = results.feedback[question.id]?.time_spent?.toFixed(1) || 'N/A';
              
              return (
                <List.Item>
                  <Card
                    style={{
                      borderLeft: `4px solid ${isCorrect ? '#52c41a' : '#f5222d'}`,
                      backgroundColor: isCorrect ? '#f6ffed' : '#fff1f0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text strong>
                        {index + 1}. {question.text}
                      </Text>
                      <Tag color={isCorrect ? 'success' : 'error'}>
                        {isCorrect ? <CheckOutlined /> : <CloseOutlined />}
                        {isCorrect ? ' Correct' : ' Incorrect'}
                      </Tag>
                    </div>

                    <Row gutter={16} style={{ marginBottom: '12px' }}>
                      <Col span={12}>
                        <Text type="secondary">Your answer:</Text>
                        <Paragraph>
                          {question.type === 'mcq' || question.type === 'true-false'
                            ? results.feedback[question.id]?.student_answer
                            : results.feedback[question.id]?.student_answer || '(No answer)'}
                        </Paragraph>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">Correct answer:</Text>
                        <Paragraph>{question.answer}</Paragraph>
                      </Col>
                    </Row>

                    {results.feedback[question.id]?.explanation && (
                      <Collapse bordered={false} ghost>
                        <Panel header="Explanation" key="1">
                          <Text>{results.feedback[question.id].explanation}</Text>
                        </Panel>
                      </Collapse>
                    )}

                    <Text type="secondary">
                      <ClockCircleOutlined /> Time spent: {timeSpent} seconds
                    </Text>
                  </Card>
                </List.Item>
              );
            }}
          />

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button type="primary" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz?.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={4} style={{ marginBottom: '4px' }}>Quiz: {quiz?.topic}</Title>
              <Text type="secondary">{quiz?.subject} • {quiz?.class_level}</Text>
            </div>
            <Space>
              <ClockCircleOutlined style={{ color: timeRemaining < 300 ? '#f5222d' : '#1890ff' }} />
              <Text strong style={{ color: timeRemaining < 300 ? '#f5222d' : '#1890ff' }}>
                Time Remaining: {formatTime(timeRemaining)}
              </Text>
              {isSaved && (
                <Tag icon={<SaveOutlined />} color="success">
                  Progress Saved
                </Tag>
              )}
            </Space>
          </div>
        }
      >
        {/* Question Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <Space size="small" wrap>
            {quiz?.questions.map((q, index) => (
              <Button
                key={q.id}
                shape="circle"
                type={currentQuestionIndex === index ? 'primary' : 'default'}
                icon={index + 1}
                onClick={() => jumpToQuestion(index)}
                style={{
                  backgroundColor: skippedQuestions.has(q.id)
                    ? '#fffbe6'
                    : answers[q.id]
                    ? '#f6ffed'
                    : undefined,
                  borderColor: skippedQuestions.has(q.id)
                    ? '#faad14'
                    : answers[q.id]
                    ? '#52c41a'
                    : undefined
                }}
              />
            ))}
          </Space>
        </div>

        {/* Current Question */}
        <Card
          title={`Question ${currentQuestionIndex + 1} of ${quiz?.questions.length}`}
          extra={
            skippedQuestions.has(currentQuestion?.id) && (
              <Tag icon={<QuestionCircleOutlined />} color="warning">
                Skipped
              </Tag>
            )
          }
          style={{ marginBottom: '24px' }}
        >
          <Title level={5} style={{ marginBottom: '16px' }}>
            {currentQuestion?.text}
          </Title>

          {/* Answer Input */}
          {currentQuestion?.type === 'mcq' && (
            <Radio.Group
              value={answers[currentQuestion.id]}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              <Space direction="vertical">
                {currentQuestion.options.map((option, i) => (
                  <Radio key={i} value={option}>
                    {option}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          )}

          {currentQuestion?.type === 'true-false' && (
            <Radio.Group
              value={answers[currentQuestion.id]}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              <Space>
                <Radio value="true">True</Radio>
                <Radio value="false">False</Radio>
              </Space>
            </Radio.Group>
          )}

          {currentQuestion?.type === 'short-answer' && (
            <TextArea
              rows={4}
              placeholder="Your answer..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            />
          )}
        </Card>

        {/* Navigation Buttons */}
        <Row justify="space-between" style={{ marginBottom: '16px' }}>
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={goToPrevQuestion}
              disabled={isFirstQuestion}
            >
              Previous
            </Button>
          </Col>
          <Col>
            <Button
              danger
              onClick={skipQuestion}
            >
              Skip Question
            </Button>
          </Col>
          <Col>
            {!isLastQuestion ? (
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={goToNextQuestion}
              >
                Next
              </Button>
            ) : (
              <Button
                type="primary"
                loading={isLoading}
                onClick={showSubmitConfirm}
              >
                Submit Quiz
              </Button>
            )}
          </Col>
        </Row>

        {/* Save Progress Button */}
        <div style={{ textAlign: 'center' }}>
          <Button
            icon={<SaveOutlined />}
            onClick={saveProgress}
          >
            Save Progress
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StudentQuizInterface;