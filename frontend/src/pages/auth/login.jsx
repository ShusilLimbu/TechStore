import CommonForm from '@/components/common/form'
import { loginFormControls } from '@/config'
import { useToast } from '@/hooks/use-toast'
import { loginUser } from '@/store/auth-slice'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

const initialState = {
  email:'',
  password:'',
}

const Login = () => {

  const [formData, setFormData] = useState(initialState)
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event){
    event.preventDefault();

    // Validation
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return toast({ title: 'Valid email is required', variant: 'destructive' });
    }
    if (!formData.password) {
      return toast({ title: 'Password is required', variant: 'destructive' });
    }

    dispatch(loginUser(formData)).then((data)=>{
      console.log("Data",data)
      if(data?.payload?.success){
        toast({
          title: data?.payload?.message || "Login successful",
        });
      } else {
        toast({
          title: data?.payload?.message|| "Login failed",
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <div className='mx-auto w-full max-w-md space-y-6'>
        <div className="text-center">
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>Log In</h1>
            <p className='mt-2'>Don’t have an account? Sign Up
            <Link className ='font-medium ml-2 text-primary hover:underline' to='/auth/register'>Register</Link>
            </p>
           
        </div>
        <CommonForm
          formControls={loginFormControls}
          buttonText={'Log In'}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
        />
         <p className='mt-2'>
              <Link className ='font-medium text-primary hover:underline' to='/auth/forgot-password'>Forgot Password?</Link>
            </p>
    </div>
  )
}

export default Login