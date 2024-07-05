import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { configDotenv } from 'dotenv';

configDotenv();

@Injectable()
export class RabbitMQService {
	private readonly url = process.env.RABBIT_SERVICE_DEV;
	private readonly queue = process.env.RABBIT_PIPELINE_RUN_STEP_QUEUE;

	async sendMessage(message: any) {
		const connection = await amqp.connect(this.url);
		const channel = await connection.createChannel();
		await channel.assertQueue(this.queue);
		channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(message)));
		await channel.close();
		await connection.close();
	}
}
