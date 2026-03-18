<script lang="ts">
	import { goto } from '$app/navigation';
	import { apiClient } from '$lib/api/client';
	import BrandLogo from '$lib/components/BrandLogo.svelte';
	import {
		ArrowRight,
		Building2,
		Eye,
		EyeOff,
		Globe2,
		Lock,
		MapPin,
		Mail,
		Sparkles
	} from 'lucide-svelte';

	let loading = false;
	let error = '';
	let success = '';
	let showPassword = false;

	let formData = {
		nameRu: '',
		nameKz: '',
		email: '',
		password: '',
		addressRu: '',
		addressKz: '',
		descriptionRu: '',
		descriptionKz: '',
		logoUrl: ''
	};

	const highlightItems = [
		'Создайте цифровой профиль школы за 2 минуты',
		'Управляйте новостями, преподавателями и расписанием в одном месте',
		'Безопасный доступ для администрации и сотрудников'
	];

	async function handleSubmit() {
		loading = true;
		error = '';
		success = '';

		if (formData.password.trim().length < 6) {
			error = 'Пароль должен содержать минимум 6 символов';
			loading = false;
			return;
		}

		try {
			await apiClient.createSchool(formData);
			success = 'Школа успешно зарегистрирована. Переходим на страницу входа...';
			setTimeout(() => {
				goto('/login');
			}, 1800);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Произошла ошибка при регистрации';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Регистрация школы - Школьная система</title>
</svelte:head>

<main class="register-page">
	<div class="ambient ambient-a"></div>
	<div class="ambient ambient-b"></div>

	<section class="register-shell">
		<section class="form-panel">
			<header class="form-head">
				<div class="brand-row">
					<BrandLogo size={46} alt="Marti" />
					<div>
						<p class="eyebrow">Создание аккаунта</p>
						<h1>Регистрация школы</h1>
					</div>
				</div>
				<p class="subtext">
					Заполните ключевые данные школы. Остальные модули вы сможете настроить после входа в систему.
				</p>
			</header>

			<form on:submit|preventDefault={handleSubmit} class="register-form">
				<section class="form-section">
					<div class="section-head">
						<span class="section-icon"><Building2 size={16} /></span>
						<h2>Основная информация</h2>
					</div>

					<div class="form-grid two-col">
						<div class="field-block">
							<label for="nameRu">Название школы (русский)</label>
							<div class="field-shell">
								<span class="field-icon"><Building2 size={16} /></span>
								<input
									id="nameRu"
									type="text"
									bind:value={formData.nameRu}
									placeholder="Например: Школа-лицей №1"
									required
									disabled={loading}
									autocomplete="organization"
								/>
							</div>
						</div>

						<div class="field-block">
							<label for="nameKz">Название школы (казахский)</label>
							<div class="field-shell">
								<span class="field-icon"><Globe2 size={16} /></span>
								<input
									id="nameKz"
									type="text"
									bind:value={formData.nameKz}
									placeholder="Мысалы: №1 мектеп-лицейі"
									required
									disabled={loading}
								/>
							</div>
						</div>

						<div class="field-block full-width">
							<label for="email">Email</label>
							<div class="field-shell">
								<span class="field-icon"><Mail size={16} /></span>
								<input
									id="email"
									type="email"
									bind:value={formData.email}
									placeholder="school@example.com"
									required
									disabled={loading}
									autocomplete="email"
								/>
							</div>
						</div>

						<div class="field-block full-width">
							<label for="password">Пароль</label>
							<div class="field-shell">
								<span class="field-icon"><Lock size={16} /></span>
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									bind:value={formData.password}
									placeholder="Минимум 6 символов"
									minlength="6"
									required
									disabled={loading}
									autocomplete="new-password"
								/>
								<button
									type="button"
									class="password-toggle"
									on:click={() => (showPassword = !showPassword)}
									aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
									disabled={loading}
								>
									{#if showPassword}
										<EyeOff size={16} />
									{:else}
										<Eye size={16} />
									{/if}
								</button>
							</div>
						</div>
					</div>
				</section>

				<section class="form-section">
					<div class="section-head">
						<span class="section-icon"><MapPin size={16} /></span>
						<h2>Адрес и описание</h2>
					</div>

					<div class="form-grid two-col">
						<div class="field-block">
							<label for="addressRu">Адрес (русский)</label>
							<input
								id="addressRu"
								type="text"
								bind:value={formData.addressRu}
								placeholder="Город, улица, дом"
								disabled={loading}
								autocomplete="street-address"
							/>
						</div>

						<div class="field-block">
							<label for="addressKz">Адрес (казахский)</label>
							<input
								id="addressKz"
								type="text"
								bind:value={formData.addressKz}
								placeholder="Қала, көше, үй"
								disabled={loading}
							/>
						</div>

						<div class="field-block">
							<label for="descriptionRu">Описание (русский)</label>
							<textarea
								id="descriptionRu"
								bind:value={formData.descriptionRu}
								rows="4"
								placeholder="Коротко о школе, профиле и ценностях"
								disabled={loading}
							></textarea>
						</div>

						<div class="field-block">
							<label for="descriptionKz">Описание (казахский)</label>
							<textarea
								id="descriptionKz"
								bind:value={formData.descriptionKz}
								rows="4"
								placeholder="Мектеп туралы қысқаша сипаттама"
								disabled={loading}
							></textarea>
						</div>

						<div class="field-block full-width">
							<label for="logoUrl">URL логотипа (опционально)</label>
							<input
								id="logoUrl"
								type="url"
								bind:value={formData.logoUrl}
								placeholder="https://example.com/logo.png"
								disabled={loading}
							/>
						</div>
					</div>
				</section>

				{#if error}
					<div class="message message-error" role="alert">{error}</div>
				{/if}

				{#if success}
					<div class="message message-success" role="status">{success}</div>
				{/if}

				<button type="submit" class="submit-btn" disabled={loading}>
					{#if loading}
						<span class="spinner"></span>
						<span>Регистрируем...</span>
					{:else}
						<span>Зарегистрировать школу</span>
						<ArrowRight size={18} />
					{/if}
				</button>
			</form>

			<footer class="form-footer">
				<span>Уже есть аккаунт?</span>
				<a href="/login">Войти в систему</a>
			</footer>
		</section>

			<aside class="showcase-panel" aria-hidden="true">
				<div class="showcase-illustration">
					<img src="/illustrations/auth/register-school-illustration.svg" alt="" loading="lazy" />
					<div class="showcase-filter"></div>
				</div>

			<div class="showcase-body">
				<p class="showcase-kicker">Marti School Platform</p>
				<h2>Современный старт для вашей школы</h2>
				<p>
					Подключите школу к единой системе и начните управлять образовательными процессами без
					сложной настройки.
				</p>

				<ul class="showcase-list">
					{#each highlightItems as item}
						<li>
							<span class="list-icon"><Sparkles size={15} /></span>
							<span>{item}</span>
						</li>
					{/each}
				</ul>
			</div>
		</aside>
	</section>
</main>

<style>
	.register-page {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: clamp(1rem, 2.8vw, 2.4rem);
		position: relative;
		overflow: hidden;
		background:
			radial-gradient(circle at 10% 12%, rgb(56 189 248 / 0.2), transparent 35%),
			radial-gradient(circle at 92% 85%, rgb(14 165 233 / 0.18), transparent 38%),
			linear-gradient(140deg, #f4f8ff 0%, #edf4ff 45%, #eaf2ff 100%);
	}

	:global(.dark) .register-page {
		background:
			radial-gradient(circle at 10% 12%, rgb(56 189 248 / 0.15), transparent 42%),
			radial-gradient(circle at 92% 85%, rgb(14 165 233 / 0.14), transparent 44%),
			linear-gradient(145deg, #020617 0%, #0b1225 42%, #111827 100%);
	}

	.ambient {
		position: absolute;
		border-radius: 999px;
		filter: blur(70px);
		opacity: 0.48;
		pointer-events: none;
		z-index: 0;
	}

	.ambient-a {
		width: clamp(16rem, 24vw, 28rem);
		height: clamp(16rem, 24vw, 28rem);
		background: rgb(37 99 235 / 0.38);
		left: -8rem;
		top: -6rem;
	}

	.ambient-b {
		width: clamp(18rem, 28vw, 34rem);
		height: clamp(18rem, 28vw, 34rem);
		background: rgb(14 165 233 / 0.33);
		right: -10rem;
		bottom: -11rem;
	}

	.register-shell {
		position: relative;
		z-index: 1;
		width: min(1160px, 100%);
		display: grid;
		grid-template-columns: minmax(300px, 0.95fr) minmax(320px, 1.05fr);
		border-radius: 1.5rem;
		overflow: hidden;
		border: 1px solid rgb(148 163 184 / 0.2);
		background: rgb(255 255 255 / 0.72);
		backdrop-filter: blur(16px);
		box-shadow: 0 24px 60px rgb(15 23 42 / 0.16);
	}

	:global(.dark) .register-shell {
		background: rgb(2 6 23 / 0.65);
		border-color: rgb(148 163 184 / 0.25);
		box-shadow: 0 30px 70px rgb(2 6 23 / 0.52);
	}

	.form-panel {
		background:
			linear-gradient(180deg, rgb(255 255 255 / 0.83), rgb(255 255 255 / 0.93)),
			linear-gradient(135deg, #f8fbff 0%, #ecf3ff 100%);
		padding: clamp(1.2rem, 2.7vw, 2.2rem);
		display: grid;
		align-content: start;
		gap: 1.1rem;
		max-height: min(90vh, 960px);
		overflow: auto;
	}

	:global(.dark) .form-panel {
		background:
			linear-gradient(180deg, rgb(15 23 42 / 0.82), rgb(15 23 42 / 0.92)),
			linear-gradient(140deg, #0b1327 0%, #111827 100%);
	}

	.form-head {
		display: grid;
		gap: 0.68rem;
	}

	.brand-row {
		display: flex;
		align-items: center;
		gap: 0.85rem;
	}

	.eyebrow {
		margin: 0;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #0c4a6e;
	}

	:global(.dark) .eyebrow {
		color: #7dd3fc;
	}

	.form-head h1 {
		margin: 0.14rem 0 0;
		font-family: var(--font-display);
		font-size: clamp(1.45rem, 2vw, 1.95rem);
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.02em;
		color: #0f172a;
	}

	:global(.dark) .form-head h1 {
		color: #f8fafc;
	}

	.subtext {
		margin: 0;
		line-height: 1.55;
		color: #475569;
	}

	:global(.dark) .subtext {
		color: #94a3b8;
	}

	.register-form {
		display: grid;
		gap: 0.95rem;
	}

	.form-section {
		border-radius: 0.95rem;
		border: 1px solid rgb(148 163 184 / 0.26);
		background: rgb(255 255 255 / 0.72);
		padding: 0.95rem;
		display: grid;
		gap: 0.9rem;
	}

	:global(.dark) .form-section {
		background: rgb(15 23 42 / 0.54);
		border-color: rgb(148 163 184 / 0.24);
	}

	.section-head {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}

	.section-head h2 {
		margin: 0;
		font-size: 0.98rem;
		font-weight: 650;
		color: #0f172a;
	}

	:global(.dark) .section-head h2 {
		color: #e2e8f0;
	}

	.section-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 999px;
		background: rgb(14 165 233 / 0.15);
		color: #0369a1;
	}

	:global(.dark) .section-icon {
		background: rgb(14 165 233 / 0.2);
		color: #7dd3fc;
	}

	.form-grid {
		display: grid;
		gap: 0.78rem;
	}

	.two-col {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.field-block {
		display: grid;
		gap: 0.42rem;
	}

	.full-width {
		grid-column: 1 / -1;
	}

	.field-block label {
		font-size: 0.82rem;
		font-weight: 600;
		color: #334155;
	}

	:global(.dark) .field-block label {
		color: #cbd5e1;
	}

	.field-shell {
		position: relative;
		display: flex;
		align-items: center;
	}

	.field-icon {
		position: absolute;
		left: 0.68rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: #64748b;
		pointer-events: none;
	}

	:global(.dark) .field-icon {
		color: #94a3b8;
	}

	.field-shell input,
	.field-shell textarea,
	.form-grid > .field-block > input,
	.form-grid > .field-block > textarea {
		width: 100%;
		border-radius: 0.72rem;
		border: 1px solid rgb(148 163 184 / 0.4);
		background: rgb(255 255 255 / 0.9);
		color: #0f172a;
		font-size: 0.9rem;
		padding: 0.7rem 0.82rem;
		transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
	}

	.field-shell input {
		padding-left: 2.2rem;
	}

	.field-shell input:focus,
	.field-shell textarea:focus,
	.form-grid > .field-block > input:focus,
	.form-grid > .field-block > textarea:focus {
		outline: none;
		border-color: rgb(14 165 233 / 0.72);
		box-shadow: 0 0 0 3px rgb(14 165 233 / 0.16);
	}

	:global(.dark) .field-shell input,
	:global(.dark) .field-shell textarea,
	:global(.dark) .form-grid > .field-block > input,
	:global(.dark) .form-grid > .field-block > textarea {
		background: rgb(15 23 42 / 0.72);
		border-color: rgb(148 163 184 / 0.33);
		color: #e2e8f0;
	}

	:global(.dark) .field-shell input:focus,
	:global(.dark) .field-shell textarea:focus,
	:global(.dark) .form-grid > .field-block > input:focus,
	:global(.dark) .form-grid > .field-block > textarea:focus {
		border-color: rgb(56 189 248 / 0.72);
		box-shadow: 0 0 0 3px rgb(56 189 248 / 0.19);
	}

	.field-shell input::placeholder,
	.form-grid > .field-block > input::placeholder,
	.form-grid > .field-block > textarea::placeholder {
		color: #94a3b8;
	}

	:global(.dark) .field-shell input::placeholder,
	:global(.dark) .form-grid > .field-block > input::placeholder,
	:global(.dark) .form-grid > .field-block > textarea::placeholder {
		color: #64748b;
	}

	.form-grid > .field-block > textarea {
		resize: vertical;
		min-height: 92px;
	}

	.password-toggle {
		position: absolute;
		right: 0.4rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 0.5rem;
		border: none;
		background: transparent;
		color: #64748b;
		cursor: pointer;
		transition: background-color 180ms ease, color 180ms ease;
	}

	.password-toggle:hover:not(:disabled) {
		background: rgb(148 163 184 / 0.2);
		color: #0f172a;
	}

	.password-toggle:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	:global(.dark) .password-toggle {
		color: #94a3b8;
	}

	:global(.dark) .password-toggle:hover:not(:disabled) {
		background: rgb(148 163 184 / 0.22);
		color: #f8fafc;
	}

	.message {
		border-radius: 0.72rem;
		padding: 0.75rem 0.88rem;
		font-size: 0.88rem;
		line-height: 1.5;
	}

	.message-error {
		background: rgb(239 68 68 / 0.1);
		border: 1px solid rgb(239 68 68 / 0.32);
		color: #b91c1c;
	}

	.message-success {
		background: rgb(16 185 129 / 0.1);
		border: 1px solid rgb(16 185 129 / 0.32);
		color: #047857;
	}

	:global(.dark) .message-error {
		color: #fca5a5;
	}

	:global(.dark) .message-success {
		color: #6ee7b7;
	}

	.submit-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.48rem;
		width: 100%;
		height: 3rem;
		border-radius: 0.82rem;
		border: none;
		background: linear-gradient(120deg, #0284c7 0%, #2563eb 52%, #1d4ed8 100%);
		color: #f8fafc;
		font-weight: 650;
		font-size: 0.95rem;
		letter-spacing: 0.01em;
		cursor: pointer;
		box-shadow: 0 14px 30px rgb(37 99 235 / 0.3);
		transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
	}

	.submit-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 18px 34px rgb(37 99 235 / 0.33);
		filter: saturate(1.08);
	}

	.submit-btn:disabled {
		opacity: 0.78;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border-radius: 999px;
		border: 2px solid rgb(255 255 255 / 0.32);
		border-top-color: rgb(255 255 255 / 1);
		animation: spin 0.9s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.form-footer {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.88rem;
		color: #475569;
		padding-top: 0.1rem;
	}

	:global(.dark) .form-footer {
		color: #94a3b8;
	}

	.form-footer a {
		color: #0c4a6e;
		font-weight: 650;
		text-decoration: none;
	}

	.form-footer a:hover {
		text-decoration: underline;
	}

	:global(.dark) .form-footer a {
		color: #7dd3fc;
	}

	.showcase-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 660px;
		background: linear-gradient(170deg, rgb(7 16 34 / 0.94), rgb(11 26 48 / 0.86));
		color: #e2e8f0;
	}

	.showcase-illustration {
		position: relative;
		height: 48%;
		overflow: hidden;
	}

	.showcase-illustration img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.03);
	}

	.showcase-filter {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgb(15 23 42 / 0.08) 0%, rgb(15 23 42 / 0.78) 100%),
			radial-gradient(circle at 16% 16%, rgb(125 211 252 / 0.3), transparent 32%);
	}

	.showcase-body {
		padding: clamp(1.3rem, 2.8vw, 2.2rem);
		display: grid;
		gap: 0.9rem;
	}

	.showcase-kicker {
		margin: 0;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgb(125 211 252 / 0.95);
	}

	.showcase-body h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.24rem, 2.2vw, 1.74rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.24;
		color: #f8fafc;
	}

	.showcase-body p {
		margin: 0;
		line-height: 1.6;
		color: rgb(203 213 225 / 0.95);
		max-width: 52ch;
	}

	.showcase-list {
		list-style: none;
		display: grid;
		gap: 0.72rem;
		margin: 0.45rem 0 0;
		padding: 0;
	}

	.showcase-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		font-size: 0.94rem;
		line-height: 1.55;
		color: rgb(226 232 240 / 0.95);
	}

	.list-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.35rem;
		height: 1.35rem;
		margin-top: 0.1rem;
		border-radius: 999px;
		background: rgb(14 165 233 / 0.22);
		color: rgb(125 211 252);
		flex: none;
	}

	@media (prefers-reduced-motion: no-preference) {
		.register-shell {
			animation: shell-rise 470ms cubic-bezier(0.16, 1, 0.3, 1);
		}

		.showcase-illustration img {
			animation: illustration-drift 14s ease-in-out infinite;
		}
	}

	@keyframes shell-rise {
		from {
			opacity: 0;
			transform: translateY(14px) scale(0.985);
		}

		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes illustration-drift {
		0%,
		100% {
			transform: scale(1.03) translateY(0);
		}

		50% {
			transform: scale(1.045) translateY(-8px);
		}
	}

	@media (max-width: 1024px) {
		.register-shell {
			grid-template-columns: 1fr;
		}

		.showcase-panel {
			order: -1;
			min-height: 360px;
		}

		.showcase-illustration {
			height: 55%;
		}

		.form-panel {
			max-height: none;
		}
	}

	@media (max-width: 760px) {
		.register-page {
			padding: 0.65rem;
		}

		.showcase-panel {
			display: none;
		}

		.register-shell {
			border-radius: 1rem;
		}

		.form-panel {
			padding: 1rem;
		}

		.two-col {
			grid-template-columns: 1fr;
		}

		.form-footer {
			flex-wrap: wrap;
		}
	}
</style>
