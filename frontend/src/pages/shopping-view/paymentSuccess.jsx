import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { clearCart } from '@/store/shop/cartSlice'

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const dispatch = useDispatch()
  const [verificationStatus, setVerificationStatus] = useState('verifying') // 'verifying', 'success', 'failed'
  const API = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const verifyPayment = async () => {
      // Get payment parameters from URL that eSewa sends back
      const data = searchParams.get('data')

      console.log('Payment params:', { data })

      if (!data) {
        toast({
          title: 'Invalid payment link',
          description: 'Payment verification parameters are missing',
          variant: 'destructive'
        })
        setVerificationStatus('failed')
        return
      }

      try {
        // Call your backend to verify the payment with eSewa
        const response = await axios.post(`${API}/api/shop/payment/capture`, {
          data
        })

        if (response.data.success) {
          setVerificationStatus('success')
          dispatch(clearCart())
          toast({
            title: 'Payment Verified!',
            description: 'Your order has been confirmed successfully.'
          })
        } else {
          setVerificationStatus('failed')
          toast({
            title: 'Payment Verification Failed',
            description: response.data.message || 'Could not verify your payment',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setVerificationStatus('failed')
        toast({
          title: 'Verification Error',
          description: error.response?.data?.message || 'An error occurred while verifying payment',
          variant: 'destructive'
        })
      }
    }

    verifyPayment()
  }, [searchParams, API, toast])

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {verificationStatus === 'verifying' && 'Verifying Payment...'}
            {verificationStatus === 'success' && 'Payment Successful!'}
            {verificationStatus === 'failed' && 'Payment Verification Failed'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-6">
          {verificationStatus === 'verifying' && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
              <p className="text-center text-muted-foreground">
                Please wait while we verify your payment with eSewa...
              </p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-center text-muted-foreground">
                Your payment has been verified and your order is confirmed!
              </p>
              <Button 
                className="w-full" 
                onClick={() => navigate('/shop/account')}
              >
                View My Orders
              </Button>
            </>
          )}

          {verificationStatus === 'failed' && (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-center text-muted-foreground">
                We couldn't verify your payment. Please contact support if money was deducted.
              </p>
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => navigate('/shop/checkout')}
                >
                  Try Again
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => navigate('/shop/account')}
                >
                  View Orders
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentSuccessPage