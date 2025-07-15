import React from 'react';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import axios from 'axios';
const { Title } = Typography;

export default function ForgotPassword() {
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  const onFinish = async (values) => {
    try {
      await axios.post(`${backendURL}/api/v1/auth/forgot-password`, { email: values.email });
      message.success('If this email is registered, a reset link has been sent.');
    } catch (err) {
      message.error(err.response?.data?.detail || 'Error sending reset link.');
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: '3rem auto' }}>
      <Title level={3}>Reset Your Password</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item 
          name="email" 
          label="Email" 
          rules={[{ required: true, type: 'email', message: 'Enter a valid email!' }]}
        >
          <Input placeholder="abc@gmail.com" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Send Reset Link
        </Button>
      </Form>
    </Card>
  );
}
