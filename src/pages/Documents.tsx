import { useState, useRef } from 'react'
import { Upload, Trash2, Download, FolderOpen, File } from 'lucide-react'
import AppShell from '@/components/Layout/AppShell'
import Card from '@/components/Common/Card'
import Badge from '@/components/Common/Badge'
import Button from '@/components/Common/Button'
import EmptyState from '@/components/Common/EmptyState'
import { Select } from '@/components/Common/Input'
import { useStore } from '@/utils/store'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/helpers'
import type { DocCategory, Document } from '@/types'

const CATEGORIES: DocCategory[] = ['Personal', 'Work', 'Finance', 'ID & Passports', 'Education', 'Other']
const ALLOWED_MIME = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/zip']

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const catColor: Record<DocCategory, string> = {
  Personal: 'blue', Work: 'green', Finance: 'purple', 'ID & Passports': 'orange', Education: 'yellow', Other: 'gray',
}

export default function Documents() {
  const { state, dispatch } = useStore()
  const [filter, setFilter] = useState<DocCategory | 'All'>('All')
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState<DocCategory>('Personal')
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = filter === 'All' ? state.documents : state.documents.filter((d) => d.category === filter)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !state.profile) return
    if (!ALLOWED_MIME.includes(file.type)) { alert('File type not allowed'); return }

    setUploading(true)
    const path = `${state.profile.id}/${category}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file)
    if (uploadError) { alert(uploadError.message); setUploading(false); return }

    const doc: Document = {
      id: crypto.randomUUID(),
      user_id: state.profile.id,
      file_name: file.name,
      file_path: path,
      category,
      size_bytes: file.size,
      mime_type: file.type,
      created_at: new Date().toISOString(),
    }
    const { data } = await supabase.from('documents').insert(doc).select().single()
    dispatch({ type: 'UPSERT_DOCUMENT', payload: (data ?? doc) as Document })
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(doc: Document) {
    await supabase.storage.from('documents').remove([doc.file_path])
    await supabase.from('documents').delete().eq('id', doc.id)
    dispatch({ type: 'DELETE_DOCUMENT', payload: doc.id })
  }

  async function handleDownload(doc: Document) {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <AppShell title="Documents">
      {/* Upload */}
      <Card className="mb-6">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DocCategory)}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
          <Button
            onClick={() => fileRef.current?.click()}
            loading={uploading}
            icon={<Upload size={16} />}
          >
            Upload
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.jpg,.png,.xls,.zip"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </Card>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {(['All', ...CATEGORIES] as (DocCategory | 'All')[]).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              filter === c
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Files */}
      {filtered.length === 0
        ? <EmptyState icon={<FolderOpen size={40} />} title="No documents" description="Upload files using the button above" />
        : (
          <div className="space-y-2">
            {filtered.map((doc) => (
              <Card key={doc.id} className="flex items-center gap-3">
                <File size={20} className="text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{doc.file_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge color={catColor[doc.category] as 'blue'} className="text-[10px]">{doc.category}</Badge>
                    <span className="text-xs text-slate-400">{formatBytes(doc.size_bytes)}</span>
                    <span className="text-xs text-slate-400">{formatDate(doc.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleDownload(doc)} className="text-slate-400 hover:text-primary-600 transition-colors">
                    <Download size={16} />
                  </button>
                  <button onClick={() => handleDelete(doc)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )
      }
    </AppShell>
  )
}
