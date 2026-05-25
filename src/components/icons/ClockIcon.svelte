<script lang="ts">
  let { class: className = '' }: { class?: string } = $props()
</script>

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class={className}>
  <circle cx="12" cy="12" r="9" />
  <polyline points="12 7 12 12 16 14" />
</svg>
