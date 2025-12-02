import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/os'); // optional
 // --- ENABLE CORS: Allow ALL Origins ---
  app.enableCors({
    origin: '*',          // allow all origins
    methods: '*',         // allow all methods
    allowedHeaders: '*',  // allow all headers
    credentials: true,    // allow cookies / Authorization header
  });
  const config = new DocumentBuilder()
    .setTitle('Orders Service')
    .setDescription('API docs for Orders')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // http://localhost:3001/docs

  await app.listen(3002);
  console.log('Product service running on http://localhost:3002');
  console.log('Swagger docs at        http://localhost:3002/docs');
}
bootstrap();
