-- 기술 스택 메타데이터 초기 데이터 삽입

-- 프로그래밍 언어 (is_core = true)
INSERT INTO tech_stack_metadata (name, display_name, category, level, is_core, color_hex, description, sort_order) VALUES
('Java', 'Java', 'language', 'core', true, '#ED8B00', '객체지향 프로그래밍 언어, Spring Boot 프레임워크와 함께 사용', 1),
('JavaScript', 'JavaScript', 'language', 'core', true, '#F7DF1E', '웹 개발의 핵심 언어, 프론트엔드와 백엔드 모두 지원', 2),
('TypeScript', 'TypeScript', 'language', 'core', true, '#3178C6', 'JavaScript의 타입 안전 슈퍼셋', 3),
('Python', 'Python', 'language', 'core', true, '#3776AB', '데이터 분석, AI/ML, 웹 개발에 활용되는 다목적 언어', 4),
('C#', 'C#', 'language', 'core', true, '#239120', 'Microsoft .NET 플랫폼의 주요 언어', 5),
('C', 'C', 'language', 'core', true, '#A8B9CC', '시스템 프로그래밍 언어', 6),
('C++', 'C++', 'language', 'core', true, '#00599C', '객체지향 시스템 프로그래밍 언어', 7),
('Go', 'Go', 'language', 'core', true, '#00ADD8', 'Google이 개발한 현대적 시스템 프로그래밍 언어', 8),
('Rust', 'Rust', 'language', 'core', true, '#000000', '안전성과 성능에 초점을 둔 시스템 프로그래밍 언어', 9),
('Kotlin', 'Kotlin', 'language', 'core', true, '#7F52FF', 'JVM 기반의 현대적 프로그래밍 언어', 10),
('Swift', 'Swift', 'language', 'core', true, '#FA7343', 'Apple 플랫폼을 위한 프로그래밍 언어', 11);

-- 주요 프레임워크 (is_core = true)
INSERT INTO tech_stack_metadata (name, display_name, category, level, is_core, color_hex, description, sort_order) VALUES
('Spring Boot', 'Spring Boot', 'framework', 'core', true, '#6DB33F', 'Java 기반 웹 애플리케이션 개발 프레임워크', 20),
('React', 'React', 'framework', 'core', true, '#61DAFB', 'Facebook에서 개발한 JavaScript UI 라이브러리', 21),
('Vue.js', 'Vue.js', 'framework', 'core', true, '#4FC08D', '프로그레시브 JavaScript 프레임워크', 22),
('Angular', 'Angular', 'framework', 'core', true, '#DD0031', 'Google에서 개발한 TypeScript 기반 프레임워크', 23),
('Next.js', 'Next.js', 'framework', 'core', true, '#000000', 'React 기반 풀스택 프레임워크', 24),
('Express.js', 'Express.js', 'framework', 'core', true, '#000000', 'Node.js를 위한 웹 애플리케이션 프레임워크', 25),
('Django', 'Django', 'framework', 'core', true, '#092E20', 'Python 웹 프레임워크', 26),
('Flask', 'Flask', 'framework', 'core', true, '#000000', 'Python 마이크로 웹 프레임워크', 27),
('FastAPI', 'FastAPI', 'framework', 'core', true, '#009688', '현대적인 Python 웹 프레임워크', 28),
('Nest.js', 'Nest.js', 'framework', 'core', true, '#E0234E', 'TypeScript 기반 Node.js 프레임워크', 29),
('ASP.NET', 'ASP.NET', 'framework', 'core', true, '#512BD4', 'Microsoft .NET 웹 프레임워크', 30),
('.NET', '.NET', 'framework', 'core', true, '#512BD4', 'Microsoft 개발 플랫폼', 31),
('Laravel', 'Laravel', 'framework', 'core', true, '#FF2D20', 'PHP 웹 애플리케이션 프레임워크', 32),
('Spring', 'Spring', 'framework', 'core', true, '#6DB33F', 'Java 엔터프라이즈 애플리케이션 프레임워크', 33),
('Node.js', 'Node.js', 'framework', 'core', true, '#339933', 'JavaScript 런타임 환경', 34);

-- 주요 데이터베이스 (is_core = true)
INSERT INTO tech_stack_metadata (name, display_name, category, level, is_core, color_hex, description, sort_order) VALUES
('MySQL', 'MySQL', 'database', 'core', true, '#4479A1', '오픈소스 관계형 데이터베이스', 40),
('PostgreSQL', 'PostgreSQL', 'database', 'core', true, '#4169E1', '오픈소스 객체-관계형 데이터베이스', 41),
('MongoDB', 'MongoDB', 'database', 'core', true, '#47A248', 'NoSQL 문서 지향 데이터베이스', 42),
('Oracle', 'Oracle Database', 'database', 'core', true, '#F80000', '엔터프라이즈 관계형 데이터베이스', 43),
('Redis', 'Redis', 'database', 'core', true, '#DC382D', '인메모리 데이터 구조 저장소', 44),
('MSSQL', 'Microsoft SQL Server', 'database', 'core', true, '#CC2927', 'Microsoft SQL Server 데이터베이스', 45),
('MariaDB', 'MariaDB', 'database', 'core', true, '#003545', 'MySQL 기반 오픈소스 데이터베이스', 46),
('SQLite', 'SQLite', 'database', 'core', true, '#003B57', '경량 임베디드 데이터베이스', 47),
('DynamoDB', 'Amazon DynamoDB', 'database', 'core', true, '#4053D6', 'AWS NoSQL 데이터베이스 서비스', 48),
('Cassandra', 'Apache Cassandra', 'database', 'core', true, '#1287B1', '분산 NoSQL 데이터베이스', 49);

-- 기타 기술 스택 (is_core = false)
INSERT INTO tech_stack_metadata (name, display_name, category, level, is_core, color_hex, description, sort_order) VALUES
-- 프레임워크/라이브러리
('PyQt5', 'PyQt5', 'framework', 'learning', false, '#41CD52', 'Python용 GUI 프레임워크', 100),
('Phaser.js', 'Phaser.js', 'framework', 'learning', false, '#F7DF1E', 'HTML5 게임 개발 프레임워크', 101),
('jQuery', 'jQuery', 'library', 'general', false, '#0769AD', 'JavaScript 라이브러리', 102),
('DayPilot', 'DayPilot', 'library', 'learning', false, '#FF6C37', '캘린더/스케줄러 라이브러리', 103),

-- 플랫폼/런타임
('GCP', 'Google Cloud Platform', 'platform', 'general', false, '#4285F4', 'Google의 클라우드 컴퓨팅 플랫폼', 110),
('GitLab', 'GitLab', 'platform', 'general', false, '#FC6D26', 'Git 기반 DevOps 플랫폼', 111),

-- 도구
('Git', 'Git', 'tool', 'core', true, '#F05032', '분산 버전 관리 시스템', 120),
('Docker', 'Docker', 'tool', 'general', false, '#2496ED', '컨테이너화 플랫폼', 121),
('GitHub Actions', 'GitHub Actions', 'tool', 'general', false, '#2088FF', 'CI/CD 자동화 도구', 122),
('Maven', 'Maven', 'tool', 'general', false, '#C71A36', 'Java 프로젝트 빌드 도구', 123),
('Cursor', 'Cursor', 'tool', 'general', false, '#000000', 'AI 기반 코드 에디터', 124),
('SVN', 'SVN', 'vcs', 'general', false, '#809CC9', 'Apache Subversion 버전 관리 시스템', 125),

-- 웹 기술
('HTML', 'HTML', 'web', 'general', false, '#E34F26', '웹 페이지 구조를 정의하는 마크업 언어', 130),
('CSS', 'CSS', 'web', 'general', false, '#1572B6', '웹 페이지 스타일링 언어', 131),
('JSP', 'JSP', 'web', 'general', false, '#FF6C37', 'Java Server Pages', 132),
('Servlet', 'Servlet', 'web', 'general', false, '#FF6C37', 'Java 웹 애플리케이션 컴포넌트', 133),

-- API/서비스
('REST API', 'REST API', 'api', 'general', false, '#FF6C37', 'REST 아키텍처 스타일의 API', 140),
('Google Gemini API', 'Google Gemini API', 'api', 'learning', false, '#4285F4', 'Google의 AI 모델 API', 141),
('GitHub API', 'GitHub API', 'api', 'general', false, '#181717', 'GitHub 서비스 API', 142),
('YouTube API', 'YouTube API', 'api', 'learning', false, '#FF0000', 'YouTube 데이터 API', 143),

-- AI/ML
('MediaPipe', 'MediaPipe', 'ai_ml', 'learning', false, '#FF6C37', 'Google의 미디어 파이프라인 프레임워크', 150),
('OpenCV', 'OpenCV', 'ai_ml', 'learning', false, '#5C3EE8', '컴퓨터 비전 라이브러리', 151),
('NumPy', 'NumPy', 'ai_ml', 'learning', false, '#013243', 'Python 수치 계산 라이브러리', 152),
('Deepface', 'Deepface', 'ai_ml', 'learning', false, '#FF6C37', '얼굴 인식 라이브러리', 153),

-- 테스팅/스크래핑
('Selenium', 'Selenium', 'testing', 'learning', false, '#43B02A', '웹 애플리케이션 테스팅 도구', 160),
('ChromeDriver', 'ChromeDriver', 'testing', 'learning', false, '#4285F4', 'Chrome 브라우저 자동화 도구', 161),
('BeautifulSoup', 'BeautifulSoup', 'scraping', 'learning', false, '#FF6C37', 'HTML/XML 파싱 라이브러리', 162),
('Requests', 'Requests', 'library', 'general', false, '#FF6C37', 'Python HTTP 라이브러리', 163),

-- 기타
('yt-dlp', 'yt-dlp', 'utility', 'learning', false, '#FF0000', 'YouTube 다운로더', 170),
('Cloudinary', 'Cloudinary', 'service', 'learning', false, '#3448C5', '클라우드 이미지 관리 서비스', 171),
('EJS', 'EJS', 'template', 'learning', false, '#A91E50', 'JavaScript 템플릿 엔진', 172),
('PL/SQL', 'PL/SQL', 'database', 'general', false, '#F80000', 'Oracle 데이터베이스 절차적 언어', 173),
('SAP', 'SAP', 'erp', 'general', false, '#0FAAFF', '기업 자원 계획 시스템', 174),
('Oracle Forms', 'Oracle Forms', 'framework', 'general', false, '#F80000', 'Oracle 데이터베이스 애플리케이션 개발 도구', 175),
('File System', 'File System', 'system', 'general', false, '#666666', '파일 시스템 조작', 176),
('Gemini CLI', 'Gemini CLI', 'tool', 'learning', false, '#4285F4', 'Google Gemini 명령줄 인터페이스', 177),
('CLI', 'Command Line Interface', 'system', 'general', false, '#666666', '명령줄 인터페이스', 178),
('JSON', 'JSON', 'data', 'general', false, '#000000', 'JavaScript Object Notation 데이터 형식', 179),
('Web Scraping', 'Web Scraping', 'technique', 'general', false, '#FF6C37', '웹 데이터 수집 기술', 180),
('GitHub Pages', 'GitHub Pages', 'hosting', 'learning', false, '#181717', 'GitHub 정적 사이트 호스팅', 181);
