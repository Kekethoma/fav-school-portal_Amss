'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Upload, File, Tag, Trash2, Search } from 'lucide-react'

interface Resource {
    id: string
    title: string
    fileUrl: string
    fileType: string
    tags: string[]
    uploadedAt: string
}

export default function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [search, setSearch] = useState('')
    const [showUploadModal, setShowUploadModal] = useState(false)

    useEffect(() => {
        fetchResources()
    }, [])

    const fetchResources = async () => {
        try {
            const res = await fetch('/api/resources')
            const data = await res.json()
            setResources(data.resources || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setUploading(true)

        const formData = new FormData(e.currentTarget)
        const file = formData.get('file') as File
        const title = formData.get('title') as string

        try {
            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    fileName: file.name,
                    fileType: file.type
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setResources(prev => [data.resource, ...prev])
            setShowUploadModal(false)
        } catch (err) {
            alert('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#facc15] animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#16a34a] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/teacher/dashboard">
                        <Button variant="ghost" className="text-white hover:text-[#facc15]">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Teaching Resources</h1>
                    <Button variant="secondary" onClick={() => setShowUploadModal(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Resource
                    </Button>
                </div>

                <div className="flex gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#16a34a]"
                            placeholder="Search resources or tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredResources.map((res) => (
                        <Card key={res.id} className="border-white/10 bg-black/40 backdrop-blur-sm group hover:border-[#facc15]/50 transition-all">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 bg-[#16a34a]/20 rounded-lg flex items-center justify-center">
                                        <File className="h-5 w-5 text-[#16a34a]" />
                                    </div>
                                    <span className="text-[10px] text-gray-500">{new Date(res.uploadedAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-white font-bold mb-2 truncate" title={res.title}>{res.title}</h3>
                                <p className="text-gray-500 text-xs mb-4 uppercase tracking-wider">{res.fileType.split('/')[1] || 'FILE'}</p>

                                <div className="flex flex-wrap gap-1 mb-6">
                                    {res.tags.map(tag => (
                                        <span key={tag} className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[10px] text-gray-400 flex items-center">
                                            <Tag className="h-2 w-2 mr-1" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 text-xs">Download</Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredResources.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-500">
                            No resources found. Try uploading one!
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal (Simplified) */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md border-white/10 bg-[#1a1a1a]">
                        <CardHeader>
                            <CardTitle className="text-white">Upload New Resource</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Resource Title</label>
                                    <input
                                        name="title"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:ring-1 focus:ring-[#facc15]"
                                        placeholder="e.g. Algebra Worksheet"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Select File</label>
                                    <input
                                        type="file"
                                        name="file"
                                        required
                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#16a34a] file:text-white hover:file:bg-[#15803d]"
                                    />
                                </div>
                                <div className="pt-4 flex gap-2">
                                    <Button type="submit" variant="secondary" className="flex-1" disabled={uploading}>
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload & Tag with AI'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

