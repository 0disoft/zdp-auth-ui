/** Follow the input's root and notify only after an uncancelled native form reset. */
export function onInputFormReset(input: HTMLInputElement, reset: () => void): () => void {
  let root: Node | undefined;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const onReset = (event: Event) => {
    const form = input.form;
    if (!form || event.target !== form) return;
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!event.defaultPrevented && input.isConnected && input.form === form) reset();
    }, 0);
    timers.add(timer);
  };
  const Observer = input.ownerDocument.defaultView?.MutationObserver;
  const observer = Observer ? new Observer(records => {
    if (records.some(record => Array.from(record.removedNodes).some(removed => removed.contains(input)))) {
      refreshRoot();
    }
  }) : null;
  const refreshRoot = () => {
    const nextRoot = input.getRootNode();
    if (nextRoot !== root) {
      root?.removeEventListener('reset', onReset, true);
      root = nextRoot;
      root.addEventListener('reset', onReset, true);
    }
    // Reset does not cross a shadow boundary. Observe ancestor removals only.
    observer?.disconnect();
    for (let ancestor = input.parentNode; ancestor; ancestor = ancestor.parentNode) {
      observer?.observe(ancestor, { childList: true });
    }
  };
  refreshRoot();
  return () => {
    observer?.disconnect();
    root?.removeEventListener('reset', onReset, true);
    for (const timer of timers) clearTimeout(timer);
  };
}
