
// ===================================
// FRONTEND: checkout.jsx
// ===================================
import React, { useState } from 'react'
import image from '../../assets/Hero/compuertacamioneta.png'
import Address from '@/components/shopping-view/address'
import { useSelector } from 'react-redux'
import UserCartItemsContent from '@/components/shopping-view/cartItemsContent'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'

const ShoppingCheckout = () => {
  const { cartItems } = useSelector((state) => state.shopCart)
  const { user } = useSelector((state) => state.auth)
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null)
  const { toast } = useToast()
  const [isPaymentStart, setIsPaymentStart] = useState(false)
  const API = import.meta.env.VITE_API_BASE_URL
  const DELIVERY_CHARGE=100;

  const subtotal =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0 ? currentItem?.salePrice : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0
const totalCartAmount=DELIVERY_CHARGE+subtotal;
  // eSewa Payment Handler
  const handleEsewaPayment = async () => {
    if (!cartItems || cartItems.items.length === 0) {
      toast({ title: 'The cart is empty', variant: 'destructive' })
      return
    }
    if (!currentSelectedAddress) {
      toast({ title: 'Please select an address', variant: 'destructive' })
      return
    }

    setIsPaymentStart(true)

    try {
      const orderData = {
        userId: user?.id,
        cartId: cartItems?._id,
        cartItems: cartItems.items.map((item) => ({
          productId: item?.productId,
          title: item?.title,
          image: item?.image,
          price: item?.salePrice > 0 ? item?.salePrice : item?.price,
          quantity: item.quantity,
        })),
        addressInfo: {
          addressId: currentSelectedAddress?._id,
          address: currentSelectedAddress?.address,
          city: currentSelectedAddress?.city,
          pincode: currentSelectedAddress?.pincode,
          phone: currentSelectedAddress?.phone,
          notes: currentSelectedAddress?.notes,
        },
        orderStatus: 'pending',
        paymentMethod: 'esewa',
        paymentStatus: 'pending',
        totalAmount: totalCartAmount,
        orderDate: new Date(),
        orderUpdateDate: new Date(),
      }

      // Call backend to initiate eSewa payment
      const response = await axios.post(
        `${API}/api/shop/payment/create`, 
        orderData
      )

      if (response.data.success) {
        // Redirect to eSewa payment page via form submission
        const { payment_url, formData } = response.data;
        
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", payment_url);

        for (const key in formData) {
            const hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", formData[key]);
            form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
      } else {
        toast({ 
          title: 'Payment initiation failed', 
          description: response.data.message || 'Something went wrong',
          variant: 'destructive' 
        })
        setIsPaymentStart(false)
      }
    } catch (err) {
      console.error('eSewa payment error:', err)
      toast({ 
        title: 'Error initiating payment', 
        description: err.response?.data?.message || 'Something went wrong',
        variant: 'destructive' 
      })
      setIsPaymentStart(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* <div className="relative h-[300px] w-full overflow-hidden">
        <img src={image} className="h-full w-full object-cover object-center" />
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address 
          selectId={currentSelectedAddress} 
          setCurrentSelectedAddress={setCurrentSelectedAddress} 
        />

        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))
            : null}

          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
    <span>Delivery Charge</span>
    <span>Rs {DELIVERY_CHARGE}</span>
  </div>
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">Rs {totalCartAmount}</span>
            </div>
          </div>

          <div className="mt-4 w-full">
            <Button 
              onClick={handleEsewaPayment} 
              className="w-full"
              disabled={isPaymentStart}
            >
              {isPaymentStart ? 'Redirecting to eSewa...' : 'Pay with eSewa'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShoppingCheckout


// ===================================
// FRONTEND: PaymentSuccess.jsx
// (Create this file at: src/pages/shopping-view/PaymentSuccess.jsx)
// ===================================



// import React, { useState } from 'react'
// import image from '../../assets/Hero/compuertacamioneta.png'
// import Address from '@/components/shopping-view/address'
// import { useDispatch, useSelector } from 'react-redux'
// import UserCartItemsContent from '@/components/shopping-view/cartItemsContent'
// import { Button } from '@/components/ui/button'
// import { useToast } from '@/hooks/use-toast'
// import axios from 'axios'

// const ShoppingCheckout = () => {
//   const { cartItems } = useSelector((state) => state.shopCart)
//   const { user } = useSelector((state) => state.auth)
//   const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null)
//   const { toast } = useToast()
//   const [isPaymentStart, setIsPaymentStart] = useState(false)
//   const API=import.meta.env.VITE_API_BASE_URL;

//   const totalCartAmount =
//     cartItems && cartItems.items && cartItems.items.length > 0
//       ? cartItems.items.reduce(
//           (sum, currentItem) =>
//             sum +
//             (currentItem?.salePrice > 0 ? currentItem?.salePrice : currentItem?.price) *
//               currentItem?.quantity,
//           0
//         )
//       : 0

//   // 1️⃣ Initiate Khalti Payment
//   const handleKhaltiPayment = async () => {
//     if (!cartItems || cartItems.items.length === 0) {
//       toast({ title: 'The cart is empty', variant: 'destructive' })
//       return
//     }
//     if (!currentSelectedAddress) {
//       toast({ title: 'Please select an address', variant: 'destructive' })
//       return
//     }

//     setIsPaymentStart(true)

//     try {
//       // 2️⃣ Create order in backend
//       const orderData = {
//         userId: user?.id,
//         cartId: cartItems?._id,
//         cartItems: cartItems.items.map((item) => ({
//           productId: item?.productId,
//           title: item?.title,
//           image: item?.image,
//           price: item?.salePrice > 0 ? item?.salePrice : item?.price,
//           quantity: item.quantity,
//         })),
//         addressInfo: {
//           addressId: currentSelectedAddress?._id,
//           address: currentSelectedAddress?.address,
//           city: currentSelectedAddress?.city,
//           pincode: currentSelectedAddress?.pincode,
//           phone: currentSelectedAddress?.phone,
//           notes: currentSelectedAddress?.notes,
//         },
//         orderStatus: 'pending',
//         paymentMethods: 'khalti',
//         paymentStatus: 'pending',
//         totalAmount: totalCartAmount,
//         orderDate: new Date(),
//         orderUpdateDate: new Date(),
//       }

//       const res = await axios.post(`${API}/api/shop/payment/create`, orderData)
//       if (!res.data.success) {
//         toast({ title: 'Failed to create order', variant: 'destructive' })
//         setIsPaymentStart(false)
//         return
//       }

//       const orderId = res.data.orderId

//       // 3️⃣ Open Khalti Checkout
//       const config = {
//         publicKey: '71d5ef1f4bb943619a744e14431c7fd8',
//         productIdentity: orderId,
//         productName: 'Shopping Order',
//         productUrl:`http://localhost:5173/shop/listing/${orderId}`,
//         eventHandler: {
//           onSuccess: async (payload) => {
//             try {
//               const verifyRes = await axios.post(`${API}/api/shop/payment/capture`, {
//                 token: payload.token,
//                 amount: payload.amount,
//                 orderId,
//               })

//               if (verifyRes.data.success) {
//                 toast({ title: 'Payment successful!' })
//               } else {
//                 toast({ title: 'Payment verification failed', variant: 'destructive' })
//               }
//             } catch (err) {
//               toast({ title: 'Payment verification error', variant: 'destructive' })
//             }
//           },
//           onError: (error) => {
//             toast({ title: 'Payment failed', variant: 'destructive' })
//             console.log(error)
//           },
//           onClose: () => console.log('Khalti widget closed'),
//         },
//       }

//       const checkout = new window.KhaltiCheckout(config)
//       checkout.show({ amount: totalCartAmount * 100 }) // amount in paisa
//     } catch (err) {
//       console.log(err)
//       toast({ title: 'Error initiating payment', variant: 'destructive' })
//       setIsPaymentStart(false)
//     }
//   }

//   return (
//     <div className="flex flex-col">
//       <div className="relative h-[300px] w-full overflow-hidden">
//         <img src={image} className="h-full w-full object-cover object-center" />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
//         <Address selectId={currentSelectedAddress} setCurrentSelectedAddress={setCurrentSelectedAddress} />

//         <div className="flex flex-col gap-4">
//           {cartItems && cartItems.items && cartItems.items.length > 0
//             ? cartItems.items.map((item) => <UserCartItemsContent key={item.productId} cartItem={item} />)
//             : null}

//           <div className="mt-8 space-y-4">
//             <div className="flex justify-between">
//               <span className="font-bold">Total</span>
//               <span className="font-bold">Rs {totalCartAmount}</span>
//             </div>
//           </div>

//           <div className="mt-4 w-full">
//             <Button onClick={handleKhaltiPayment} className="w-full">
//               {isPaymentStart ? 'Processing Payment...' : 'Pay with Khalti'}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ShoppingCheckout



// import React, { useState } from 'react'
// import image from '../../assets/Hero/compuertacamioneta.png'
// import Address from '@/components/shopping-view/address'
// import { useDispatch, useSelector } from 'react-redux'
// import UserCartItemsContent from '@/components/shopping-view/cartItemsContent'
// import { Button } from '@/components/ui/button'
// import { createNewPayment } from '@/store/shop/paymentSlice'
// import { useToast } from '@/hooks/use-toast'

// const ShoppingCheckout = () => {

//   const {cartItems} = useSelector((state)=> state.shopCart)
//   const {user} = useSelector((state)=> state.auth)
//   const {approvalURL} = useSelector((state)=> state.shopPayment)
//   const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null)
//   const [isPaymentStart, setIsPaymentStar] = useState(false);
//   const dispatch = useDispatch();
//   const {toast} = useToast();

// console.log('ApprovalURL',approvalURL)
  

//   const totalCartAmount = cartItems && cartItems.items && cartItems.items.length > 0 ?
//     cartItems.items.reduce(
//       (sum,currentItem)=> sum + (currentItem?.salePrice > 0 ?
//         currentItem?.salePrice : currentItem?.price) * currentItem?.quantity, 0):0;
   

//   function handleInitiateMercadoPagoPayment(){

//     if(cartItems.length === 0){
//       toast({
//         title: 'The cart is empty, please add products',
//         variant: 'destructive',
//       })
//     }

//     if(currentSelectedAddress === null) {
//       toast({
//         title: 'Please select an address to proceed',
//         variant: 'destructive'
//       })
//       return;
//     }

//     const orderData ={
//       userId: user?.id, 
//       cartId: cartItems?._id,
//       cartItems : cartItems.items.map(singleCartItem =>({
//         productId: singleCartItem?.productId,
//         title: singleCartItem?.title,
//         image: singleCartItem?.image,
//         price: singleCartItem?.salePrice > 0 ? singleCartItem?.salePrice : singleCartItem?.price,
//         quantity: singleCartItem.quantity
//     })), 
//       addressInfo:{
//         addressId: currentSelectedAddress?._id,
//         address: currentSelectedAddress?.address,
//         city: currentSelectedAddress?.city,
//         pincode: currentSelectedAddress?.pincode,
//         phone: currentSelectedAddress?.phone,
//         notes: currentSelectedAddress?.notes,
//       }, 
//       orderStatus:'pending', 
//       paymentMethods:'mercadoPago', 
//       paymentStatus: 'pending', 
//       totalAmount: totalCartAmount, 
//       orderDate: new Date(), 
//       orderUpdateDate: new Date(), 
//       paymentId: '', 
//       payerId:''
//     }

//     dispatch(createNewPayment(orderData)).then((data)=>{
//     if(data?.payload?.success){
//       setIsPaymentStar(true)
//     } else {
//       setIsPaymentStar(false)
//     }
//   });
//   };

  
//   if(approvalURL){
//     window.location.href = approvalURL
//   }
   


//   return (
//     <div className='flex flex-col' >  
//       <div className='relative h-[300px] w-full overflow-hidden'>
//         <img 
//         src={image}
//         className='h-full w-full object-cover object-center'
//         />
//       </div>
//       <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5'>
//         <Address selectId={currentSelectedAddress} setCurrentSelectedAddress={setCurrentSelectedAddress}/>
//         <div className='flex flex-col gap-4'>
//           {
//             cartItems && cartItems.items && cartItems.items.length > 0 ?
//             cartItems.items.map((item)=><UserCartItemsContent cartItem={item}/>): null
//           }
//           <div className='mt-8 space-y-4'>
//           <div className='flex justify-between'>
//             <span className='font-bold'>Total</span>
//             <span className='font-bold'>${totalCartAmount}</span>
//           </div>
//         </div>
//         <div className='mt-4 w-full'>
//           <Button onClick={handleInitiateMercadoPagoPayment} className='w-full'>
//             {
//               isPaymentStart ? 'Purchase Confirmed...' : 'Pay with MercadoPago'
//             }
//           </Button>
//         </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ShoppingCheckout