import React from 'react';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

export default function TeacherSignup() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await axios.post("http://localhost:8000/api/v1/auth/signup", {
        email: values.email,
        password: values.password,
        name: values.name,
      });
      message.success('Signup successful! You can now login.');
      navigate('/teacher/login');
    } catch (err) {
      console.error(err);
      message.error('Signup failed. Email may already be registered.');
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: '3rem auto' }}>
      <Title level={3}>Teacher Signup</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: 'email', required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Sign Up
        </Button>
      </Form>
    </Card>
  );
}
