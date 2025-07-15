import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

export default function ResetPassword() {
  const backendURL = process.env.REACT_APP_BACKEND_URL;
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (!token) {
      message.error('Invalid or missing token');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${backendURL}/api/v1/auth/reset-password`, {
        token,
        new_password: values.password,
      });
      message.success('Password reset successful! Please log in.');
      navigate('/teacher/login');
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.detail || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: '3rem auto' }}>
      <Title level={3}>Set New Password</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="password"
          label="New Password"
          rules={[
            { required: true, message: 'Enter your new password!' },
            { min: 6, message: 'Password must be at least 6 characters!' },
          ]}
        >
          <Input.Password placeholder="••••••" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Reset Password
        </Button>
      </Form>
    </Card>
  );
}
