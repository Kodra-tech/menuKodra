'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { createItem, updateItem } from '../_actions/menu'

type Category = { id: string; name: string }

type Item = {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  image_url: string | null
  tags: string[] | null
  prep_time_minutes: number | null
  is_available: boolean | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: Item | null
  categories: Category[]
  defaultCategoryId?: string
}

const TAGS_OPTIONS = ['vegetariano', 'vegano', 'picante', 'sin gluten', 'sin lactosa', 'popular']

export function ItemDialog({ open, onOpenChange, item, categories, defaultCategoryId }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [prepTime, setPrepTime] = useState('15')
  const [isAvailable, setIsAvailable] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (item) {
      setName(item.name)
      setDescription(item.description ?? '')
      setPrice(String(item.price))
      setCategoryId(item.category_id ?? '')
      setPrepTime(String(item.prep_time_minutes ?? 15))
      setIsAvailable(item.is_available ?? true)
      setTags(item.tags ?? [])
      setImageUrl(item.image_url ?? null)
      setImagePreview(item.image_url ?? null)
    } else {
      setName('')
      setDescription('')
      setPrice('')
      setCategoryId(defaultCategoryId ?? categories[0]?.id ?? '')
      setPrepTime('15')
      setIsAvailable(true)
      setTags([])
      setImageUrl(null)
      setImagePreview(null)
    }
  }, [item, open, defaultCategoryId, categories])

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview local
    setImagePreview(URL.createObjectURL(file))
    setUploading(true)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `items/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('menu-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      toast.error('Error al subir imagen')
      setImagePreview(imageUrl)
    } else {
      const { data } = supabase.storage.from('menu-images').getPublicUrl(path)
      setImageUrl(data.publicUrl)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !price || !categoryId) return
    setLoading(true)

    const input = {
      name,
      description,
      price: parseFloat(price),
      categoryId,
      imageUrl,
      tags,
      prepTimeMinutes: parseInt(prepTime),
      isAvailable,
    }

    const result = item ? await updateItem(item.id, input) : await createItem(input)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(item ? 'Platillo actualizado' : 'Platillo creado')
      onOpenChange(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar platillo' : 'Nuevo platillo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Imagen */}
          <div className="space-y-2">
            <Label>Imagen</Label>
            <div
              className="relative w-full h-36 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center cursor-pointer hover:border-zinc-400 transition-colors overflow-hidden"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <Image src={imagePreview} alt="preview" fill className="object-cover" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImagePreview(null)
                      setImageUrl(null)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-zinc-400">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">
                    {uploading ? 'Subiendo...' : 'Haz clic para subir imagen'}
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="item-name">Nombre *</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Taco de bistec"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="item-desc">Descripción</Label>
            <Textarea
              id="item-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingredientes o descripción breve..."
              rows={2}
            />
          </div>

          {/* Precio + Categoría */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="item-price">Precio *</Label>
              <Input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tiempo de preparación */}
          <div className="space-y-2">
            <Label htmlFor="item-prep">Tiempo de preparación (min)</Label>
            <Input
              id="item-prep"
              type="number"
              min="0"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {TAGS_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    tags.includes(tag)
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Disponible */}
          <div className="flex items-center gap-3">
            <Switch
              id="item-available"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
            />
            <Label htmlFor="item-available">Disponible</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
