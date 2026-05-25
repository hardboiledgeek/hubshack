<script lang="ts">
  let { class: className = '' }: { class?: string } = $props()
</script>

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class={className}>
  <circle cx="12" cy="12" r="9" />
  <line x1="12" y1="3" x2="12" y2="5" />
  <line x1="12" y1="19" x2="12" y2="21" />
  <line x1="3" y1="12" x2="5" y2="12" />
  <line x1="19" y1="12" x2="21" y2="12" />
  <polyline points="12 6 14.5 12 12 10.5 9.5 12 12 6" fill="currentColor" />
</svg>
