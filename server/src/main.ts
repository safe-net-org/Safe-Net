import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { AppModule } from './app.module'

const DEFAULT_PORT = 4200

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const frontendOrigins = [
		process.env.FRONTEND_URL,
		...(process.env.NODE_ENV === 'production'
			? []
			: ['http://localhost:3000', 'http://127.0.0.1:3000']),
	].filter((origin): origin is string => Boolean(origin))

	app.setGlobalPrefix('api')
	app.use(helmet())
	app.use(cookieParser())

	// Applied globally: previously only two auth endpoints opted in via
	// @UsePipes, so every admin and learning DTO carried class-validator
	// decorators that never actually ran.
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		})
	)

	app.enableCors({
		origin: [...new Set(frontendOrigins)],
		credentials: true,
		exposedHeaders: 'set-cookie',
	})

	// HttpOnly auth cookies are not readable by XSS, so reject unsafe browser
	// requests from origins other than the configured frontend as CSRF defense.
	app.use((req, res, next) => {
		if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next()
		const origin = req.get('origin')
		const hasAuthCookie = Boolean(
			req.cookies?.access_token || req.cookies?.refresh_token
		)
		if (
			(origin && !frontendOrigins.includes(origin)) ||
			(!origin && hasAuthCookie)
		) {
			return res.status(403).json({ message: 'Untrusted request origin' })
		}
		next()
	})

	await app.listen(process.env.PORT ?? DEFAULT_PORT)
}
bootstrap()
