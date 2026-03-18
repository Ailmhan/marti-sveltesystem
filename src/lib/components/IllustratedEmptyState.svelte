<script lang="ts">
	export let title: string;
	export let description: string;
	export let hint = '';
	export let illustration = '';
	export let alt = '';
</script>

<div class="relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-lg backdrop-blur-sm">
	<div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
	<div class="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-accent/15 blur-3xl"></div>

	<div class="relative grid gap-6 p-6 md:grid-cols-[1.35fr,1fr] md:items-center md:p-8">
		<div>
			<span class="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
				{hint ? hint : 'Soon'}
			</span>
			<h3 class="mt-4 text-2xl font-bold text-card-foreground md:text-3xl">{title}</h3>
			<p class="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>
		</div>

		<div class="flex justify-center md:justify-end">
			<div class="relative w-[170px] sm:w-[210px] md:w-[240px]">
				<div class="absolute inset-3 rounded-2xl bg-primary/10 blur-xl"></div>
				<img
					src={illustration}
					alt={alt || title}
					loading="lazy"
					decoding="async"
					class="relative h-auto w-full object-contain drop-shadow-[0_16px_28px_rgba(15,23,42,0.18)]"
				/>
			</div>
		</div>
	</div>
</div>
