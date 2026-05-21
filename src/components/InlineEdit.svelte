<script lang="ts">
  let {
    value,
    onCommit,
    onCancel,
    class: className = ''
  }: {
    value: string
    onCommit: (value: string) => void
    onCancel?: () => void
    class?: string
  } = $props()

  let draft = $state(value)
  let committed = false

  function commit() {
    if (committed) return
    committed = true
    const trimmed = draft.trim()
    if (trimmed === '') {
      onCancel?.()
    } else {
      onCommit(trimmed)
    }
  }

  function cancel() {
    if (committed) return
    committed = true
    onCancel?.()
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancel()
    }
  }

  function focusAndSelect(node: HTMLInputElement) {
    node.focus()
    node.select()
  }
</script>

<input
  type="text"
  bind:value={draft}
  onkeydown={onKeydown}
  onblur={commit}
  use:focusAndSelect
  class={className}
/>
