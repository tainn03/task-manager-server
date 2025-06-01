import { Router, Request, Response, NextFunction } from "express";
import { DIContainer } from "../config/DIContainer";
import { IAuthService } from "../interfaces/IAuthService";
import {
  validateRequest,
  authValidation,
} from "../middleware/validationMiddleware";
import { ResponseHelper, ResponseTransformer } from "../utils/ResponseHelper";
import { RegisterRequestDto, LoginRequestDto } from "../dtos/auth.dto";

const router = Router();
const container = DIContainer.getInstance();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Register
router.post(
  "/register",
  validateRequest(authValidation.register),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password }: RegisterRequestDto = req.body;

      const authService = container.resolve<IAuthService>("AuthService");
      await authService.register(email, password);

      ResponseHelper.created(res, undefined, "User registered successfully");
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Login
router.post(
  "/login",
  validateRequest(authValidation.login),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password }: LoginRequestDto = req.body;

      const authService = container.resolve<IAuthService>("AuthService");
      const token = await authService.login(email, password);

      ResponseHelper.success(
        res,
        ResponseTransformer.transformAuthSuccess(token)
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                     message:
 *                       type: string
 *                       example: Logged out successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Logout
router.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (token) {
        const authService = container.resolve<IAuthService>("AuthService");
        await authService.logout(token);
      }

      ResponseHelper.success(
        res,
        ResponseTransformer.transformAuthMessage("Logged out successfully")
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
