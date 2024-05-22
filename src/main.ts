import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configDotenv } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

configDotenv();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const port = process.env.PORT || 3000;
	app.enableCors();
	app.useGlobalPipes(new ValidationPipe());

	const config = new DocumentBuilder()
		.setTitle('Pipe-It-In API')
		.setDescription('API for the Pipe-It-In backend')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(port);
	console.log(`Application is running on port:${port}`);
}

bootstrap().then();
