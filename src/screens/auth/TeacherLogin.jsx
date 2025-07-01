import React from 'react';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../../context/AuthContext';
const { Title } = Typography;

export default function TeacherLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext(); // Get login function from your auth context
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  const onFinish = async (values) => {
    try {
      const params = new URLSearchParams();
      params.append('username', values.email);
      params.append('password', values.password);
  
      const res = await axios.post(`${backendURL}/api/v1/auth/login`, params);
      
      // Store token in localStorage
      localStorage.setItem('teacherToken', res.data.access_token);
      
      // Update auth context state
      await login(res.data.access_token); // Pass the token to your auth context
      
      message.success('Login successful!');
      localStorage.setItem('teacherToken', res.data.access_token);
      localStorage.setItem('teacherName', res.data.name);
      localStorage.setItem('teacherId', res.data.teacher_id); 
      // Redirect to intended location or default route
      const from = location.state?.from?.pathname || '/teachers';
      navigate(from, { replace: true });
      
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.detail || 'Login failed. Check your credentials.');
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: '3rem auto' }}>
      <Title level={3}>Teacher Login</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item 
          name="email" 
          label="Email" 
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input placeholder="teacher@example.com" />
        </Form.Item>
        <Form.Item 
          name="password" 
          label="Password" 
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' }
          ]}
        >
          <Input.Password placeholder="••••••" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={false}>
          Log In
        </Button>
        <p style={{ marginTop: 16, textAlign: 'center' }}>
          New to Aacharya?{" "}
          <a href="/teacher/signup" style={{ color: '#1677ff' }}>
            Create an account
          </a>
        </p>
      </Form>
    </Card>
  );
}