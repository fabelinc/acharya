// CreateAssignmentForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Form, Input, Select, Upload,
  message, Card, Space, InputNumber, Spin
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function CreateAssignmentForm() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();
  const backendURL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem('teacherToken');
  const fileUploaded = fileList.length > 0;

  const handleSubmit = async () => {
    setLoading(true); // Start loading spinner
    try {
      const values = await form.validateFields();
      
      if (!fileList.length && (!values.class_grade || !values.subject)) {
        message.error("Please fill required fields or upload a file.");
        return;
      }
  
      const formData = new FormData();
  
      // Append regular form fields
      if (values.class_grade) formData.append('class_grade', values.class_grade);
      if (values.subject) formData.append('subject', values.subject);
      if (values.topic) formData.append('topic', values.topic);
      if (values.difficulty) formData.append('difficulty', values.difficulty);
      if (values.question_count) formData.append('question_count', values.question_count.toString());
  
      // Handle file upload
      if (fileList.length > 0) {
        const file = fileList[0];  // Now using the file directly
        formData.append('materials', file, file.name);
      }
  
      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
  
      const res = await fetch(`${backendURL}/api/v1/assignments/generate`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
          // Do NOT set 'Content-Type' — browser handles it for FormData
        },
        credentials: 'include' // Optional: only if you're using cookies for auth
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Request failed');
      }
  
      const responseData = await res.json();
      message.success('Assignment generated!');
      // Store token in localStorage
      localStorage.setItem('teacherToken', responseData.access_token);
      
      navigate(`/assignments/publish/${responseData.assignment_id}`, {
        state: {
          title: responseData.title,
          subject: responseData.subject,
          questions: responseData.questions,
        },
      });
  
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Failed to generate assignment');
    } finally {
      setLoading(false); // Stop spinner no matter what
    }
  };

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file) => {
      setFileList([file]);  // Store the file directly
      return false;  // Prevent automatic upload
    },
    fileList,
    accept: '.pdf,.docx',
    maxCount: 1
  };
  
  return (
    <Card title="Create Assignment - Use your own material or generate one with AI." style={{ maxWidth: 600, margin: '0 auto' }}>
      <Spin spinning={loading} tip="Generating Assignment...">
      <Form form={form} layout="vertical" initialValues={{
          subject: 'math',
          topic: 'Algebra',
          difficulty: 'intermediate',
          question_count: 2,
        }}
      >
        <Form.Item label="Upload Materials (or select from below)">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </Form.Item>

        {fileUploaded && (
          <div style={{ marginBottom: 16, color: '#888' }}>
            File uploaded. Other options are disabled.
          </div>
        )}

        <Form.Item
          name="class_grade"
          label="Class / Grade"
          rules={fileUploaded ? [] : [{ required: true, message: 'Please select the class or grade' }]}
        >
          <Select disabled={fileUploaded}>
            <Option value="6">Class 6</Option>
            <Option value="7">Class 7</Option>
            <Option value="8">Class 8</Option>
            <Option value="9">Class 9</Option>
            <Option value="10">Class 10</Option>
            <Option value="11">Class 11</Option>
            <Option value="12">Class 12</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject"
          rules={fileUploaded ? [] : [{ required: true }]}
        >
          <Select disabled={fileUploaded}>
            <Option value="math">Math</Option>
            <Option value="Physics">Physics</Option>
            <Option value="science">Chemistry</Option>
          </Select>
        </Form.Item>

        <Form.Item name="topic" label="Topic">
          <Input disabled={fileUploaded} />
        </Form.Item>

        <Form.Item name="difficulty" label="Difficulty">
          <Select disabled={fileUploaded}>
            <Option value="easy">Easy</Option>
            <Option value="intermediate">Intermediate</Option>
            <Option value="hard">Hard</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="question_count"
          label="Question Count"
          rules={[{ type: 'number', min: 1, max: 50 }]}
        >
          <InputNumber min={1} max={50} style={{ width: '100%' }} disabled={fileUploaded} />
        </Form.Item>

        <Form.Item>
          <Space>
          <Button
              type="primary"
              onClick={() => {
                const token = localStorage.getItem('teacherToken');
                if (!token) {
                  console.error("Access token is missing. Please log in again.");
                  return;
                }
                handleSubmit(token);
              }}
            >
              Generate Assignment
            </Button>
            <Button htmlType="button" onClick={() => {
              form.resetFields();
              setFileList([]);
            }}>
              Reset
            </Button>
          </Space>
        </Form.Item>
        </Form>
        </Spin>
    </Card>
  );
}
