import promClient = require('prom-client')
import realtime = require('./realtime')

export function setupCustomPrometheusMetrics (): void {
  const onlineNotes = new promClient.Gauge({
    name: 'hedgedoc_online_notes',
    help: 'Notes currently being edited'
  })
  const onlineSessions = new promClient.Gauge({
    name: 'hedgedoc_online_sessions',
    help: 'Sessions currently editing notes',
    labelNames: ['type']
  })
  const onlineUsers = new promClient.Gauge({
    name: 'hedgedoc_online_users',
    help: 'Distinct users currently editing notes',
    labelNames: ['type']
  })
  const notesCount = new promClient.Gauge({
    name: 'hedgedoc_notes',
    help: 'Notes in the instance'
  })
  const registeredUsers = new promClient.Gauge({
    name: 'hedgedoc_registered_users',
    help: 'Users that registered in the instance'
  })
  const isConnectionBusy = new promClient.Gauge({
    name: 'hedgedoc_connection_busy',
    help: 'Indicates that realtime currently connecting'
  })
  const connectionSocketQueueGauge = new promClient.Gauge({
    name: 'hedgedoc_connection_socket_queue_length',
    help: 'Length of connection socket queue',
    // The last gauge provides the collect callback for all metrics
    collect () {
      realtime.getStatus(function (data: any) {
        onlineNotes.set(data.onlineNotes)
        onlineSessions.set({ type: 'all' }, data.onlineUsers)
        onlineSessions.set({ type: 'signed-in' }, data.onlineRegisteredUsers)
        onlineUsers.set({ type: 'all' }, data.distinctOnlineUsers)
        onlineUsers.set({ type: 'signed-in' }, data.distinctOnlineRegisteredUsers)
        notesCount.set(data.notesCount)
        registeredUsers.set(data.registeredUsers)
        isConnectionBusy.set(data.isConnectionBusy ? 1 : 0)
        connectionSocketQueueGauge.set(data.connectionSocketQueueLength)
      })
    }
  })
}
