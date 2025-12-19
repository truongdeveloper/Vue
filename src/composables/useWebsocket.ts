import { onUnmounted, ref } from "vue"

export function useWebsocket(url = 'ws://localhost:3001') {
  const ws = ref<WebSocket | null>(null)
  const messages = ref<any[]>([])
  const isConnected = ref(false)
  const error = ref<string | null>(null)

  const connect = () => {
    const token = localStorage.getItem('accessToken') || ''
    const fullUrl = `${url}?token=${token}`

    ws.value = new WebSocket(fullUrl)

    ws.value.onopen = () => {
      isConnected.value = true
      error.value = null
    }

    ws.value.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);
        const listData = messages.value;
        if(listData.length > 100) {
          listData.shift()
        }
        listData.push(data)
        messages.value = [...listData];
      } catch (err) {
        messages.value.push({ raw: event.data, error: true })
      }
    }

    ws.value.onerror = (err: any) => {
      error.value = 'WebSocket error'
      console.error('WS error:', err)
    }

    ws.value.onclose = (event: any) => {
      isConnected.value = false
      console.log('WS closed:', event.code, event.reason)
      // Auto reconnect sau 3s
      // setTimeout(connect, 3000)
    }
  }

  const send = (action: string, message: any = null) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ t: action, d: message }))
    } else {
      console.warn('Cannot send: WS not open yet')
    }
  }

  const disconnect = () => {
    ws.value?.close()
    ws.value = null
  }

  onUnmounted(disconnect)

  return {
    messages: messages,
    isConnected,
    error,
    send,
    disconnect,
    connect,
  }
}