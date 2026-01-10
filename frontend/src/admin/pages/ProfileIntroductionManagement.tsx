import { ProfileIntroductionEditor } from '../features/profile-introduction-management/ui/ProfileIntroductionEditor';

/**
 * 프로필 자기소개 관리 페이지
 */
export function ProfileIntroductionManagement() {
  return (
    <div className="profile-introduction-management-page p-6">
      <ProfileIntroductionEditor />
    </div>
  );
}
