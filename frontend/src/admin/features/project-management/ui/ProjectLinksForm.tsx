import React from 'react';
import { Form, Input, Row, Col } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

interface ProjectLinksFormProps {
  form: any;
}

const ProjectLinksForm: React.FC<ProjectLinksFormProps> = ({ form }) => {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <Form.Item
          name="githubUrl"
          label={
            <span>
              <LinkOutlined /> GitHub URL
            </span>
          }
        >
          <Input placeholder="https://github.com/..." />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item
          name="liveUrl"
          label={
            <span>
              <LinkOutlined /> Live URL
            </span>
          }
        >
          <Input placeholder="https://..." />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item
          name="externalUrl"
          label={
            <span>
              <LinkOutlined /> External URL
            </span>
          }
        >
          <Input placeholder="https://..." />
        </Form.Item>
      </Col>
    </Row>
  );
};

export { ProjectLinksForm };
