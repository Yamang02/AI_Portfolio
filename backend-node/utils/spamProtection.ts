// 스팸 방지 유틸리티 (서버 사이드)

interface SubmissionRecord {
  count: number;
  lastSubmission: number;
  blockedUntil?: number;
}

interface UserSubmissionMap {
  [userId: string]: SubmissionRecord;
}

const MAX_SUBMISSIONS_PER_DAY = 5;
const MAX_SUBMISSIONS_PER_HOUR = 3;
const MIN_TIME_BETWEEN_SUBMISSIONS = 60000; // 1분
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24시간

// 메모리 기반 저장소 (실제 구현에서는 Redis나 DB 사용 권장)
const submissionRecords: UserSubmissionMap = {};

// 사용자 식별자 생성 (IP, User-Agent 등 조합)
const generateUserId = (req: any): string => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return `${ip}-${userAgent}`;
};

export const checkSpamProtection = (req: any): { allowed: boolean; message?: string } => {
  try {
    const userId = generateUserId(req);
    const now = Date.now();
    
    const record = submissionRecords[userId];
    
    if (!record) {
      return { allowed: true };
    }
    
    // 차단 기간 확인
    if (record.blockedUntil && now < record.blockedUntil) {
      const remainingTime = Math.ceil((record.blockedUntil - now) / (1000 * 60 * 60));
      return { 
        allowed: false, 
        message: `스팸 방지를 위해 24시간 동안 차단되었습니다. ${remainingTime}시간 후에 다시 시도해주세요.` 
      };
    }
    
    // 24시간이 지나면 카운트 리셋
    if (now - record.lastSubmission > 24 * 60 * 60 * 1000) {
      delete submissionRecords[userId];
      return { allowed: true };
    }
    
    // 시간당 제한 확인
    if (now - record.lastSubmission < 60 * 60 * 1000) { // 1시간 내
      if (record.count >= MAX_SUBMISSIONS_PER_HOUR) {
        return { 
          allowed: false, 
          message: '시간당 최대 3회까지만 문의할 수 있습니다. 1시간 후에 다시 시도해주세요.' 
        };
      }
    }
    
    // 일일 제한 확인
    if (record.count >= MAX_SUBMISSIONS_PER_DAY) {
      // 24시간 차단
      const blockedUntil = now + BLOCK_DURATION;
      submissionRecords[userId] = {
        ...record,
        blockedUntil
      };
      return { 
        allowed: false, 
        message: '일일 최대 5회를 초과하여 24시간 동안 차단되었습니다.' 
      };
    }
    
    return { allowed: true };
    
  } catch (error) {
    console.error('스팸 방지 검사 오류:', error);
    return { allowed: true }; // 오류 시 허용
  }
};

export const recordSubmission = (req: any): void => {
  try {
    const userId = generateUserId(req);
    const now = Date.now();
    
    const record = submissionRecords[userId];
    
    if (!record) {
      submissionRecords[userId] = {
        count: 1,
        lastSubmission: now
      };
      return;
    }
    
    // 1시간이 지나면 시간당 카운트 리셋
    if (now - record.lastSubmission > 60 * 60 * 1000) {
      record.count = 1;
    } else {
      record.count += 1;
    }
    
    record.lastSubmission = now;
    submissionRecords[userId] = record;
    
  } catch (error) {
    console.error('제출 기록 오류:', error);
  }
};

export const getSubmissionStatus = (req: any): { 
  dailyCount: number; 
  hourlyCount: number; 
  timeUntilReset: number;
  isBlocked: boolean;
} => {
  try {
    const userId = generateUserId(req);
    const now = Date.now();
    
    const record = submissionRecords[userId];
    
    if (!record) {
      return { dailyCount: 0, hourlyCount: 0, timeUntilReset: 0, isBlocked: false };
    }
    
    // 차단 상태 확인
    if (record.blockedUntil && now < record.blockedUntil) {
      return {
        dailyCount: record.count,
        hourlyCount: record.count,
        timeUntilReset: record.blockedUntil - now,
        isBlocked: true
      };
    }
    
    // 1시간 내 카운트
    const hourlyCount = (now - record.lastSubmission < 60 * 60 * 1000) ? record.count : 0;
    
    // 다음 리셋까지 시간
    const timeUntilReset = Math.max(0, (record.lastSubmission + 60 * 60 * 1000) - now);
    
    return {
      dailyCount: record.count,
      hourlyCount,
      timeUntilReset,
      isBlocked: false
    };
    
  } catch (error) {
    console.error('제출 상태 확인 오류:', error);
    return { dailyCount: 0, hourlyCount: 0, timeUntilReset: 0, isBlocked: false };
  }
};

// 메모리 정리 (24시간 이상 된 레코드 삭제)
export const cleanupOldRecords = (): void => {
  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000;
  
  Object.keys(submissionRecords).forEach(userId => {
    const record = submissionRecords[userId];
    if (record.lastSubmission < cutoff) {
      delete submissionRecords[userId];
    }
  });
}; 