<script lang="ts">
	import { goto } from '$app/navigation';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import BrandLogo from '$lib/components/BrandLogo.svelte';
	import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-svelte';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	let showPassword = false;

	const featureItems = [
		'Единый доступ ко всем школьным модулям',
		'Безопасная авторизация и контроль данных',
		'Актуальная информация для администрации и педагогов'
	];

	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			const response = await apiClient.login(email, password);
			await authStore.login(response.token);
			goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка входа';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Вход - Школьная система</title>
</svelte:head>

<main class="login-page">
	<div class="ambient ambient-a"></div>
	<div class="ambient ambient-b"></div>

	<section class="login-shell">
		<aside class="showcase-panel">
				<div class="showcase-illustration">
					<img src="/illustrations/auth/login-school-illustration.svg" alt="" loading="lazy" />
					<div class="showcase-filter"></div>
				</div>
			<div class="showcase-body">
				<div class="showcase-brand">
					<BrandLogo size={52} alt="Marti" />
					<div class="showcase-brand-copy">
						<p class="showcase-kicker">Marti School Platform</p>
						<h1>Цифровая среда для современных школ</h1>
					</div>
				</div>
				<p class="showcase-description">
					Управляйте новостями, расписанием, учителями и школьными данными в одной системе.
				</p>
				<ul class="showcase-list">
					{#each featureItems as item}
						<li>
							<span class="list-icon"><ShieldCheck size={16} strokeWidth={2.2} /></span>
							<span>{item}</span>
						</li>
					{/each}
				</ul>
			</div>
		</aside>

		<section class="form-panel">
			<div class="form-head">
				<p class="eyebrow">Вход в систему</p>
				<h2>Рады видеть снова</h2>
				<p class="subtext">Введите данные школы, чтобы продолжить работу.</p>
			</div>

			<form on:submit|preventDefault={handleSubmit} class="auth-form">
				<div class="field-block">
					<label for="email">Email</label>
					<div class="field-shell">
						<span class="field-icon"><Mail size={17} /></span>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="school@example.com"
							required
							disabled={loading}
							autocomplete="username"
						/>
					</div>
				</div>

				<div class="field-block">
					<label for="password">Пароль</label>
					<div class="field-shell">
						<span class="field-icon"><Lock size={17} /></span>
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="Введите пароль"
							required
							disabled={loading}
							autocomplete="current-password"
						/>
							<button
								type="button"
								class="password-toggle"
								on:click={() => (showPassword = !showPassword)}
								aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
								disabled={loading}
							>
							{#if showPassword}
								<EyeOff size={17} />
							{:else}
								<Eye size={17} />
							{/if}
						</button>
					</div>
				</div>

				{#if error}
					<div class="error-box" role="alert">{error}</div>
				{/if}

				<button type="submit" class="submit-btn" disabled={loading}>
					{#if loading}
						<span class="spinner"></span>
						<span>Входим...</span>
					{:else}
						<span>Войти</span>
						<ArrowRight size={18} />
					{/if}
				</button>
			</form>

			<div class="form-footer">
				<span>Новая школа в системе?</span>
				<a href="/register">Зарегистрировать аккаунт</a>
			</div>
		</section>
	</section>
</main>

<style>
	.login-page {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: clamp(1rem, 2.8vw, 2.4rem);
		position: relative;
		overflow: hidden;
		background:
			radial-gradient(circle at 8% 14%, rgb(56 189 248 / 0.2), transparent 34%),
			radial-gradient(circle at 92% 88%, rgb(59 130 246 / 0.2), transparent 36%),
			linear-gradient(138deg, #f4f8ff 0%, #eef4ff 47%, #e6f0ff 100%);
	}

	:global(.dark) .login-page {
		background:
			radial-gradient(circle at 8% 14%, rgb(56 189 248 / 0.18), transparent 40%),
			radial-gradient(circle at 92% 88%, rgb(139 92 246 / 0.16), transparent 40%),
			linear-gradient(140deg, #020617 0%, #0f172a 46%, #111827 100%);
	}

	.ambient {
		position: absolute;
		border-radius: 999px;
		filter: blur(64px);
		opacity: 0.5;
		pointer-events: none;
		z-index: 0;
	}

	.ambient-a {
		width: clamp(16rem, 24vw, 28rem);
		height: clamp(16rem, 24vw, 28rem);
		background: rgb(14 165 233 / 0.38);
		left: -8rem;
		top: -6rem;
	}

	.ambient-b {
		width: clamp(18rem, 28vw, 34rem);
		height: clamp(18rem, 28vw, 34rem);
		background: rgb(59 130 246 / 0.34);
		right: -9rem;
		bottom: -10rem;
	}

	.login-shell {
		position: relative;
		z-index: 1;
		width: min(1120px, 100%);
		display: grid;
		grid-template-columns: minmax(340px, 1.07fr) minmax(320px, 0.93fr);
		border-radius: 1.5rem;
		overflow: hidden;
		border: 1px solid rgb(148 163 184 / 0.18);
		background: rgb(255 255 255 / 0.72);
		backdrop-filter: blur(16px);
		box-shadow: 0 24px 60px rgb(15 23 42 / 0.18);
	}

	:global(.dark) .login-shell {
		background: rgb(2 6 23 / 0.62);
		border-color: rgb(148 163 184 / 0.25);
		box-shadow: 0 30px 70px rgb(2 6 23 / 0.52);
	}

	.showcase-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 620px;
		background: linear-gradient(165deg, rgb(7 16 34 / 0.92), rgb(15 23 42 / 0.82));
		color: #e2e8f0;
	}

	.showcase-illustration {
		position: relative;
		height: 47%;
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
			linear-gradient(180deg, rgb(15 23 42 / 0.12) 0%, rgb(15 23 42 / 0.76) 100%),
			radial-gradient(circle at 18% 16%, rgb(125 211 252 / 0.35), transparent 30%);
	}

	.showcase-body {
		padding: clamp(1.5rem, 2.8vw, 2.4rem);
		display: grid;
		gap: 1rem;
	}

	.showcase-brand {
		display: flex;
		align-items: center;
		gap: 0.95rem;
	}

	.showcase-brand-copy h1 {
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 2.2vw, 1.72rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: #f8fafc;
		line-height: 1.24;
		margin: 0.22rem 0 0;
	}

	.showcase-kicker {
		margin: 0;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgb(125 211 252 / 0.95);
	}

	.showcase-description {
		margin: 0.35rem 0 0;
		color: rgb(203 213 225 / 0.95);
		line-height: 1.6;
		max-width: 52ch;
	}

	.showcase-list {
		list-style: none;
		display: grid;
		gap: 0.75rem;
		padding: 0;
		margin: 0.9rem 0 0;
	}

	.showcase-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		color: rgb(226 232 240 / 0.95);
		font-size: 0.95rem;
		line-height: 1.55;
	}

	.list-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.4rem;
		height: 1.4rem;
		margin-top: 0.08rem;
		border-radius: 999px;
		background: rgb(14 165 233 / 0.22);
		color: rgb(125 211 252);
		flex: none;
	}

	.form-panel {
		background:
			linear-gradient(180deg, rgb(255 255 255 / 0.82), rgb(255 255 255 / 0.92)),
			linear-gradient(135deg, #f8fbff 0%, #ecf3ff 100%);
		padding: clamp(1.4rem, 3vw, 2.6rem);
		display: grid;
		align-content: center;
		gap: 1.32rem;
	}

	:global(.dark) .form-panel {
		background:
			linear-gradient(180deg, rgb(15 23 42 / 0.78), rgb(2 6 23 / 0.84)),
			linear-gradient(140deg, #0f172a 0%, #020617 100%);
	}

	.form-head h2 {
		margin: 0.3rem 0 0.35rem;
		font-family: var(--font-display);
		font-size: clamp(1.4rem, 2.2vw, 1.95rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: hsl(var(--foreground));
		line-height: 1.2;
	}

	.eyebrow {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: hsl(var(--primary));
	}

	.subtext {
		margin: 0;
		color: hsl(var(--muted-foreground));
		line-height: 1.58;
	}

	.auth-form {
		display: grid;
		gap: 1rem;
	}

	.field-block {
		display: grid;
		gap: 0.42rem;
	}

	.field-block label {
		font-size: 0.84rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.field-shell {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		border-radius: 0.86rem;
		border: 1px solid hsl(var(--border));
		background: hsl(var(--card) / 0.9);
		padding: 0 0.78rem;
		transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
	}

	.field-shell:focus-within {
		border-color: hsl(var(--primary) / 0.72);
		box-shadow: 0 0 0 3px hsl(var(--primary) / 0.16);
		background: hsl(var(--card));
	}

	.field-shell input {
		flex: 1;
		min-width: 0;
		height: 2.85rem;
		border: 0;
		background: transparent;
		font-size: 0.98rem;
		color: hsl(var(--foreground));
		outline: none;
	}

	.field-shell input::placeholder {
		color: hsl(var(--muted-foreground));
	}

	.field-icon {
		color: hsl(var(--muted-foreground));
		display: inline-flex;
		align-items: center;
		flex: none;
	}

	.password-toggle {
		border: 0;
		background: transparent;
		color: hsl(var(--muted-foreground));
		padding: 0.2rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		flex: none;
		cursor: pointer;
	}

	.password-toggle:hover:not(:disabled) {
		background: hsl(var(--secondary));
		color: hsl(var(--foreground));
	}

	.password-toggle:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.error-box {
		padding: 0.72rem 0.9rem;
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--destructive) / 0.35);
		background: hsl(var(--destructive) / 0.1);
		color: hsl(var(--destructive));
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.submit-btn {
		height: 3rem;
		border: 0;
		border-radius: 0.9rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0 1rem;
		font-weight: 600;
		font-size: 0.98rem;
		color: hsl(var(--primary-foreground));
		background: var(--gradient-brand);
		box-shadow: var(--shadow-md);
		cursor: pointer;
		transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
	}

	.submit-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		filter: saturate(1.1);
		box-shadow: var(--shadow-lg);
	}

	.submit-btn:disabled {
		opacity: 0.72;
		cursor: not-allowed;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid hsl(var(--primary-foreground) / 0.4);
		border-top-color: hsl(var(--primary-foreground));
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.form-footer {
		margin-top: 0.15rem;
		font-size: 0.92rem;
		color: hsl(var(--muted-foreground));
		display: flex;
		gap: 0.35rem;
		flex-wrap: wrap;
	}

	.form-footer a {
		text-decoration: none;
		color: hsl(var(--primary));
		font-weight: 700;
	}

	.form-footer a:hover {
		text-decoration: underline;
	}

	@media (max-width: 960px) {
		.login-shell {
			grid-template-columns: 1fr;
			max-width: 560px;
		}

		.showcase-panel {
			min-height: auto;
		}

		.showcase-illustration {
			height: 230px;
		}

		.showcase-list {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 560px) {
		.login-page {
			padding: 0.75rem;
		}

		.showcase-panel {
			display: none;
		}

		.form-panel {
			padding: 1.15rem;
		}

		.form-footer {
			font-size: 0.85rem;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.login-shell {
			animation: shell-rise 480ms cubic-bezier(0.16, 1, 0.3, 1);
		}

		.showcase-illustration img {
			animation: illustration-drift 14s ease-in-out infinite;
		}
	}

	@keyframes shell-rise {
		from {
			opacity: 0;
			transform: translateY(18px) scale(0.985);
		}

		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes illustration-drift {
		0%, 100% {
			transform: scale(1.03) translateY(0);
		}

		50% {
			transform: scale(1.06) translateY(-6px);
		}
	}
</style>
