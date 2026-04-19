'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadFiles() }, [])

  async function loadFiles() {
    const { data } = await supabase.from('files').select('*').order('created_at', { ascending: false })
    if (data) {
      const withUrls = await Promise.all(data.map(async f => ({
        ...f,
        url: supabase.storage.from('files').getPublicUrl(f.storage_path).data.publicUrl
      })))
      setFiles(withUrls)
    }
  }

  async function uploadFile(e: any) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const filePath = `uploads/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
    await supabase.storage.from('files').upload(filePath, file)
    await supabase.from('files').insert({ name: file.name, size: file.size, storage_path: filePath })
    await loadFiles()
    setUploading(false)
  }

  async function deleteFile(file: any) {
    if (!confirm('Удалить?')) return
    await supabase.storage.from('files').remove([file.storage_path])
    await supabase.from('files').delete().eq('id', file.id)
    await loadFiles()
  }

  return (
    <div style={{ padding: 20, color: 'white', fontFamily: 'sans-serif' }}>
      <h1>📁 FileDrop</h1>
      <input type="file" onChange={uploadFile} disabled={uploading} />
      {uploading && <p>Загрузка...</p>}
      {files.map(f => (
        <div key={f.id} style={{ background: '#222', margin: 10, padding: 10, borderRadius: 8 }}>
          <a href={f.url} target="_blank">{f.name}</a> ({(f.size / 1024).toFixed(1)} KB)
          <a href={f.url} download style={{ marginLeft: 10 }}>⬇️</a>
          <button onClick={() => deleteFile(f)} style={{ marginLeft: 10 }}>🗑️</button>
        </div>
      ))}
    </div>
  )
}
