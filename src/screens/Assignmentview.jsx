import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Form, Input, Typography, message, Space, Spin } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Text, Title } = Typography;
const backendURL = process.env.REACT_APP_BACKEND_URL;

export default function AssignmentView() {
  const { sessionId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [form] = Form.useForm();
  const [probingQuestions, setProbingQuestions] = useState({});
  const [hintIndex, setHintIndex] = useState({});
  const [activeProbing, setActiveProbing] = useState({});
  const [hintsUsed, setHintsUsed] = useState({});
  const [timeSpent, setTimeSpent] = useState({});
  const [studentId, setStudentId] = useState('');
  const [studentIdSubmitted, setStudentIdSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentIdSubmitted || !sessionId) return;

    const fetchAssignment = async () => {
      try {
        const res = await fetch(`${backendURL}/api/v1/assignments/session/${sessionId}`);
        const data = await res.json();

        const formattedProbing = {};
        Object.entries(data.probing_questions || {}).forEach(([qId, questions]) => {
          formattedProbing[qId] = Array.isArray(questions) ? questions : [];
        });

        setAssignment(data);
        setProbingQuestions(formattedProbing);
        setHintIndex({});
        
        // Time tracking init
        const initTime = {};
        data.questions.forEach(q => initTime[q.id] = 0);
        setTimeSpent(initTime);
      } catch (err) {
        message.error('Failed to load assignment');
        console.error(err);
      }
    };

    fetchAssignment();
  }, [studentIdSubmitted, sessionId]);

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${backendURL}/api/v1/assignments/submit/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId, // ✅ Corrected here
          answers,
          interactions: hintsUsed,
          time_spent: timeSpent
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Submission failed");
      }

      const data = await res.json();
      message.success('Assignment submitted successfully!');
      navigate(`/student/assignment/review/${sessionId}`, {
        state: { gradedResult: data }
      });
    } catch (err) {
      message.error(`Submission failed: ${err.message}`);
    }
  };

  const showHintModal = (questionId) => {
    const hints = probingQuestions[questionId] || [];
    const index = hintIndex[questionId] || 0;

    if (index < hints.length) {
      setHintsUsed((prev) => ({
        ...prev,
        [questionId]: [
          ...(prev[questionId] || []),
          { type: "hint_used", timestamp: Date.now() }
        ]
      }));

      Modal.info({
        title: 'Hint from your Tutor',
        content: hints[index].text,
        onOk: () => {
          setHintIndex(prev => ({
            ...prev,
            [questionId]: index + 1
          }));
        }
      });
    } else {
      Modal.info({
        title: 'No More Hints',
        content: 'You’ve used all available hints for this question.',
      });
    }
  };

  // 👇 Student ID screen before assignment loads
  if (!studentIdSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Enter Your Student ID</h2>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-64"
          placeholder="e.g. roll number or email"
        />
        <button
          onClick={() => {
            if (studentId.trim()) {
              setStudentIdSubmitted(true);
            } else {
              alert("Please enter your Student ID");
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        >
          Continue
        </button>
      </div>
    );
  }

  // 👇 Show loading until assignment is fetched
  if (!assignment) return <Spin size="large" tip="Loading assignment..." style={{ display: 'block', marginTop: 100 }} />;

  // 👇 Main assignment UI
  return (
    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>{assignment.title}</Title>

      <Form form={form} layout="vertical">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {Array.isArray(assignment.questions) && assignment.questions.map(q => (
            <Card key={q.id} style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 12 }}>Q: {q.text}</Text>

              <Form.Item label="Your Answer">
                <Input
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              </Form.Item>

              <Button
                icon={<QuestionCircleOutlined />}
                onClick={() => showHintModal(q.id)}
                style={{ marginRight: 8 }}
              >
                Hint
              </Button>
            </Card>
          ))}

          <Button
            type="primary"
            onClick={handleSubmit}
            size="large"
            block
          >
            Submit Assignment
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
