
# Node Profiler

Simple profiler for Node. Get a CPU Profile, Heap Profile or Heap Snapshot that can then be loaded into VSCode or Chrome DevTools.

## Usage

Init the profiler with the desired type.
Optionally, a filename prefix can be added (default is `__`) as the second argument.

```javascript
import { Profiler } from '@eklingen/node-profiler'
const profiler = new Profiler('cpu') // Can be `cpu` (default), `heap` or `heap-snapshot`
```

Then start profiling.

```javascript:
profiler.start()
```

When enough data has been gathered, stop profiling.
The results will be written to disk with the current timestamp and given prefix as filename.
The filename will be returned.

```javascript:
const filename = profiler.stop() // Example: "__20240429121317474.cpuprofile"
```

## Dependencies

None.

---

Copyright (c) 2024 Elco Klingen. MIT License.
