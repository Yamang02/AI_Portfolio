import { Router } from 'express';
import { getChatbotResponse } from '../../backend/services/geminiService.js';

const router = Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: AI 챗봇 응답 생성
 *     description: 사용자 질문에 대한 AI 챗봇 응답을 생성합니다.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: 사용자 질문
 *                 example: "AI 포트폴리오 챗봇 프로젝트에 대해 알려줘"
 *               selectedProject:
 *                 type: string
 *                 description: 선택된 프로젝트 (선택사항)
 *                 example: "AI 포트폴리오 챗봇"
 *     responses:
 *       200:
 *         description: 성공적으로 응답을 생성했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   description: AI 챗봇 응답
 *                   example: "AI 포트폴리오 챗봇은 Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇입니다..."
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: 잘못된 요청입니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "Question is required"
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 message:
 *                   type: string
 *                   example: "Failed to generate response"
 */
router.post('/', async (req, res) => {
  try {
    const { question, selectedProject } = req.body;

    // 입력 검증
    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Question is required and must be a string'
      });
    }

    // 질문 길이 제한
    if (question.length > 1000) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Question is too long (max 1000 characters)'
      });
    }

    // AI 응답 생성
    const response = await getChatbotResponse(question, selectedProject);

    // 응답 검증
    if (response === 'I_CANNOT_ANSWER') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Unable to generate response for this question'
      });
    }

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate response'
    });
  }
});

export default router; 