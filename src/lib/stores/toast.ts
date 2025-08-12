import { writable } from 'svelte/store';

export interface ToastMessage {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
	duration?: number;
}

function createToastStore() {
	const { subscribe, set, update } = writable<ToastMessage[]>([]);

	return {
		subscribe,
		show: (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 5000) => {
			const id = Date.now().toString();
			const toast: ToastMessage = { id, message, type, duration };
			
			update(toasts => [...toasts, toast]);

			// Auto remove toast after duration
			if (duration > 0) {
				setTimeout(() => {
					update(toasts => toasts.filter(t => t.id !== id));
				}, duration);
			}

			return id;
		},
		success: (message: string, duration: number = 5000) => {
			const id = Date.now().toString();
			const toast: ToastMessage = { id, message, type: 'success', duration };
			
			update(toasts => [...toasts, toast]);

			if (duration > 0) {
				setTimeout(() => {
					update(toasts => toasts.filter(t => t.id !== id));
				}, duration);
			}

			return id;
		},
		error: (message: string, duration: number = 5000) => {
			const id = Date.now().toString();
			const toast: ToastMessage = { id, message, type: 'error', duration };
			
			update(toasts => [...toasts, toast]);

			if (duration > 0) {
				setTimeout(() => {
					update(toasts => toasts.filter(t => t.id !== id));
				}, duration);
			}

			return id;
		},
		info: (message: string, duration: number = 5000) => {
			const id = Date.now().toString();
			const toast: ToastMessage = { id, message, type: 'info', duration };
			
			update(toasts => [...toasts, toast]);

			if (duration > 0) {
				setTimeout(() => {
					update(toasts => toasts.filter(t => t.id !== id));
				}, duration);
			}

			return id;
		},
		remove: (id: string) => {
			update(toasts => toasts.filter(t => t.id !== id));
		},
		clear: () => {
			set([]);
		}
	};
}

export const toastStore = createToastStore();