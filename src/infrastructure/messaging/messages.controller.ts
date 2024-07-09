import { Body, Controller, Post } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Controller('messages')
export class MessagesController {
	constructor(private readonly rabbitMQService: RabbitMQService) {}

	@Post()
	async sendMessage(@Body() message: any) {
		await this.rabbitMQService.sendMessage(message);
		return { status: 'Message sent' };
	}
}
