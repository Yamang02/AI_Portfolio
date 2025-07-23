import { Router, Request, Response } from 'express';
import { ALL_PROJECTS } from '../../backend/data/projects.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 프로젝트 고유 ID
 *           example: "proj-001"
 *         title:
 *           type: string
 *           description: 프로젝트 제목
 *           example: "AI 포트폴리오 챗봇"
 *         description:
 *           type: string
 *           description: 프로젝트 설명
 *           example: "Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇"
 *         technologies:
 *           type: array
 *           items:
 *             type: string
 *           description: 사용된 기술 스택
 *           example: ["React", "Google Gemini API", "TypeScript"]
 *         githubUrl:
 *           type: string
 *           description: GitHub 레포지토리 URL
 *           example: "https://github.com/Yamang02/AI_Portfolio"
 *         liveUrl:
 *           type: string
 *           description: 라이브 데모 URL
 *           example: "https://ai-portfolio-chatbot.vercel.app"
 *         imageUrl:
 *           type: string
 *           description: 프로젝트 이미지 URL
 *         readme:
 *           type: string
 *           description: README 내용
 *         type:
 *           type: string
 *           enum: [project, certification]
 *           description: 프로젝트 타입
 *         source:
 *           type: string
 *           enum: [github, local, certification]
 *           description: 데이터 소스
 *         startDate:
 *           type: string
 *           format: date
 *           description: 시작 날짜 (YYYY-MM)
 *           example: "2024-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: 종료 날짜 (YYYY-MM), 현재 진행 중이면 null
 *           example: "2024-03"
 *         isTeam:
 *           type: boolean
 *           description: 팀 프로젝트 여부
 *           example: false
 *         myContributions:
 *           type: array
 *           items:
 *             type: string
 *           description: 내 기여 내용 (팀 프로젝트인 경우)
 *         externalUrl:
 *           type: string
 *           description: 외부 링크 URL
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: 모든 프로젝트 목록 조회
 *     description: 포트폴리오의 모든 프로젝트 정보를 조회합니다.
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [project, certification]
 *         description: 프로젝트 타입으로 필터링
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [github, local, certification]
 *         description: 데이터 소스로 필터링
 *       - in: query
 *         name: isTeam
 *         schema:
 *           type: boolean
 *         description: 팀 프로젝트 여부로 필터링
 *     responses:
 *       200:
 *         description: 성공적으로 프로젝트 목록을 조회했습니다.
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
 *                     $ref: '#/components/schemas/Project'
 *                 count:
 *                   type: number
 *                   description: 프로젝트 개수
 *                   example: 4
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 */
router.get('/', (req: Request, res: Response) => {
  try {
    let projects = [...ALL_PROJECTS];

    // 필터링
    const { type, source, isTeam } = req.query;

    if (type) {
      projects = projects.filter(p => p.type === type);
    }

    if (source) {
      projects = projects.filter(p => p.source === source);
    }

    if (isTeam !== undefined) {
      const isTeamBool = isTeam === 'true';
      projects = projects.filter(p => p.isTeam === isTeamBool);
    }

    res.json({
      success: true,
      data: projects,
      count: projects.length
    });

  } catch (error) {
    console.error('Projects API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch projects'
    });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: 특정 프로젝트 상세 조회
 *     description: 프로젝트 ID로 특정 프로젝트의 상세 정보를 조회합니다.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 프로젝트 ID
 *         example: "proj-001"
 *     responses:
 *       200:
 *         description: 성공적으로 프로젝트 정보를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: 프로젝트를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 message:
 *                   type: string
 *                   example: "Project not found"
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = ALL_PROJECTS.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Project Detail API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch project details'
    });
  }
});

export default router; 