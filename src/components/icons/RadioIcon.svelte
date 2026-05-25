<script lang="ts">
  let { class: className = '' }: { class?: string } = $props()
</script>

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class={className}>
  <rect x="2" y="6" width="20" height="12" rx="1.5" />
  <circle cx="17.5" cy="12" r="2.25" />
  <line x1="6" y1="9.5" x2="6" y2="14.5" />
  <line x1="9" y1="9.5" x2="9" y2="14.5" />
  <line x1="12" y1="9.5" x2="12" y2="14.5" />
</svg>
