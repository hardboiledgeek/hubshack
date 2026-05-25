<script lang="ts">
  type Size = 'sm' | 'md' | 'lg'

  type Props = {
    size?: Size
    class?: string
  }

  const SIZE_CLASSES: Record<Size, string> = {
    lg: 'text-7xl drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]',
    md: 'text-5xl drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]',
    sm: 'text-xl drop-shadow-[0_0_4px_rgba(251,191,36,0.35)]'
  }

  let { size = 'md', class: className = '' }: Props = $props()

  const sizeClass = $derived(SIZE_CLASSES[size])
</script>

<span class="font-brand tracking-widest text-amber-300 {sizeClass} {className}">Hubshack</span>
