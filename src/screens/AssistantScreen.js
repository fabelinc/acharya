import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Select,
  Input,
  Upload,
  Typography,
  Space,
  Spin,
  message,
  Divider,
  Card,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;
const backendURL = process.env.REACT_APP_BACKEND_URL;

const personalityOptions = [
  { value: "formal", label: "Formal Professor" },
  { value: "friendly", label: "Friendly Tutor" },
  { value: "humorous", label: "Humorous Guide" },
  { value: "socratic", label: "Socratic Mentor" },
];

const toneOptions = [
  { value: "encouraging", label: "Encouraging" },
  { value: "strict", label: "Strict" },
  { value: "casual", label: "Casual" },
];

const TeachingAssistant = () => {
  const [config, setConfig] = useState({
    chapterId: "",
    personality: "friendly",
    tone: "encouraging",
    knowledgeSource: null,
    textContent: "",
  });
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  const handleFileUpload = (file) => {
    setConfig({ ...config, knowledgeSource: file });
    return false; // prevent auto upload
  };

  const createChatbot = async () => {
    if (!config.chapterId.trim()) {
      message.error("Chapter ID is required");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();

      if (config.knowledgeSource) {
        formData.append("file", config.knowledgeSource);
      }
      if (config.textContent) {
        formData.append("text", config.textContent.trim());
      }

      const params = new URLSearchParams({
        chapter_id: config.chapterId.trim(),
        teacher_id: localStorage.getItem("userId") || "current_user_id",
        personality: config.personality,
        tone: config.tone,
      });

      const url = `${backendURL}/api/v1/chatbot/create?${params.toString()}`;

      await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setIsConfiguring(false);
      const link = `${window.location.origin}/student/chatbot/${config.chapterId}`;
      setShareableLink(link);
      setIsConfiguring(false);
      message.success("Teaching Assistant created successfully!");
      
    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to create chatbot";
      const errorData = err.response?.data;
      if (Array.isArray(errorData)) {
        errorMessage = errorData
          .map((e) => {
            const field = Array.isArray(e.loc) ? e.loc.join(".") : e.loc;
            return `${field}: ${e.msg}`;
          })
          .join("\n");
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      }
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { sender: "user", text: inputMessage };
    setMessages((msgs) => [...msgs, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const encodedQuestion = encodeURIComponent(inputMessage);
      const response = await axios.post(
        `${backendURL}/api/v1/chatbot/ask/${config.chapterId}?question=${encodedQuestion}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const botResponse =
        response.data?.response ||
        response.data?.answer ||
        "I got your message!";

      setMessages((msgs) => [...msgs, { sender: "bot", text: botResponse }]);
    } catch (err) {
      console.error("API Error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      let errorMessage = "Sorry, I couldn't process your request.";
      if (err.response?.data?.detail) {
        errorMessage =
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail);
      }
      setMessages((msgs) => [...msgs, { sender: "bot", text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto p-6" bordered>
      {isConfiguring ? (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={3} style={{ color: "#1890ff" }}>
            Create Teaching Assistant
          </Title>
          
          <Input
            addonBefore="Chapter ID *"
            placeholder="Enter chapter identifier"
            value={config.chapterId}
            onChange={(e) =>
              setConfig({ ...config, chapterId: e.target.value })
            }
            disabled={isLoading}
          />

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <label>Personality</label>
              <Select
                value={config.personality}
                onChange={(value) => setConfig({ ...config, personality: value })}
                style={{ width: "100%" }}
                disabled={isLoading}
              >
                {personalityOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12}>
              <label>Tone</label>
              <Select
                value={config.tone}
                onChange={(value) => setConfig({ ...config, tone: value })}
                style={{ width: "100%" }}
                disabled={isLoading}
              >
                {toneOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <div>
            <label>Upload Chapter Materials (Optional)</label>
            <Upload
              beforeUpload={handleFileUpload}
              maxCount={1}
              disabled={isLoading}
              showUploadList={config.knowledgeSource ? true : false}
            >
              <Button icon={<UploadOutlined />} disabled={isLoading}>
                Select File
              </Button>
            </Upload>
          </div>

          <div>
            <label>Or paste chapter content (Optional)</label>
            <TextArea
              rows={5}
              placeholder="Paste chapter content here..."
              value={config.textContent}
              onChange={(e) =>
                setConfig({ ...config, textContent: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <Button
            type="primary"
            onClick={createChatbot}
            disabled={!config.chapterId || isLoading}
            loading={isLoading}
          >
            Create Teaching Assistant
          </Button>
        </Space>
        
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Title level={4} style={{ color: "#1890ff" }}>
              Chapter {config.chapterId} Teaching Assistant
            </Title>
            <Button type="link" onClick={() => setIsConfiguring(true)}>
              Edit Settings
            </Button>
          </Row>
          {shareableLink && (
            <Card type="inner" style={{ marginBottom: 16, background: "#f6ffed", borderColor: "#b7eb8f" }}>
              <p><strong>Student Access Link:</strong></p>
              <Input
                value={shareableLink}
                readOnly
                addonAfter={
                  <Button
                    type="link"
                    onClick={() => {
                      navigator.clipboard.writeText(shareableLink);
                      message.success("Link copied to clipboard!");
                    }}
                  >
                    Copy
                  </Button>
                }
              />
            </Card>
          )}

          <div
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: 4,
              height: 384,
              overflowY: "auto",
              padding: 16,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: 320,
                    borderRadius: 8,
                    padding: 12,
                    backgroundColor:
                      msg.sender === "user" ? "#bae7ff" : "#f5f5f5",
                    color: msg.sender === "user" ? "#0050b3" : "rgba(0,0,0,0.85)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <Spin />
              </div>
            )}
          </div>

          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Ask your question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onPressEnter={sendMessage}
              disabled={isLoading}
            />
            <Button
              type="primary"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              loading={isLoading}
            >
              Send
            </Button>
          </Space.Compact>
        </Space>
      )}
    </Card>
  );
};

export default TeachingAssistant;
