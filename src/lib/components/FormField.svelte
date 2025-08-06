<script lang="ts">
	export let label = '';
	export let id = '';
	export let type = 'text';
	export let value = '';
	export let placeholder = '';
	export let required = false;
	export let disabled = false;
	export let rows = 3;
	export let error = '';
</script>

<div class="form-field">
	<label for={id} class="form-label">
		{label}
		{#if required}
			<span class="required">*</span>
		{/if}
	</label>
	
	{#if type === 'textarea'}
		<textarea
			{id}
			bind:value
			{placeholder}
			{required}
			{disabled}
			{rows}
			class="form-input {error ? 'error' : ''}"
		></textarea>
	{:else}
		<input
			{id}
			{type}
			bind:value
			{placeholder}
			{required}
			{disabled}
			class="form-input {error ? 'error' : ''}"
		/>
	{/if}
	
	{#if error}
		<div class="form-error">{error}</div>
	{/if}
</div>

<style>
	.form-field {
		margin-bottom: 1.5rem;
	}

	.form-label {
		display: block;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.required {
		color: #dc2626;
		margin-left: 0.25rem;
	}

	.form-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: all 0.2s;
		background-color: white;
	}

	.form-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-input:disabled {
		background-color: #f9fafb;
		color: #6b7280;
		cursor: not-allowed;
	}

	.form-input.error {
		border-color: #dc2626;
	}

	.form-input.error:focus {
		border-color: #dc2626;
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}

	.form-error {
		color: #dc2626;
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}

	textarea.form-input {
		resize: vertical;
		min-height: 80px;
	}
</style> 