<script lang="ts">
	import { cn } from "$lib/utils/cn";
	import { cva, type VariantProps } from "class-variance-authority";
	import type { HTMLButtonAttributes } from "svelte/elements";

	const buttonVariants = cva(
		"inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold tracking-[0.01em] ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
		{
			variants: {
				variant: {
					default: "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md hover:-translate-y-px hover:shadow-lg",
					destructive: "bg-destructive text-destructive-foreground shadow-md hover:-translate-y-px hover:bg-destructive/90 hover:shadow-lg",
					outline: "border border-input bg-background text-foreground hover:border-primary/40 hover:bg-secondary/70",
					secondary: "border border-input bg-secondary text-secondary-foreground hover:-translate-y-px hover:bg-secondary/85",
					ghost: "hover:bg-accent hover:text-accent-foreground",
					link: "text-primary underline-offset-4 hover:underline"
				},
				size: {
					default: "h-10 px-4 py-2",
					sm: "h-9 rounded-md px-3",
					lg: "h-11 rounded-lg px-8",
					icon: "h-10 w-10 rounded-full"
				}
			},
			defaultVariants: {
				variant: "default",
				size: "default"
			}
		}
	);

	type $$Props = HTMLButtonAttributes &
		VariantProps<typeof buttonVariants>;

	let className: $$Props["class"] = undefined;
	export { className as class };
	export let variant: $$Props["variant"] = undefined;
	export let size: $$Props["size"] = undefined;
</script>

<button
	class={cn(buttonVariants({ variant, size, className }))}
	{...$$restProps}
>
	<slot />
</button> 
