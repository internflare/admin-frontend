export interface QueryRequestTicket {
  signal: AbortSignal;
  isCurrent: () => boolean;
  cancel: () => void;
}

export function createQueryRequestGate() {
  let generation = 0;
  let controller: AbortController | undefined;

  function cancel() {
    generation++;
    controller?.abort();
    controller = undefined;
  }

  function begin(): QueryRequestTicket {
    cancel();
    const currentGeneration = generation;
    const requestController = new AbortController();
    controller = requestController;
    return {
      signal: requestController.signal,
      isCurrent: () => generation === currentGeneration && !requestController.signal.aborted,
      cancel: () => {
        if (generation === currentGeneration) cancel();
      },
    };
  }

  return { begin, cancel };
}
