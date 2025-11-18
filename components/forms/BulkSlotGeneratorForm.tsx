'use client'

import { useState } from 'react'
import FormField from './FormField'
import Button from '@/components/ui/Button'
import { Zap } from 'lucide-react'

export interface BulkSlotParams {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  intervalMinutes: number
  capacity: number
  daysOfWeek: number[] // 0=dimanche, 1=lundi, etc.
}

interface BulkSlotGeneratorFormProps {
  onGenerate: (params: BulkSlotParams) => Promise<void>
  onCancel: () => void
}

export default function BulkSlotGeneratorForm({ onGenerate, onCancel }: BulkSlotGeneratorFormProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('14:00')
  const [endTime, setEndTime] = useState('18:00')
  const [intervalMinutes, setIntervalMinutes] = useState(30)
  const [capacity, setCapacity] = useState(5)
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]) // Aucun jour par défaut
  const [isGenerating, setIsGenerating] = useState(false)
  const [estimatedSlots, setEstimatedSlots] = useState(0)

  // Jours de la semaine : Lun -> Dim (1-0)
  const daysLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const daysValues = [1, 2, 3, 4, 5, 6, 0] // Correspondance avec getDay() où 0=dimanche

  const toggleDay = (day: number) => {
    const newDaysOfWeek = daysOfWeek.includes(day)
      ? daysOfWeek.filter((d) => d !== day)
      : [...daysOfWeek, day].sort()

    setDaysOfWeek(newDaysOfWeek)

    // Recalculer avec les nouveaux jours
    calculateEstimatedSlotsWithDays(newDaysOfWeek)
  }

  // Calculer le nombre estimé de créneaux avec des jours spécifiques
  const calculateEstimatedSlotsWithDays = (days: number[]) => {
    if (!startDate || !endDate || !startTime || !endTime || !intervalMinutes || days.length === 0) {
      setEstimatedSlots(0)
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Compter combien de jours correspondent aux jours sélectionnés
    let matchingDays = 0
    const currentDate = new Date(start)

    while (currentDate <= end) {
      if (days.includes(currentDate.getDay())) {
        matchingDays++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Calculer le nombre de créneaux par jour
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const slotsPerDay = Math.floor((endMinutes - startMinutes) / intervalMinutes)

    setEstimatedSlots(matchingDays * slotsPerDay)
  }

  // Calculer le nombre estimé de créneaux avec les jours actuels
  const calculateEstimatedSlots = () => {
    calculateEstimatedSlotsWithDays(daysOfWeek)
  }

  // Recalculer à chaque changement
  const handleChange = (field: string, value: any) => {
    switch (field) {
      case 'startDate':
        setStartDate(value as string)
        break
      case 'endDate':
        setEndDate(value as string)
        break
      case 'startTime':
        setStartTime(value as string)
        break
      case 'endTime':
        setEndTime(value as string)
        break
      case 'intervalMinutes':
        setIntervalMinutes(value as number)
        break
      case 'capacity':
        setCapacity(value as number)
        break
    }
    setTimeout(calculateEstimatedSlots, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate || !startTime || !endTime) {
      return
    }

    if (daysOfWeek.length === 0) {
      alert('Veuillez sélectionner au moins un jour de la semaine')
      return
    }

    setIsGenerating(true)
    try {
      await onGenerate({
        startDate,
        endDate,
        startTime,
        endTime,
        intervalMinutes,
        capacity,
        daysOfWeek,
      })
    } catch (error) {
      console.error('Error generating slots:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">Génération automatique de créneaux</h3>
          <p className="text-sm text-blue-700 mb-2">
            Créez plusieurs créneaux de <strong>livraison/enlèvement</strong> en une seule fois.
          </p>
          <p className="text-xs text-blue-600">
            ℹ️ Ces dates correspondent aux créneaux où les clients pourront venir chercher leurs commandes,
            pas aux dates de vente. Sélectionnez les jours de la semaine où vous serez disponibles pour les remises.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Date de début des remises"
          name="startDate"
          type="date"
          value={startDate}
          onChange={(value) => handleChange('startDate', value)}
          required
          help="Première date où vous serez disponible pour remettre les commandes"
        />

        <FormField
          label="Date de fin des remises"
          name="endDate"
          type="date"
          value={endDate}
          onChange={(value) => handleChange('endDate', value)}
          required
          help="Dernière date où vous serez disponible pour remettre les commandes"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Jours de disponibilité pour les remises
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Sélectionnez uniquement les jours où vous serez présents pour remettre les commandes
        </p>
        <div className="flex gap-2 flex-wrap">
          {daysLabels.map((label, index) => {
            const dayValue = daysValues[index]
            const isSelected = daysOfWeek.includes(dayValue)
            return (
              <button
                key={index}
                type="button"
                onClick={() => toggleDay(dayValue)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Heure de début"
          name="startTime"
          type="time"
          value={startTime}
          onChange={(value) => handleChange('startTime', value)}
          required
        />

        <FormField
          label="Heure de fin"
          name="endTime"
          type="time"
          value={endTime}
          onChange={(value) => handleChange('endTime', value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Intervalle (minutes)"
          name="intervalMinutes"
          type="number"
          value={intervalMinutes}
          onChange={(value) => handleChange('intervalMinutes', value)}
          required
          min={5}
          max={240}
          help="Durée entre chaque créneau"
        />

        <FormField
          label="Capacité par créneau"
          name="capacity"
          type="number"
          value={capacity}
          onChange={(value) => handleChange('capacity', value)}
          required
          min={1}
        />
      </div>

      {estimatedSlots > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong className="font-semibold">{estimatedSlots} créneaux de remise</strong> seront créés avec ces paramètres
          </p>
          <p className="text-xs text-green-700 mt-1">
            Les clients pourront choisir l'un de ces créneaux lors de leur commande
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isGenerating}>
          Annuler
        </Button>
        <Button type="submit" disabled={isGenerating || estimatedSlots === 0}>
          {isGenerating ? 'Génération...' : `Générer ${estimatedSlots} créneaux`}
        </Button>
      </div>
    </form>
  )
}
