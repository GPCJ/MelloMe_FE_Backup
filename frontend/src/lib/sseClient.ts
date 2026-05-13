export interface SseEvent {
  id?: string;
  event: string;
  data: string;
}

export interface SseConnection {
  abort: () => void;
}

/**
 * fetch + ReadableStream 기반 SSE 클라이언트.
 * Authorization 헤더를 지원하기 위해 브라우저 EventSource 대신 사용.
 */
export function connectSSE(
  url: string,
  accessToken: string,
  onEvent: (event: SseEvent) => void,
  onError: (error: Error) => void,
  lastEventId?: string,
): SseConnection {
  const controller = new AbortController();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (lastEventId) {
    headers['Last-Event-ID'] = lastEventId;
  }

  (async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE_HTTP_${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream 미지원');

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent: Partial<SseEvent> = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          // 빈 라인 = 이벤트 경계
          if (line.trim() === '') {
            if (currentEvent.event && currentEvent.data) {
              onEvent(currentEvent as SseEvent);
            }
            currentEvent = {};
            continue;
          }

          // 주석 (하트비트 등)
          if (line.startsWith(':')) continue;

          const colonIndex = line.indexOf(':');
          if (colonIndex === -1) continue;

          const key = line.substring(0, colonIndex);
          const val = line.substring(colonIndex + 1).trimStart();

          if (key === 'id') currentEvent.id = val;
          else if (key === 'event') currentEvent.event = val;
          else if (key === 'data') currentEvent.data = val;
        }
      }

      // 스트림이 정상 종료된 경우 (서버 타임아웃 등)
      onError(new Error('SSE_STREAM_ENDED'));
    } catch (err) {
      if (controller.signal.aborted) return; // 의도적 종료
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  })();

  return { abort: () => controller.abort() };
}
