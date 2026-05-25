<script lang="ts">
  let { class: className = '' }: { class?: string } = $props()
</script>

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class={className}>
  <path d="M12 6.5 A5.5 5.5 0 1 1 6.5 12" />
  <path d="M12 9.5 A2.5 2.5 0 1 1 9.5 12" />
  <circle cx="12" cy="12" r="0.5" fill="currentColor" />
</svg>
