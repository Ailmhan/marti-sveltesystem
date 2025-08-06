// Базовые типы из OpenAPI схемы
export interface School {
	id: number;
	nameRu: string;
	nameKz: string;
	email: string;
	addressRu?: string;
	addressKz?: string;
	descriptionRu?: string;
	descriptionKz?: string;
	logoUrl?: string;
}

// Типы запросов из OpenAPI схемы
export interface CreateSchoolRequest {
	nameRu: string;
	nameKz: string;
	email: string;
	password: string;
	addressRu?: string;
	addressKz?: string;
	descriptionRu?: string;
	descriptionKz?: string;
	logoUrl?: string;
}

export interface UpdateSchoolRequest {
	nameRu?: string;
	nameKz?: string;
	email?: string;
	addressRu?: string;
	addressKz?: string;
	descriptionRu?: string;
	descriptionKz?: string;
	logoUrl?: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
}

// Аутентификация
export interface AuthResponse {
	token: string;
}

// Ошибки API
export interface ApiError {
	statusCode: number;
	message: string | string[];
	error: string;
}

// Типы для API ответов (согласно Swagger)
export interface News {
	id: number;
	schoolId: number;
	titleRu: string;
	titleKz: string;
	contentRu: string;
	contentKz: string;
	imageUrl?: string;
	createdAt: string; // API возвращает строку, не Date
}

// Тип для ответа API новостей по языку (упрощенный формат)
export interface NewsApiResponse {
	id: number;
	schoolId: number;
	title: string; // API возвращает только title, не titleRu/titleKz
	content: string; // API возвращает только content, не contentRu/contentKz
	imageUrl: string | null;
	createdAt: string;
}

export interface HonorBoard {
	id: number;
	schoolId: number;
	studentName: string;
	descriptionRu: string;
	descriptionKz: string;
	imageUrl?: string;
}

// Type for API honor board response by language (simplified format)
export interface HonorBoardApiResponse {
	id: number;
	schoolId: number;
	studentName: string;
	description: string; // API returns only description, not descriptionRu/descriptionKz
	imageUrl: string | null;
}

export interface Section {
	id: number;
	schoolId: number;
	nameRu: string;
	nameKz: string;
	scheduleRu: string;
	scheduleKz: string;
	teacher: string;
	teacherId?: number;
	imageUrl?: string;
}

// Тип для ответа API секций по языку (упрощенный формат)
export interface SectionApiResponse {
	id: number;
	schoolId: number;
	name: string; // API возвращает только name, не nameRu/nameKz
	schedule: string; // API возвращает только schedule, не scheduleRu/scheduleKz
	teacher: string;
	imageUrl: string | null;
}

export interface CanteenMenu {
	id: number;
	schoolId: number;
	date: string; // API возвращает строку, не Date
	dishesRu: {
		breakfast: string;
		lunch: string;
		dinner: string;
	};
	dishesKz: {
		breakfast: string;
		lunch: string;
		dinner: string;
	};
	imageUrl?: string;
}

// Тип для ответа API меню по языку (упрощенный формат)
export interface CanteenMenuApiResponse {
	id: number;
	schoolId: number;
	date: string;
	dishes: {
		breakfast: string;
		lunch: string;
		dinner: string;
	};
	imageUrl: string | null;
}

export interface Schedule {
	id: number;
	schoolId: number;
	teacherId: number;
	classId: number;
	subjectRu: string;
	subjectKz: string;
	date: Date;
	startTime: string;
	endTime: string;
	roomRu: string;
	roomKz: string;
	School?: School;
	Teacher?: Teacher;
	Class?: Class;
}

export interface Teacher {
	id: number;
	schoolId: number;
	nameRu: string;
	nameKz: string;
	subjectRu: string;
	subjectKz: string;
	phone: string;
	email: string;
	birthday: string; // API возвращает строку, не Date
	imageUrl?: string;
	School?: School;
}

export interface Class {
	id: number;
	schoolId: number;
	grade: number;
	letter: string;
	teacherId: number;
	School?: School;
	Teacher?: Teacher;
	Schedule?: Schedule[];
} 