// API Configuration
export const API_BASE_URL = 'https://walrus-app-fioy4.ondigitalocean.app/api';

// Test Credentials
export const TEST_CREDENTIALS = {
  email: 'school@example.com',
  password: 'password123'
};

// Language Options
export const LANGUAGES = {
  RU: 'ru',
  KZ: 'kz'
} as const;

// Common Form Initial States
export const INITIAL_NEWS = {
  titleRu: '',
  titleKz: '',
  contentRu: '',
  contentKz: '',
  imageUrl: ''
};

export const INITIAL_TEACHER = {
  nameRu: '',
  nameKz: '',
  subjectRu: '',
  subjectKz: '',
  email: '',
  phone: '',
  birthday: '',
  image: ''
};

export const INITIAL_CLASS = {
  grade: 1,
  letter: '',
  teacherId: 0
};

export const INITIAL_SECTION = {
  nameRu: '',
  nameKz: '',
  scheduleRu: '',
  scheduleKz: '',
  teacher: '',
  teacherId: 0,
  imageUrl: ''
};

// Page Titles
export const PAGE_TITLES = {
  DASHBOARD: 'Главная - Школьная система',
  NEWS: 'Новости - Школьная система',
  TEACHERS: 'Учителя - Школьная система',
  CLASSES: 'Классы - Школьная система',
  SCHEDULE: 'Расписание - Школьная система',
  SECTIONS: 'Секции - Школьная система',
  HONOR_BOARD: 'Доска почета - Школьная система',
  CANTEEN: 'Столовая - Школьная система',
  LOGIN: 'Вход - Школьная система',
  REGISTER: 'Регистрация - Школьная система'
} as const; 