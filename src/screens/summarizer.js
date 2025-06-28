import React, { useState } from 'react';
import { Card, Upload, Input, Select, Button, Typography, message, Alert, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import config from '../config';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Paragraph } = Typography;
const backendURL = process.env.REACT_APP_BACKEND_URL;

export default function ChapterSummarizer() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [complexity, setComplexity] = useState('medium');
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = ({ file }) => {
    setFile(file);
    setText('');
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    setFile(null);
  };

  const summarize = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      if (!text && !file) throw new Error('Please provide either text or a file');

      const formData = new FormData();
      formData.append('complexity', complexity);
      if (text) formData.append('text', cleanText(text));
      else if (file) formData.append('file', file);

      const response = await axios.post(
        `${backendURL}/api/v1/summarize`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.data?.summary) throw new Error('Invalid response from server');

      setSummary(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanText = (input) =>
    input.replace(/[\x00-\x1F\x7F-\x9F]/g, '').replace(/\s+/g, ' ').trim();

  return (
    <Card title="Chapter Summarizer" style={{ margin: 16 }}>
      <Typography.Paragraph>
        Upload a file or paste your chapter text to receive a simplified summary.
      </Typography.Paragraph>

      <div style={{ marginBottom: 16 }}>
        <Upload
          beforeUpload={(file) => {
            handleFileUpload({ file });
            return false; // prevent auto-upload
          }}
          disabled={!!text}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />} disabled={!!text}>
            Upload Notes (PDF, DOCX, TXT)
          </Button>
        </Upload>
        {file && <Paragraph type="secondary">Selected file: {file.name}</Paragraph>}
      </div>

      {file && (
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm text-gray-600">{file.name}</span>
          <button
            onClick={() => setFile(null)}
            className="text-red-600 hover:underline text-sm ml-4"
          >
            Remove file
          </button>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <TextArea
          rows={6}
          placeholder="Paste your chapter content here..."
          value={text}
          onChange={handleTextChange}
          disabled={file !== null}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Select
          value={complexity}
          onChange={setComplexity}
          style={{ width: '100%' }}
        >
          <Option value="low">Simple (Key Points)</Option>
          <Option value="medium">Standard (Balanced)</Option>
          <Option value="high">Detailed (Comprehensive)</Option>
        </Select>
      </div>

      <Button
        type="primary"
        loading={isLoading}
        disabled={!text && !file}
        onClick={summarize}
        block
      >
        Generate Summary
      </Button>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      {summary && (
        <Card
          title="Summary Result"
          type="inner"
          style={{ marginTop: 24, backgroundColor: '#f9f9f9' }}
        >
          <Paragraph type="secondary">
            Reduced from {summary.original_length} to {summary.summary_length} characters
          </Paragraph>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {summary.summary.split('\n').map((line, idx) => (
              <Paragraph key={idx}>{line}</Paragraph>
            ))}
          </div>
        </Card>
      )}
    </Card>
  );
}
