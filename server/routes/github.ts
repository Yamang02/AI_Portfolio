import { Router, Request, Response } from 'express';
import GitHubService from '../../backend/services/githubService.js';
import { appConfig } from '../../backend/config/app.config.js';

const router = Router();
const githubService = new GitHubService(appConfig.github.username);

/**
 * @swagger
 * components:
 *   schemas:
 *     GitHubRepo:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: GitHub 레포지토리 ID
 *           example: 123456789
 *         name:
 *           type: string
 *           description: 레포지토리 이름
 *           example: "AI_Portfolio"
 *         description:
 *           type: string
 *           description: 레포지토리 설명
 *           example: "AI 포트폴리오 챗봇 프로젝트"
 *         html_url:
 *           type: string
 *           description: GitHub URL
 *           example: "https://github.com/Yamang02/AI_Portfolio"
 *         homepage:
 *           type: string
 *           description: 홈페이지 URL
 *           example: "https://ai-portfolio-chatbot.vercel.app"
 *         topics:
 *           type: array
 *           items:
 *             type: string
 *           description: 레포지토리 토픽
 *           example: ["react", "typescript", "ai"]
 *         language:
 *           type: string
 *           description: 주요 프로그래밍 언어
 *           example: "TypeScript"
 *         stargazers_count:
 *           type: number
 *           description: 스타 수
 *           example: 5
 *         forks_count:
 *           type: number
 *           description: 포크 수
 *           example: 2
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 마지막 업데이트 시간
 *           example: "2024-01-15T10:30:00Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 생성 시간
 *           example: "2024-01-01T00:00:00Z"
 *         visibility:
 *           type: string
 *           description: 레포지토리 가시성
 *           example: "public"
 */

/**
 * @swagger
 * /api/github/repos:
 *   get:
 *     summary: GitHub 레포지토리 목록 조회
 *     description: 사용자의 GitHub 공개 레포지토리 목록을 조회합니다.
 *     tags: [GitHub]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [updated, created, pushed, full_name]
 *         description: 정렬 기준
 *         example: "updated"
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: 페이지당 레포지토리 수
 *         example: 30
 *     responses:
 *       200:
 *         description: 성공적으로 레포지토리 목록을 조회했습니다.
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
 *                     $ref: '#/components/schemas/GitHubRepo'
 *                 count:
 *                   type: number
 *                   description: 레포지토리 개수
 *                   example: 10
 *       404:
 *         description: GitHub 사용자를 찾을 수 없습니다.
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 */
router.get('/repos', async (req: Request, res: Response) => {
  try {
    const repos = await githubService.getUserRepos();

    res.json({
      success: true,
      data: repos,
      count: repos.length
    });

  } catch (error) {
    console.error('GitHub Repos API Error:', error);
    
    if (error instanceof Error && error.message.includes('404')) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'GitHub user not found'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch GitHub repositories'
    });
  }
});

/**
 * @swagger
 * /api/github/repos/{name}:
 *   get:
 *     summary: 특정 GitHub 레포지토리 상세 조회
 *     description: 레포지토리 이름으로 특정 GitHub 레포지토리의 상세 정보를 조회합니다.
 *     tags: [GitHub]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: 레포지토리 이름
 *         example: "AI_Portfolio"
 *     responses:
 *       200:
 *         description: 성공적으로 레포지토리 정보를 조회했습니다.
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
 *                     title:
 *                       type: string
 *                       description: 프로젝트 제목
 *                     description:
 *                       type: string
 *                       description: 프로젝트 설명
 *                     technologies:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 사용된 기술 스택
 *                     githubUrl:
 *                       type: string
 *                       description: GitHub URL
 *                     liveUrl:
 *                       type: string
 *                       description: 라이브 데모 URL
 *                     readme:
 *                       type: string
 *                       description: README 내용
 *                     portfolioInfo:
 *                       type: string
 *                       description: 포트폴리오 정보
 *                     stars:
 *                       type: number
 *                       description: 스타 수
 *                     forks:
 *                       type: number
 *                       description: 포크 수
 *                     updatedAt:
 *                       type: string
 *                       description: 마지막 업데이트 시간
 *       404:
 *         description: 레포지토리를 찾을 수 없습니다.
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 */
router.get('/repos/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const projectInfo = await githubService.getProjectInfo(name);

    if (!projectInfo) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Repository not found'
      });
    }

    res.json({
      success: true,
      data: projectInfo
    });

  } catch (error) {
    console.error('GitHub Repo Detail API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch repository details'
    });
  }
});

/**
 * @swagger
 * /api/github/user:
 *   get:
 *     summary: GitHub 사용자 정보 조회
 *     description: GitHub 사용자의 기본 정보를 조회합니다.
 *     tags: [GitHub]
 *     responses:
 *       200:
 *         description: 성공적으로 사용자 정보를 조회했습니다.
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
 *                     login:
 *                       type: string
 *                       description: GitHub 사용자명
 *                       example: "Yamang02"
 *                     name:
 *                       type: string
 *                       description: 실명
 *                       example: "이정준"
 *                     bio:
 *                       type: string
 *                       description: 자기소개
 *                     avatar_url:
 *                       type: string
 *                       description: 프로필 이미지 URL
 *                     public_repos:
 *                       type: number
 *                       description: 공개 레포지토리 수
 *                       example: 15
 *                     followers:
 *                       type: number
 *                       description: 팔로워 수
 *                       example: 10
 *                     following:
 *                       type: number
 *                       description: 팔로잉 수
 *                       example: 20
 *                     html_url:
 *                       type: string
 *                       description: GitHub 프로필 URL
 *       404:
 *         description: GitHub 사용자를 찾을 수 없습니다.
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 */
router.get('/user', async (req: Request, res: Response) => {
  try {
    const userInfo = await githubService.getUserInfo();

    if (!userInfo) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'GitHub user not found'
      });
    }

    res.json({
      success: true,
      data: userInfo
    });

  } catch (error) {
    console.error('GitHub User API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch GitHub user info'
    });
  }
});

export default router; 