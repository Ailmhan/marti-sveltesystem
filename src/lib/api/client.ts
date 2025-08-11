import { get } from 'svelte/store';
import { API_BASE_URL } from '$lib/constants';
import type {
	School, News, HonorBoard, Section, CanteenMenu,
	Schedule, Teacher, Class, AuthResponse, AuthMeResponse, ApiError,
	CreateSchoolRequest, UpdateSchoolRequest, LoginRequest, LoginResponse,
	NewsApiResponse, SectionApiResponse, CanteenMenuApiResponse, HonorBoardApiResponse
} from '$lib/types/api';

class ApiClient {
	private baseUrl = API_BASE_URL;

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...options.headers as Record<string, string>,
		};

		// Get token from localStorage
		let token = null;
		if (typeof window !== 'undefined') {
			token = localStorage.getItem('authToken');
		}

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(url, {
			...options,
			headers,
		});

		if (!response.ok) {
			// If 401, clear token
			if (response.status === 401) {
				if (typeof window !== 'undefined') {
					localStorage.removeItem('authToken');
				}
				throw new Error('Unauthorized - please login again');
			}

			const errorData: ApiError = await response.json().catch(() => ({
				statusCode: response.status,
				message: response.statusText,
				error: 'Unknown Error'
			}));
			throw new Error(Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message);
		}

		// Handle empty responses (e.g., 204 No Content for DELETE operations)
		if (response.status === 204 || !response.headers.get('content-length') || response.headers.get('content-length') === '0') {
			return undefined as T;
		}

		// Check if response has content-type application/json
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			return response.json();
		}

		// For non-JSON responses, return the text content
		const text = await response.text();
		return (text === '' ? undefined : text) as T;
	}

	// Аутентификация
	async login(email: string, password: string): Promise<LoginResponse> {
		const response = await this.request<LoginResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password } as LoginRequest),
		});
		return response;
	}

	async getMe(): Promise<AuthMeResponse> {
		return this.request<AuthMeResponse>('/auth/me');
	}

	// Школы
	async createSchool(school: CreateSchoolRequest): Promise<School> {
		return this.request<School>('/school', {
			method: 'POST',
			body: JSON.stringify(school),
		});
	}

	async getSchools(): Promise<School[]> {
		return this.request<School[]>('/school');
	}

	async getSchool(id: number): Promise<School> {
		return this.request<School>(`/school/${id}`);
	}

	async updateSchool(id: number, school: UpdateSchoolRequest): Promise<School> {
		return this.request<School>(`/school/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(school),
		});
	}

	async deleteSchool(id: number): Promise<void> {
		return this.request<void>(`/school/${id}`, {
			method: 'DELETE',
		});
	}

	// Новости
	async getNews(schoolId?: number, language?: 'ru' | 'kz'): Promise<News[]> {
		if (!schoolId) {
			throw new Error('School ID is required');
		}

		try {
			const endpoint = language 
				? `/news/school/${schoolId}/lang/${language}`
				: `/news/school/${schoolId}`;
			const apiResponse = await this.request<NewsApiResponse[]>(endpoint);
			
			// Преобразуем API ответ в наш формат
			return apiResponse.map(item => {
				// Проверяем, есть ли отдельные поля для языков
				if ('titleRu' in item && 'titleKz' in item) {
					return {
						id: item.id,
						schoolId: item.schoolId,
						titleRu: item.titleRu || '',
						titleKz: item.titleKz || '',
						contentRu: item.contentRu || '',
						contentKz: item.contentKz || '',
						imageUrl: item.imageUrl || undefined,
						createdAt: item.createdAt
					};
				} else {
					// Если API возвращает только один язык
					return {
						id: item.id,
						schoolId: item.schoolId,
						titleRu: item.title || '',
						titleKz: item.title || '',
						contentRu: item.content || '',
						contentKz: item.content || '',
						imageUrl: item.imageUrl || undefined,
						createdAt: item.createdAt
					};
				}
			});
		} catch (error) {
			console.error('Error fetching news:', error);
			throw error;
		}
	}

	async getNewsById(id: number, language?: 'ru' | 'kz'): Promise<News> {
		if (language) {
			const apiResponse = await this.request<NewsApiResponse>(`/news/${id}/lang/${language}`);
			return {
				id: apiResponse.id,
				schoolId: apiResponse.schoolId,
				titleRu: apiResponse.title || '',
				titleKz: apiResponse.title || '',
				contentRu: apiResponse.content || '',
				contentKz: apiResponse.content || '',
				imageUrl: apiResponse.imageUrl || undefined,
				createdAt: apiResponse.createdAt
			};
		} else {
			return this.request<News>(`/news/${id}`);
		}
	}

	async createNews(news: Omit<News, 'id' | 'createdAt'>): Promise<News> {
		return this.request<News>('/news', {
			method: 'POST',
			body: JSON.stringify(news),
		});
	}

	async updateNews(id: number, news: Partial<Omit<News, 'id' | 'createdAt'>>): Promise<News> {
		return this.request<News>(`/news/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(news),
		});
	}

	async deleteNews(id: number): Promise<void> {
		return this.request<void>(`/news/${id}`, {
			method: 'DELETE',
		});
	}

	// Учителя
	async getTeachers(schoolId?: number): Promise<Teacher[]> {
		if (!schoolId) {
			throw new Error('School ID is required');
		}

		try {
			return this.request<Teacher[]>(`/teachers/school/${schoolId}`);
		} catch (error) {
			console.error('Error fetching teachers:', error);
			throw error;
		}
	}

	async getTeacher(id: number): Promise<Teacher> {
		return this.request<Teacher>(`/teachers/${id}`);
	}

	async getTeacherBirthdays(schoolId: number) {
		return this.request(`/teachers/birthdays/school/${schoolId}`);
	}

	async getTeacherSchedule(teacherId: number) {
		return this.request(`/schedule/teacher/${teacherId}`);
	}

	async createTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
		return this.request<Teacher>('/teachers', {
			method: 'POST',
			body: JSON.stringify(teacher),
		});
	}

	async updateTeacher(id: number, teacher: Partial<Omit<Teacher, 'id'>>): Promise<Teacher> {
		return this.request<Teacher>(`/teachers/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(teacher),
		});
	}

	async deleteTeacher(id: number): Promise<void> {
		return this.request<void>(`/teachers/${id}`, {
			method: 'DELETE',
		});
	}

	// Секции
	async getSections(schoolId?: number, language?: 'ru' | 'kz'): Promise<Section[]> {
		if (!schoolId) {
			throw new Error('School ID is required');
		}

		try {
			const endpoint = language 
				? `/section/school/${schoolId}/lang/${language}`
				: `/section/school/${schoolId}`;
			const apiResponse = await this.request<SectionApiResponse[]>(endpoint);
			
			// Преобразуем API ответ в наш формат
			return apiResponse.map(item => {
				if ('nameRu' in item && 'nameKz' in item) {
					return {
						id: item.id,
						schoolId: item.schoolId,
						nameRu: item.nameRu || '',
						nameKz: item.nameKz || '',
						scheduleRu: item.scheduleRu || '',
						scheduleKz: item.scheduleKz || '',
						teacher: item.teacher || '',
						imageUrl: item.imageUrl || undefined
					};
				} else {
					return {
						id: item.id,
						schoolId: item.schoolId,
						nameRu: item.name || '',
						nameKz: item.name || '',
						scheduleRu: item.schedule || '',
						scheduleKz: item.schedule || '',
						teacher: item.teacher || '',
						imageUrl: item.imageUrl || undefined
					};
				}
			});
		} catch (error) {
			console.error('Error fetching sections:', error);
			throw error;
		}
	}

	async getSection(id: number): Promise<Section> {
		return this.request<Section>(`/section/${id}`);
	}

	async createSection(section: Omit<Section, 'id'>): Promise<Section> {
		return this.request<Section>('/section', {
			method: 'POST',
			body: JSON.stringify(section),
		});
	}

	async updateSection(id: number, section: Partial<Omit<Section, 'id'>>): Promise<Section> {
		return this.request<Section>(`/section/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(section),
		});
	}

	async deleteSection(id: number): Promise<void> {
		return this.request<void>(`/section/${id}`, {
			method: 'DELETE',
		});
	}

	// Меню столовой
	async getCanteenMenu(schoolId?: number, language?: 'ru' | 'kz'): Promise<CanteenMenu[]> {
		if (!schoolId) {
			throw new Error('School ID is required');
		}

		try {
			const endpoint = language 
				? `/canteen-menu/school/${schoolId}/lang/${language}`
				: `/canteen-menu/school/${schoolId}`;
			const apiResponse = await this.request<CanteenMenuApiResponse[]>(endpoint);
			
			// Преобразуем API ответ в наш формат
			return apiResponse.map(item => {
				if ('dishesRu' in item && 'dishesKz' in item) {
					return {
						id: item.id,
						schoolId: item.schoolId,
						date: item.date,
						dishesRu: item.dishesRu || { breakfast: '', lunch: '', dinner: '' },
						dishesKz: item.dishesKz || { breakfast: '', lunch: '', dinner: '' },
						imageUrl: item.imageUrl || undefined
					};
				} else {
					return {
						id: item.id,
						schoolId: item.schoolId,
						date: item.date,
						dishesRu: item.dishes || { breakfast: '', lunch: '', dinner: '' },
						dishesKz: item.dishes || { breakfast: '', lunch: '', dinner: '' },
						imageUrl: item.imageUrl || undefined
					};
				}
			});
		} catch (error) {
			console.error('Error fetching canteen menu:', error);
			throw error;
		}
	}

	async getCanteenMenuItem(id: number): Promise<CanteenMenu> {
		return this.request<CanteenMenu>(`/canteen-menu/${id}`);
	}

	async createCanteenMenu(menu: Omit<CanteenMenu, 'id'>): Promise<CanteenMenu> {
		return this.request<CanteenMenu>('/canteen-menu', {
			method: 'POST',
			body: JSON.stringify(menu),
		});
	}

	async updateCanteenMenu(id: number, menu: Partial<Omit<CanteenMenu, 'id'>>): Promise<CanteenMenu> {
		return this.request<CanteenMenu>(`/canteen-menu/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(menu),
		});
	}

	async deleteCanteenMenu(id: number): Promise<void> {
		return this.request<void>(`/canteen-menu/${id}`, {
			method: 'DELETE',
		});
	}

	// Классы
	async getClasses(schoolId?: number): Promise<Class[]> {
		if (!schoolId) {
			throw new Error('School ID is required');
		}
		return this.request<Class[]>(`/classes/school/${schoolId}`);
	}

	async getClass(id: number): Promise<Class> {
		return this.request<Class>(`/classes/${id}`);
	}

	async createClass(classData: Omit<Class, 'id'>): Promise<Class> {
		return this.request<Class>('/classes', {
			method: 'POST',
			body: JSON.stringify(classData),
		});
	}

	async updateClass(id: number, classData: Partial<Omit<Class, 'id'>>): Promise<Class> {
		return this.request<Class>(`/classes/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(classData),
		});
	}

	async deleteClass(id: number): Promise<void> {
		return this.request<void>(`/classes/${id}`, {
			method: 'DELETE',
		});
	}

	// Расписание
	async getSchedule(schoolId?: number, teacherId?: number, classId?: number): Promise<Schedule[]> {
		let endpoint = '/schedule';
		if (schoolId) {
			endpoint += `/school/${schoolId}`;
		}
		if (teacherId) {
			endpoint += `/teacher/${teacherId}`;
		}
		if (classId) {
			endpoint += `/class/${classId}`;
		}
		return this.request<Schedule[]>(endpoint);
	}

	async getScheduleItem(id: number): Promise<Schedule> {
		return this.request<Schedule>(`/schedule/${id}`);
	}

	async createSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
		return this.request<Schedule>('/schedule', {
			method: 'POST',
			body: JSON.stringify(schedule),
		});
	}

	async updateSchedule(id: number, schedule: Partial<Omit<Schedule, 'id'>>): Promise<Schedule> {
		return this.request<Schedule>(`/schedule/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(schedule),
		});
	}

	async deleteSchedule(id: number): Promise<void> {
		return this.request<void>(`/schedule/${id}`, {
			method: 'DELETE',
		});
	}

	// Доска почета
	async getHonorBoard(schoolId?: number, language?: 'ru' | 'kz'): Promise<HonorBoard[]> {
		if (!schoolId) {
			throw new Error('School ID is required');
		}

		try {
			const endpoint = language 
				? `/honor-board/school/${schoolId}/lang/${language}`
				: `/honor-board/school/${schoolId}`;
			const apiResponse = await this.request<HonorBoardApiResponse[]>(endpoint);
			
			// Преобразуем API ответ в наш формат
			return apiResponse.map(item => {
				if ('descriptionRu' in item && 'descriptionKz' in item) {
					return {
						id: item.id,
						schoolId: item.schoolId,
						studentName: item.studentName || '',
						descriptionRu: item.descriptionRu || '',
						descriptionKz: item.descriptionKz || '',
						imageUrl: item.imageUrl || undefined
					};
				} else {
					return {
						id: item.id,
						schoolId: item.schoolId,
						studentName: item.studentName || '',
						descriptionRu: item.description || '',
						descriptionKz: item.description || '',
						imageUrl: item.imageUrl || undefined
					};
				}
			});
		} catch (error) {
			console.error('Error fetching honor board:', error);
			throw error;
		}
	}

	async getHonorBoardItem(id: number): Promise<HonorBoard> {
		return this.request<HonorBoard>(`/honor-board/${id}`);
	}

	async createHonorBoard(honorBoard: Omit<HonorBoard, 'id'>): Promise<HonorBoard> {
		return this.request<HonorBoard>('/honor-board', {
			method: 'POST',
			body: JSON.stringify(honorBoard),
		});
	}

	async updateHonorBoard(id: number, honorBoard: Partial<Omit<HonorBoard, 'id'>>): Promise<HonorBoard> {
		return this.request<HonorBoard>(`/honor-board/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(honorBoard),
		});
	}

	async deleteHonorBoard(id: number): Promise<void> {
		return this.request<void>(`/honor-board/${id}`, {
			method: 'DELETE',
		});
	}
}

export const apiClient = new ApiClient(); 