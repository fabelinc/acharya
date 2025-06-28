// src/pages/StudentChatbot.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Input,
  Spin,
  Typography,
  message,
  Card,
  Space,
} from "antd";
import { useParams } from "react-router-dom";

const { Title } = Typography;
const backendURL = process.env.REACT_APP_BACKEND_URL;

const StudentChatbot = () => {
  const { chapterId } = useParams();
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/v1/chatbot/public/${chapterId}`);
        setConfig(res.data);
      } catch (err) {
        message.error("Failed to load chatbot config");
      }
    };
    fetchConfig();
  }, [chapterId]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { sender: "user", text: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const encodedQuestion = encodeURIComponent(inputMessage);
      const res = await axios.post(
        `${backendURL}/api/v1/chatbot/ask/${chapterId}?question=${encodedQuestion}`
      );
      setMessages((prev) => [...prev, { sender: "bot", text: res.data.response }]);
    } catch (err) {
      console.error(err);
      message.error("Something went wrong");
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I couldn't answer that." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!config) return <Spin tip="Loading chatbot..." />;

  return (
    <Card className="max-w-3xl mx-auto p-6">
      <Title level={3} style={{ color: "#1890ff" }}>
        Chat with Teaching Assistant – Chapter {chapterId}
      </Title>

      <div style={{ maxHeight: 400, overflowY: "auto", marginBottom: 16, padding: 12, border: "1px solid #f0f0f0" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                background: msg.sender === "user" ? "#e6f7ff" : "#f5f5f5",
                maxWidth: 300,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <Spin />}
      </div>

      <Space.Compact style={{ width: "100%" }}>
        <Input
          placeholder="Ask your question..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onPressEnter={sendMessage}
          disabled={isLoading}
        />
        <Button type="primary" onClick={sendMessage} disabled={!inputMessage.trim()}>
          Send
        </Button>
      </Space.Compact>
    </Card>
  );
};

export default StudentChatbot;
