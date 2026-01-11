import { Button, Space, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { MarkdownEditor } from '@/admin/shared/ui/markdown/MarkdownEditor';
import { useProfileIntroductionForm } from '../hooks/useProfileIntroductionForm';

/**
 * 프로필 자기소개 에디터
 *
 * 참고:
 * - MarkdownEditor (@uiw/react-md-editor)는 내장 미리보기 기능 제공
 * - preview prop으로 'edit' | 'live' | 'preview' 모드 전환 가능
 * - 기본값: 'edit' (편집 + 미리보기 분할 화면)
 */
export function ProfileIntroductionEditor() {
  const {
    content,
    setContent,
    handleSave,
    isSaving,
    isLoading,
    introduction,
  } = useProfileIntroductionForm();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="로딩 중..." />
      </div>
    );
  }

  return (
    <div className="profile-introduction-editor">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">자기소개 관리</h2>
          {introduction && (
            <p className="text-sm text-gray-500 mt-1">
              마지막 수정: {new Date(introduction.updatedAt).toLocaleString('ko-KR')} (버전 {introduction.version})
            </p>
          )}
        </div>
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isSaving}
            disabled={!content.trim()}
          >
            저장
          </Button>
        </Space>
      </div>

      {/* 마크다운 에디터 (내장 미리보기 포함) */}
      <MarkdownEditor
        value={content}
        onChange={setContent}
        height={600}
        preview="live" // 편집과 미리보기를 동시에 보여줌
      />

      {/* 가이드 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">마크다운 작성 가이드</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 제목: # H1, ## H2, ### H3</li>
          <li>• 강조: **굵게**, *기울임*</li>
          <li>• 목록: - 또는 1. 2. 3.</li>
          <li>• 링크: [텍스트](URL)</li>
          <li>• 이미지: ![설명](이미지URL)</li>
          <li>• 코드: `인라인 코드` 또는 ```언어로 코드 블록</li>
        </ul>
      </div>
    </div>
  );
}
