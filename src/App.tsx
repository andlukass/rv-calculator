import TaxCalculator from '@/components/TaxCalculator'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">Calculadora de Recibos Verdes</h1>
        <TaxCalculator />
      </div>
    </div>
  )
}
