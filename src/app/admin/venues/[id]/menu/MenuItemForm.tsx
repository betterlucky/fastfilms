'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"

interface Option {
  id?: string
  name: string
  description?: string
  minChoices: number
  maxChoices: number
  choices: Choice[]
}

interface Choice {
  id?: string
  name: string
  priceAdjustment: number
}

interface MenuItemFormProps {
  venueId: string
  initialData?: {
    id?: string
    name: string
    description: string
    price: number
    category: string
    isActive: boolean
    options: Option[]
  }
}

const CATEGORIES = ["Food", "Drink", "Combo"]

export default function MenuItemForm({ venueId, initialData }: MenuItemFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    category: initialData?.category || CATEGORIES[0],
    isActive: initialData?.isActive ?? true,
    options: initialData?.options || []
  })

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, {
        name: "",
        description: "",
        minChoices: 1,
        maxChoices: 1,
        choices: []
      }]
    }))
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const updateOption = (index: number, field: keyof Option, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }))
  }

  const addChoice = (optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex ? {
          ...option,
          choices: [...option.choices, { name: "", priceAdjustment: 0 }]
        } : option
      )
    }))
  }

  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex ? {
          ...option,
          choices: option.choices.filter((_, j) => j !== choiceIndex)
        } : option
      )
    }))
  }

  const updateChoice = (optionIndex: number, choiceIndex: number, field: keyof Choice, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex ? {
          ...option,
          choices: option.choices.map((choice, j) => 
            j === choiceIndex ? { ...choice, [field]: value } : choice
          )
        } : option
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/venues/${venueId}/menu${initialData?.id ? `/${initialData.id}` : ''}`, {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save menu item')
      }

      router.push(`/admin/venues/${venueId}/menu`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (£)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Options</h3>
              <Button type="button" onClick={addOption} variant="outline" size="sm">
                <PlusIcon className="size-4 mr-2" />
                Add Option
              </Button>
            </div>

            {formData.options.map((option, optionIndex) => (
              <div key={optionIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Option Name</Label>
                        <Input
                          value={option.name}
                          onChange={(e) => updateOption(optionIndex, 'name', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Min Choices</Label>
                        <Input
                          type="number"
                          min="1"
                          value={option.minChoices}
                          onChange={(e) => updateOption(optionIndex, 'minChoices', parseInt(e.target.value))}
                          required
                        />
                      </div>
                      <div>
                        <Label>Max Choices</Label>
                        <Input
                          type="number"
                          min="1"
                          value={option.maxChoices}
                          onChange={(e) => updateOption(optionIndex, 'maxChoices', parseInt(e.target.value))}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(optionIndex)}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Choices</h4>
                    <Button
                      type="button"
                      onClick={() => addChoice(optionIndex)}
                      variant="outline"
                      size="sm"
                    >
                      <PlusIcon className="size-4 mr-2" />
                      Add Choice
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <TrashIcon className="size-4 text-red-500" />
                      <span className="text-sm font-medium">Delete</span>
                    </div>
                    <div className="grid gap-4">
                      {option.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="flex items-center gap-2">
                          <Input
                            placeholder="Choice name"
                            value={choice.name}
                            onChange={(e) => updateChoice(optionIndex, choiceIndex, 'name', e.target.value)}
                            required
                          />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price adjustment"
                            value={choice.priceAdjustment}
                            onChange={(e) => updateChoice(optionIndex, choiceIndex, 'priceAdjustment', parseFloat(e.target.value))}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeChoice(optionIndex, choiceIndex)}
                          >
                            <TrashIcon className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : (initialData?.id ? "Update" : "Create")}
        </Button>
      </div>
    </form>
  )
} 