// Profiler. Writes a file to disk that you can then open in Chrome inspector.
import { closeSync, openSync, writeFileSync, writeSync } from 'node:fs'
import { Session } from 'node:inspector/promises'
import { resolve as resolvePath } from 'node:path'

const timestamp = () => new Date().toISOString().replace(/[-.:]/g, '').replace(/(T|Z)/g, '')

export default class Profiler {
  constructor(type = 'cpu', prefix = '__') {
    this.session = null
    this.type = type
    this.prefix = prefix
    this.filename = ''
  }

  async start() {
    if (this.session || !this.type) {
      return
    }

    this.session = new Session()
    this.session.connect()

    if (this.type === 'cpu') {
      await this.session.post('Profiler.enable')
      await this.session.post('Profiler.start')
    } else if (this.type === 'heap') {
      await this.session.post('HeapProfiler.enable')
      await this.session.post('HeapProfiler.startSampling')
    }
  }

  async stop() {
    if (!this.session || !this.type) {
      return
    }

    if (this.type === 'cpu') {
      const { profile } = await this.session.post('Profiler.stop')
      this.filename = this.prefix + timestamp() + '.cpuprofile'

      writeFileSync(resolvePath(process.cwd(), this.filename), JSON.stringify(profile), { encoding: 'utf8', flush: true })
    } else if (this.type === 'heap') {
      const { profile } = await this.session.post('HeapProfiler.stopSampling')
      this.filename = this.prefix + timestamp() + '.heapprofile'

      writeFileSync(resolvePath(process.cwd(), this.filename), JSON.stringify(profile), { encoding: 'utf8', flush: true })
    } else if (this.type === 'heap-snapshot') {
      this.filename = this.prefix + timestamp() + '.heapsnapshot'
      const handle = openSync(resolvePath(process.cwd(), this.filename), 'w')

      this.session.on('HeapProfiler.addHeapSnapshotChunk', message => writeSync(handle, message.params.chunk))
      await this.session.post('HeapProfiler.takeHeapSnapshot')
      closeSync(handle)
    }

    this.session.disconnect()
    this.session = null

    return this.filename
  }
}
