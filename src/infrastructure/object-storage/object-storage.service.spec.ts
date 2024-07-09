import { Test, TestingModule } from '@nestjs/testing';
import { ObjectStorageService } from './object-storage.service';
import * as process from 'process';
import { Client } from 'minio';

describe('ObjectStorageService', () => {
	let service: ObjectStorageService;

	beforeEach(async () => {
		setupEnvironment();
		const module: TestingModule = await Test.createTestingModule({
			providers: [ObjectStorageService],
		}).compile();

		service = module.get<ObjectStorageService>(ObjectStorageService);
		// mock minioClient putObject
		service['minioClient'] = {
			putObject: jest.fn(async () => {}),
		} as unknown as Client;
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it("should't upload because file isn't an image", async () => {
		const mockFile = {
			fieldname: 'file',
			originalname: 'file.csv',
			mimetype: 'text/csv',
			buffer: Buffer.from(__dirname + '/../../TradeHistory.csv', 'utf8'),
			size: 12,
		} as Express.Multer.File;

		await expect(service.uploadFile(mockFile)).rejects.toThrow(
			'Invalid file type'
		);
	});

	it("shouldn't upload because file is too large", async () => {
		const mockFile = {
			fieldname: 'file',
			originalname: 'file.jpg',
			mimetype: 'image/jpeg',
			buffer: Buffer.from(__dirname + '/../../TradeHistory.csv', 'utf8'),
			size: Number(process.env.MAX_FILE_SIZE) + 1,
		} as Express.Multer.File;

		await expect(service.uploadFile(mockFile)).rejects.toThrow(
			'File too large'
		);
	});

	it('should upload file', async () => {
		const mockFile = {
			fieldname: 'file',
			originalname: 'file.jpg',
			mimetype: 'image/jpeg',
			buffer: Buffer.from(__dirname + '/../../TradeHistory.csv', 'utf8'),
			size: 12,
		} as Express.Multer.File;

		const fileName = await service.uploadFile(mockFile);
		expect(fileName).toBeDefined();
	});
});

function setupEnvironment() {
	process.env.OBJECT_STORAGE_ENDPOINT = 'localhost';
	process.env.OBJECT_STORAGE_PORT = '9000';
	process.env.OBJECT_STORAGE_ACCESS_KEY = 'minio';
	process.env.OBJECT_STORAGE_SECRET_KEY = 'min';
	process.env.OBJECT_STORAGE_BUCKET = 'test';
	process.env.ENVIROMENT = 'development';
	process.env.MAX_FILE_SIZE = '2000000';
}
