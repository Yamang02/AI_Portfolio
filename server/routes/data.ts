import { Router, Request, Response } from 'express';
import { EXPERIENCES, EDUCATIONS } from '../../backend/data/experiences.js';
import { CERTIFICATIONS } from '../../backend/data/certifications.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Experience:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 경력 고유 ID
 *           example: "exp-001"
 *         title:
 *           type: string
 *           description: 회사/기관명
 *           example: "(주)디아이티"
 *         description:
 *           type: string
 *           description: 경력 설명
 *           example: "노루그룹 전산 계열사에서 ERP, 웹사이트 유지보수 및 IT외주 관리 등을 담당했습니다."
 *         technologies:
 *           type: array
 *           items:
 *             type: string
 *           description: 사용된 기술 스택
 *           example: ["Oracle Forms", "PL/SQL", "Java"]
 *         organization:
 *           type: string
 *           description: 조직명
 *           example: "디아이티"
 *         role:
 *           type: string
 *           description: 직책
 *           example: "ERP 개발/유지보수 엔지니어"
 *         startDate:
 *           type: string
 *           format: date
 *           description: 시작 날짜 (YYYY-MM)
 *           example: "2023-07"
 *         endDate:
 *           type: string
 *           format: date
 *           description: 종료 날짜 (YYYY-MM), 현재 재직 중이면 null
 *           example: "2025-01"
 *         type:
 *           type: string
 *           enum: [career]
 *           description: 경력 타입
 *         mainResponsibilities:
 *           type: array
 *           items:
 *             type: string
 *           description: 주요 담당 업무
 *         achievements:
 *           type: array
 *           items:
 *             type: string
 *           description: 주요 성과/업적
 *         projects:
 *           type: array
 *           items:
 *             type: string
 *           description: 담당했던 주요 프로젝트
 *     
 *     Education:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 교육 고유 ID
 *           example: "edu-001"
 *         title:
 *           type: string
 *           description: 교육 과정명
 *           example: "Sesac"
 *         description:
 *           type: string
 *           description: 교육 과정 설명
 *           example: "Cloud 기반 Multi Modal AI 개발자 양성 과정 with Google Cloud"
 *         technologies:
 *           type: array
 *           items:
 *             type: string
 *           description: 학습한 기술 스택
 *           example: ["Python", "PyQt5", "Cursor"]
 *         organization:
 *           type: string
 *           description: 교육 기관
 *           example: "Sesac 강동지점"
 *         startDate:
 *           type: string
 *           format: date
 *           description: 시작 날짜 (YYYY-MM)
 *           example: "2025-06"
 *         endDate:
 *           type: string
 *           format: date
 *           description: 종료 날짜 (YYYY-MM), 현재 수강 중이면 null
 *         type:
 *           type: string
 *           enum: [education]
 *           description: 교육 타입
 *         projects:
 *           type: array
 *           items:
 *             type: string
 *           description: 교육 중 진행한 프로젝트
 *     
 *     Certification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 자격증 고유 ID
 *           example: "cert-001"
 *         title:
 *           type: string
 *           description: 자격증명
 *           example: "SAP Certified Associate - Back-End Developer - ABAP"
 *         description:
 *           type: string
 *           description: 자격증 설명
 *         technologies:
 *           type: array
 *           items:
 *             type: string
 *           description: 관련 기술
 *           example: ["SAP", "ABAP", "Backend Development"]
 *         issuer:
 *           type: string
 *           description: 발급 기관
 *           example: "SAP"
 *         startDate:
 *           type: string
 *           format: date
 *           description: 취득 날짜 (YYYY-MM)
 *           example: "2024-10"
 */

/**
 * @swagger
 * /api/data/experiences:
 *   get:
 *     summary: 경력 정보 조회
 *     description: 포트폴리오의 모든 경력 정보를 조회합니다.
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: 성공적으로 경력 정보를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Experience'
 *                 count:
 *                   type: number
 *                   description: 경력 항목 개수
 *                   example: 3
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 */
router.get('/experiences', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: EXPERIENCES,
      count: EXPERIENCES.length
    });

  } catch (error) {
    console.error('Experiences API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch experiences'
    });
  }
});

/**
 * @swagger
 * /api/data/education:
 *   get:
 *     summary: 교육 정보 조회
 *     description: 포트폴리오의 모든 교육 정보를 조회합니다.
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: 성공적으로 교육 정보를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Education'
 *                 count:
 *                   type: number
 *                   description: 교육 항목 개수
 *                   example: 2
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 */
router.get('/education', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: EDUCATIONS,
      count: EDUCATIONS.length
    });

  } catch (error) {
    console.error('Education API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch education'
    });
  }
});

/**
 * @swagger
 * /api/data/certifications:
 *   get:
 *     summary: 자격증 정보 조회
 *     description: 포트폴리오의 모든 자격증 정보를 조회합니다.
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: 성공적으로 자격증 정보를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Certification'
 *                 count:
 *                   type: number
 *                   description: 자격증 개수
 *                   example: 2
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 */
router.get('/certifications', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: CERTIFICATIONS,
      count: CERTIFICATIONS.length
    });

  } catch (error) {
    console.error('Certifications API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch certifications'
    });
  }
});

/**
 * @swagger
 * /api/data/all:
 *   get:
 *     summary: 모든 정적 데이터 조회
 *     description: 포트폴리오의 모든 정적 데이터(경력, 교육, 자격증)를 한 번에 조회합니다.
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: 성공적으로 모든 데이터를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     experiences:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Experience'
 *                     education:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Education'
 *                     certifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Certification'
 *                 counts:
 *                   type: object
 *                   properties:
 *                     experiences:
 *                       type: number
 *                       example: 3
 *                     education:
 *                       type: number
 *                       example: 2
 *                     certifications:
 *                       type: number
 *                       example: 2
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 */
router.get('/all', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        experiences: EXPERIENCES,
        education: EDUCATIONS,
        certifications: CERTIFICATIONS
      },
      counts: {
        experiences: EXPERIENCES.length,
        education: EDUCATIONS.length,
        certifications: CERTIFICATIONS.length
      }
    });

  } catch (error) {
    console.error('All Data API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch all data'
    });
  }
});

export default router; 