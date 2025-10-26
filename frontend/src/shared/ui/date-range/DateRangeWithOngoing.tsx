/**
 * 진행중 상태를 포함한 날짜 범위 입력 컴포넌트
 * 경력, 학력, 프로젝트 등에서 공통 사용
 */

import React from 'react';
import { Row, Col, DatePicker, Checkbox, Form } from 'antd';

interface DateRangeWithOngoingProps {
  // 필드 이름들
  startDateName?: string;
  endDateName?: string;
  checkboxName?: string;
  
  // 라벨들
  startDateLabel?: string;
  endDateLabel?: string;
  ongoingLabel?: string;
  
  // 초기값
  defaultOngoing?: boolean;
  
  // 추가 props
  onChange?: (isOngoing: boolean) => void;
}

const DateRangeWithOngoing: React.FC<DateRangeWithOngoingProps> = ({
  startDateName = 'startDate',
  endDateName = 'endDate',
  checkboxName = 'isOngoing',
  startDateLabel = '시작일',
  endDateLabel = '종료일',
  ongoingLabel = '진행중',
  defaultOngoing = false,
  onChange,
}) => {
  const form = Form.useFormInstance();
  const [isOngoing, setIsOngoing] = React.useState(defaultOngoing);

  React.useEffect(() => {
    setIsOngoing(defaultOngoing);
  }, [defaultOngoing]);

  const handleCheckboxChange = (checked: boolean) => {
    setIsOngoing(checked);
    if (checked) {
      form.setFieldValue(endDateName, null);
    }
    onChange?.(checked);
  };

  return (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item 
            name={startDateName} 
            label={startDateLabel}
            rules={[{ required: true, message: `${startDateLabel}을 선택하세요` }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={endDateName} label={endDateLabel}>
            <DatePicker 
              style={{ width: '100%' }} 
              disabled={isOngoing}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Checkbox checked={isOngoing} onChange={(e) => handleCheckboxChange(e.target.checked)}>
            {ongoingLabel}
          </Checkbox>
        </Col>
      </Row>
    </>
  );
};

export default DateRangeWithOngoing;

