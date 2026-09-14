import Dexie from 'dexie'

// All data lives on-device (IndexedDB). Nothing is sent to any server.
// Users can export/import a JSON snapshot to back up or move data themselves (BYOS).
export const db = new Dexie('attendanceTrackerDB')

db.version(1).stores({
  // an "item" is a class / office / gym / anything the user tracks
  items: '++id, name, category, createdAt',
  // one row per day per item
  records: '++id, itemId, date, checkInAt, checkOutAt, status',
  // scheduled reminders, one per weekday per item
  reminders: '++id, itemId, weekday, windowStart, windowEnd, snoozedUntil'
})

export const CATEGORY = {
  CLASS: 'Class / Subject',
  OFFICE: 'Office / Shift',
  CUSTOM: 'Custom'
}

export const METHODS = [
  { id: 'manual', label: 'Manual tap' },
  { id: 'qr', label: 'QR code scan' },
  { id: 'location', label: 'Location check-in' },
  { id: 'biometric_signature', label: 'Biometric + signature (hybrid)' }
]

export const STATUS = {
  ON_TIME: 'on_time',
  LATE: 'late',
  ABSENT: 'absent',
  PENDING: 'pending'
}

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

export async function exportAllData() {
  const [items, records, reminders] = await Promise.all([
    db.items.toArray(),
    db.records.toArray(),
    db.reminders.toArray()
  ])
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), items, records, reminders }, null, 2)
}

export async function importAllData(json) {
  const data = JSON.parse(json)
  if (!data.items || !data.records) throw new Error('Invalid backup file')
  await db.transaction('rw', db.items, db.records, db.reminders, async () => {
    await db.items.clear()
    await db.records.clear()
    await db.reminders.clear()
    await db.items.bulkAdd(data.items)
    await db.records.bulkAdd(data.records)
    if (data.reminders) await db.reminders.bulkAdd(data.reminders)
  })
}
