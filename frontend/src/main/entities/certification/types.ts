// 자격증 인터페이스
export interface Certification {
  id: string;
  name: string; // title 대신 name 사용
  description: string;
  issuer: string;
  date: string; // startDate 대신 date 사용
  credentialUrl: string;
}