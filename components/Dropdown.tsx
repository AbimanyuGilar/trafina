'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  align?: 'left' | 'right'
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi',
  className = '',
  disabled = false,
  align = 'left'
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs text-left text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-slate-400 transition-transform duration-200 shrink-0 ml-2",
            isOpen && "rotate-180 text-slate-600"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 min-w-[12rem] w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-100 focus:outline-none",
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {options.length === 0 ? (
            <div className="px-4 py-2.5 text-sm text-slate-400 text-center italic">
              Tidak ada pilihan
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors cursor-pointer",
                    isSelected ? 'bg-blue-50/50 text-blue-600 font-semibold' : 'text-slate-700'
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={16} className="text-blue-600 shrink-0 ml-2" />}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
