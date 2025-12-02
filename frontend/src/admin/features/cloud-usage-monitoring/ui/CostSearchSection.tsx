import React, { useState } from 'react';
import { Collapse, Form, DatePicker, Select, Button, Space, Alert, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { CloudProvider } from '../../../entities/cloud-usage';
import { useSearchUsageTrend } from '../../../entities/cloud-usage/api/useCloudUsageQuery';
import { UsageTrendChart } from './UsageTrendChart';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Panel } = Collapse;
const { RangePicker } = DatePicker;

interface CostSearchSectionProps {}

/**
 * 비용 검색 섹션 (아코디언 형식)
 */
export const CostSearchSection: React.FC<CostSearchSectionProps> = () => {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState<{
    provider: 'AWS' | 'GCP' | null;
    startDate: string | null;
    endDate: string | null;
    granularity: 'daily' | 'monthly';
  }>({
    provider: null,
    startDate: null,
    endDate: null,
    granularity: 'daily',
  });

  const { data: trends, isLoading, error } = useSearchUsageTrend(
    searchParams.provider,
    searchParams.startDate,
    searchParams.endDate,
    searchParams.granularity,
    !!searchParams.provider && !!searchParams.startDate && !!searchParams.endDate
  );

  const handleSearch = (values: {
    provider: 'AWS' | 'GCP';
    dateRange: [Dayjs, Dayjs];
    granularity: 'daily' | 'monthly';
  }) => {
    const [startDate, endDate] = values.dateRange;
    setSearchParams({
      provider: values.provider,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      granularity: values.granularity,
    });
  };

  const handleReset = () => {
    form.resetFields();
    setSearchParams({
      provider: null,
      startDate: null,
      endDate: null,
      granularity: 'daily',
    });
  };

  // 기본값: 최근 30일
  const defaultDateRange: [Dayjs, Dayjs] = [
    dayjs().subtract(30, 'day'),
    dayjs(),
  ];

  return (
    <Collapse style={{ marginTop: '24px' }}>
      <Panel
        header={
          <span>
            <SearchOutlined /> 비용 검색 (커스텀 기간 조회)
          </span>
        }
        key="search"
      >
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSearch}
            initialValues={{
              provider: 'AWS',
              dateRange: defaultDateRange,
              granularity: 'daily',
            }}
          >
            <Form.Item
              label="클라우드 프로바이더"
              name="provider"
              rules={[{ required: true, message: '프로바이더를 선택해주세요' }]}
            >
              <Select placeholder="프로바이더 선택">
                <Select.Option value="AWS">AWS</Select.Option>
                <Select.Option value="GCP">GCP</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="기간 선택"
              name="dateRange"
              rules={[{ required: true, message: '기간을 선택해주세요' }]}
            >
              <RangePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  // 오늘 이후 날짜는 선택 불가
                  return current && current > dayjs().endOf('day');
                }}
              />
            </Form.Item>

            <Form.Item
              label="세분성"
              name="granularity"
              rules={[{ required: true, message: '세분성을 선택해주세요' }]}
            >
              <Select placeholder="세분성 선택">
                <Select.Option value="daily">일별</Select.Option>
                <Select.Option value="monthly">월별</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  검색
                </Button>
                <Button onClick={handleReset}>초기화</Button>
              </Space>
            </Form.Item>
          </Form>

          {error && (
            <Alert
              message="검색 실패"
              description={error.message}
              type="error"
              showIcon
              style={{ marginTop: '16px' }}
            />
          )}

          {searchParams.provider && searchParams.startDate && searchParams.endDate && (
            <div style={{ marginTop: '24px' }}>
              <UsageTrendChart
                trends={trends}
                isLoading={isLoading}
                error={error}
                title={`${searchParams.provider} 비용 추이 (${searchParams.startDate} ~ ${searchParams.endDate}, ${
                  searchParams.granularity === 'daily' ? '일별' : '월별'
                })`}
                provider={searchParams.provider === 'AWS' ? CloudProvider.AWS : CloudProvider.GCP}
              />
            </div>
          )}
        </Card>
      </Panel>
    </Collapse>
  );
};

