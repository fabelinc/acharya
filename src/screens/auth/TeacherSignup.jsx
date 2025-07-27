import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Card, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './TeacherSignup.css'; // We'll create this CSS file

const { Title } = Typography;
const backendURL = process.env.REACT_APP_BACKEND_URL;

export default function TeacherSignup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      await axios.post(
        `${backendURL}/api/v1/auth/signup`,
        {
          email: values.email,
          password: values.password,
          name: values.name,
        },
        {
          withCredentials: true,
        }
      );
      setIsLoading(false);
      setIsSuccess(true);
      
      // Success animation will play for 2 seconds before navigating
      setTimeout(() => {
        navigate('/teacher/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      message.error('Signup failed. Email may already be registered.');
    }
  };

  return (
    <div className="signup-container">
      <Card 
        className={`signup-card ${isSuccess ? 'success-animation' : ''}`}
        style={{ maxWidth: 400, margin: '3rem auto' }}
      >
        {isSuccess ? (
          <div className="success-message">
            <CheckCircleOutlined className="success-icon" />
            <Title level={3} style={{ textAlign: 'center', marginTop: 20 }}>
              Signup Successful! You can now login.
            </Title>
          </div>
        ) : (
          <>
            <Title level={3} className="title-animation">Teacher Signup</Title>
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item 
                name="name" 
                label="Full Name" 
                rules={[{ required: true }]}
              >
                <Input className="input-animation" />
              </Form.Item>
              <Form.Item 
                name="email" 
                label="Email" 
                rules={[{ type: 'email', required: true }]}
              >
                <Input className="input-animation" />
              </Form.Item>
              <Form.Item 
                name="password" 
                label="Password" 
                rules={[{ required: true, min: 6 }]}
              >
                <Input.Password className="input-animation" />
              </Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
                className="submit-button"
                loading={isLoading}
              >
                {isLoading ? <Spin indicator={<LoadingOutlined spin />} /> : 'Sign Up'}
              </Button>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
}