import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center space-y-3 pb-4">
        {/* Logo / marca */}
        <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-xl">SG</span>
        </div>
        <div>
          <CardTitle className="text-2xl">Somos Gastronómico</CardTitle>
          <CardDescription className="mt-1">
            Accede al panel de gestión
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
