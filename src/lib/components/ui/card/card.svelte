<script lang="ts">
	import { cn } from "$lib/utils/cn";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<div
	class={cn("rounded-[var(--radius)] border bg-card/90 text-card-foreground shadow-[var(--shadow)] backdrop-blur-[2px]", className)}
	{...$$restProps}
>
	<slot />
</div> 
