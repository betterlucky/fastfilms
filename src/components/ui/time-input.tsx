import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface TimeInputProps {
  name: string
  defaultValue?: string
  required?: boolean
}

export function TimeInput({ name, defaultValue = '7:00', required = false }: TimeInputProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    // Convert 24h time to 12h time for display
    if (!defaultValue) return ''
    const [hours, minutes] = defaultValue.split(':')
    const hour = parseInt(hours)
    return `${hour}:${minutes}`
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Keep the internal value in 24h format for form submission
    setDisplayValue(value)

    // Update the hidden input with 24h format (with leading zeros)
    const [hours, minutes] = value.split(':')
    const hour = parseInt(hours)
    const formattedValue = `${hour.toString().padStart(2, '0')}:${minutes}`
    
    // Update the hidden input that will be used for form submission
    const hiddenInput = document.querySelector(`input[name="${name}"]`) as HTMLInputElement
    if (hiddenInput) {
      hiddenInput.value = formattedValue
    }
  }

  return (
    <div className="relative">
      <Input
        type="time"
        value={displayValue}
        onChange={handleChange}
        required={required}
      />
      <input 
        type="hidden" 
        name={name} 
        value={displayValue.split(':')[0].padStart(2, '0') + ':' + displayValue.split(':')[1]}
      />
    </div>
  )
} 