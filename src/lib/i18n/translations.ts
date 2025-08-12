export const t = {
	navigation: {
		home: {
			ru: 'Главная',
			kz: 'Басты бет'
		},
		news: {
			ru: 'Новости',
			kz: 'Жаңалықтар'
		},
		teachers: {
			ru: 'Учителя',
			kz: 'Мұғалімдер'
		},
		birthdays: {
			ru: 'Дни рождения',
			kz: 'Туған күндер'
		},
		honorBoard: {
			ru: 'Доска почета',
			kz: 'Құрмет тақтасы'
		},
		canteen: {
			ru: 'Меню',
			kz: 'Асхана'
		},
		schedule: {
			ru: 'Расписание',
			kz: 'Кесте'
		},
		classes: {
			ru: 'Классы',
			kz: 'Сыныптар'
		},
		adminMode: {
			ru: 'Режим администратора',
			kz: 'Әкімші режимі'
		},
		adminExit: {
			ru: 'Выйти из режима администратора',
			kz: 'Әкімші режимінен шығу'
		}
	},
	common: {
		loading: {
			ru: 'Загрузка...',
			kz: 'Жүктелуде...'
		},
		error: {
			ru: 'Ошибка',
			kz: 'Қате'
		},
		success: {
			ru: 'Успешно',
			kz: 'Сәтті'
		},
		save: {
			ru: 'Сохранить',
			kz: 'Сақтау'
		},
		cancel: {
			ru: 'Отмена',
			kz: 'Бас тарту'
		},
		edit: {
			ru: 'Редактировать',
			kz: 'Өңдеу'
		},
		delete: {
			ru: 'Удалить',
			kz: 'Жою'
		},
		close: {
			ru: 'Закрыть',
			kz: 'Жабу'
		},
		yes: {
			ru: 'Да',
			kz: 'Иә'
		},
		no: {
			ru: 'Нет',
			kz: 'Жоқ'
		}
	},
	school: {
		name: {
			ru: 'Название школы',
			kz: 'Мектеп атауы'
		},
		address: {
			ru: 'Адрес',
			kz: 'Мекенжай'
		},
		description: {
			ru: 'Описание',
			kz: 'Сипаттама'
		},
		email: {
			ru: 'Email',
			kz: 'Email'
		},
		phone: {
			ru: 'Телефон',
			kz: 'Телефон'
		}
	}
};

// Функция для получения перевода
export function getTranslation(key: string, language: 'ru' | 'kz'): string {
	const keys = key.split('.');
	let value: any = t;
	
	for (const k of keys) {
		if (value && typeof value === 'object' && k in value) {
			value = value[k];
		} else {
			return key; // Возвращаем ключ, если перевод не найден
		}
	}
	
	if (typeof value === 'object' && (language in value)) {
		return value[language];
	}
	
	return key; // Возвращаем ключ, если перевод не найден
}
