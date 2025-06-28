// QuizGenerator.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Radio,
  Space,
  Divider,
  Alert,
  message,
  Typography,
  InputNumber,
  Row,
  Col
} from 'antd';
import {
  UploadOutlined,
  CopyOutlined,
  CheckOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const backendURL = process.env.REACT_APP_BACKEND_URL;

const QuizGenerator = () => {
  const [form] = Form.useForm();
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shareableLink, setShareableLink] = useState('');
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [hasFileUpload, setHasFileUpload] = useState(false);

  useEffect(() => {
    form.validateFields(['classLevel', 'subject', 'topic']);
  }, [hasFileUpload, form]);

  const onFinish = async (values) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const data = new FormData();
      
      if (values.classLevel) data.append('class_level', values.classLevel);
      if (values.subject) data.append('subject', values.subject);
      if (values.topic) data.append('topic', values.topic);
      
      data.append('quiz_type', values.quizType);
      data.append('question_count', values.questionCount);
      
      if (fileList.length > 0) {
        const file = fileList[0];
        if (file.originFileObj instanceof File) {
          data.append('notes', file.originFileObj);
        } else {
          throw new Error('Please select a valid file (PDF, DOCX, or TXT)');
        }
      }
  
      const response = await axios.post(
        `${backendURL}/api/v1/quiz/generate`, 
        data, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setGeneratedQuiz(response.data.quiz);
      setShareableLink(`${window.location.origin}/student/quiz/${response.data.session_id}`);
      message.success('Quiz generated successfully!');
      
    } catch (err) {
      console.error('Quiz generation error:', err);
      
      let errorMessage = 'Failed to generate quiz. Please try again.';
      
      if (err.response?.data) {
        // Handle array of error objects
        if (Array.isArray(err.response.data)) {
          errorMessage = err.response.data.map(errorObj => errorObj.msg).join('\n');
        } 
        // Handle single error object
        else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
        // Handle string error
        else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      message.error(errorMessage.split('\n')[0]); // Show first error in toast
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    setIsLinkCopied(true);
    message.success('Link copied to clipboard!');
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setHasFileUpload(false);
    },
    beforeUpload: (file) => {
      setFileList([{...file, status: 'done', originFileObj: file}]);
      setHasFileUpload(true);
      return false; // Prevent auto upload
    },
    fileList,
    accept: '.pdf,.docx,.txt',
    maxCount: 1
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <Card
        title={
          <div>
            <Title level={3} style={{ color: 'white', marginBottom: 0 }}>Quiz Generator</Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Create customized assessments in seconds</Text>
          </div>
        }
        headStyle={{ backgroundColor: '#1890ff', color: 'white' }}
        style={{ marginBottom: '24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            quizType: 'mcq',
            questionCount: 5
          }}
        >
          {error && (
            <Alert
              message="Error"
              description={
                <div style={{ whiteSpace: 'pre-line' }}>
                  {error}
                </div>
              }
              type="error"
              showIcon
              closable
              style={{ marginBottom: '24px' }}
              onClose={() => setError(null)}
            />
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Class Level"
                name="classLevel"
                rules={[{ required: !hasFileUpload, message: 'Please select class level' }]}
              >
                <Select placeholder="Select class level">
                  <Select.Option value="elementary">Elementary</Select.Option>
                  <Select.Option value="middle-school">Middle School</Select.Option>
                  <Select.Option value="high-school">High School</Select.Option>
                  <Select.Option value="college">College</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: !hasFileUpload, message: 'Please enter subject' }]}
              >
                <Input placeholder="e.g. Mathematics" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Topic"
            name="topic"
            rules={[{ required: !hasFileUpload, message: 'Please enter topic' }]}
          >
            <Input placeholder="e.g. Quadratic Equations" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Quiz Type" 
                name="quizType"
                rules={[{ required: true, message: 'Please select quiz type' }]}
              >
                <Select>
                  <Select.Option value="mcq">Multiple Choice</Select.Option>
                  <Select.Option value="true-false">True/False</Select.Option>
                  <Select.Option value="short-answer">Short Answer</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Number of Questions" 
                name="questionCount"
                rules={[{ 
                  required: true, 
                  message: 'Please enter number of questions',
                  type: 'number',
                  min: 1,
                  max: 20
                }]}
              >
                <InputNumber min={1} max={20} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Upload Notes (Optional)">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
            <Text type="secondary">PDF, DOCX, or TXT files (Max: 1 file)</Text>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              block
              size="large"
            >
              Generate Quiz
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {generatedQuiz && (
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ marginBottom: 0 }}>Generated Quiz</Title>
                <Text type="secondary">{form.getFieldValue('subject') || 'From uploaded file'} • {form.getFieldValue('topic') || 'From uploaded file'}</Text>
              </div>
              <Button type="primary" icon={<SaveOutlined />}>
                Save Quiz
              </Button>
            </div>
          }
          style={{ marginBottom: '24px' }}
        >
          {shareableLink && (
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Share this quiz with students:</Text>
              <Space.Compact style={{ width: '100%' }}>
                <Input value={shareableLink} readOnly />
                <Button 
                  type="primary" 
                  icon={isLinkCopied ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={copyToClipboard}
                >
                  {isLinkCopied ? 'Copied' : 'Copy'}
                </Button>
              </Space.Compact>
              <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                Students can access this quiz using the link above.
              </Text>
            </div>
          )}

          <Divider />

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {generatedQuiz.questions.map((question, index) => (
              <Card key={index} size="small" title={`Question ${index + 1}`}>
                <Text strong style={{ display: 'block', marginBottom: '16px' }}>
                  {question.text}
                </Text>
                
                {question.type === 'mcq' && (
                  <Radio.Group>
                    <Space direction="vertical">
                      {question.options.map((option, i) => (
                        <Radio key={i} value={option}>{option}</Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                )}
                
                {question.type === 'true-false' && (
                  <Radio.Group>
                    <Space>
                      <Radio value="true">True</Radio>
                      <Radio value="false">False</Radio>
                    </Space>
                  </Radio.Group>
                )}
                
                {question.type === 'short-answer' && (
                  <TextArea rows={3} placeholder="Your answer..." />
                )}
              </Card>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default QuizGenerator;