<script lang="ts">
  let { class: className = '', direction = 'down' }: { class?: string; direction?: 'up' | 'down' | 'left' | 'right' } = $props()

  const rotations = { up: 'rotate(180)', down: 'rotate(0)', left: 'rotate(90)', right: 'rotate(-90)' }
</script>

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className} transform={rotations[direction]}>
  <polyline points="6 9 12 15 18 9" />
</svg>
